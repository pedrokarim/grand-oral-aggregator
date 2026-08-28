"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AppSession } from "@/lib/ascencia/session";

interface WidgetConfig {
  clientId: string;
  issuer: string;
  redirectUri: string;
  siteName: string;
}

interface AscenciaWidget {
  signIn(options?: {
    screen?: "login" | "register";
    provider?: string;
    prompt?: "login" | "select_account" | "none";
    redirect?: boolean;
  }): Promise<unknown>;
  on(
    event: "signin" | "signout" | "refresh" | "error" | "cancelled",
    listener: (payload?: unknown) => void,
  ): () => void;
}

declare global {
  interface Window {
    AscenciaID?: AscenciaWidget;
  }
}

interface SessionContextValue {
  data: AppSession | null;
  isPending: boolean;
  isAuthReady: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const WIDGET_URL = "https://cdn.ascencia.re/id.js?v=ddb62e4";
const AUTH_CHANNEL = "grand-oral-auth";
const AUTH_STORAGE_KEY = "grand-oral:auth-change";
const AUTH_RETURN_KEY = "grand-oral:auth-return";
const AUTH_EVENT = "grand-oral-auth-change";
const SessionContext = createContext<SessionContextValue | null>(null);

function rememberReturnLocation(): void {
  if (!new URLSearchParams(window.location.search).has("code")) return;
  try {
    const raw = sessionStorage.getItem("ascencia:tx");
    const transaction = raw
      ? (JSON.parse(raw) as { href?: unknown })
      : null;
    if (typeof transaction?.href === "string") {
      const target = new URL(transaction.href, window.location.origin);
      if (target.origin === window.location.origin) {
        sessionStorage.setItem(AUTH_RETURN_KEY, target.href);
      }
    }
  } catch {
    // Le retour vers la page précédente est un confort, pas une dépendance.
  }
}

function notifyAuthChange(): void {
  window.dispatchEvent(new Event(AUTH_EVENT));
  try {
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.postMessage("refresh");
    channel.close();
  } catch {
    // Le fallback storage couvre les navigateurs sans BroadcastChannel.
  }
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, String(Date.now()));
  } catch {
    // Le stockage peut être interdit en navigation privée.
  }
  if (window.top && window.top !== window.self) {
    window.top.postMessage(
      { type: "grand-oral-auth-change" },
      window.location.origin,
    );
  }
}

async function loadWidgetConfig(): Promise<WidgetConfig> {
  const response = await fetch("/api/auth/config", {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Configuration Ascencia ID indisponible.");
  return response.json() as Promise<WidgetConfig>;
}

function injectWidget(config: WidgetConfig): Promise<void> {
  if (window.AscenciaID) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-grand-oral-ascencia]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("widget")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_URL;
    script.defer = true;
    script.dataset.grandOralAscencia = "";
    script.dataset.clientId = config.clientId;
    script.dataset.issuer = config.issuer;
    script.dataset.redirectUri = config.redirectUri;
    script.dataset.exchangeUrl = "/api/auth/exchange";
    script.dataset.scopes =
      "openid profile email offline_access ascencia.roles";
    script.dataset.siteName = config.siteName;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("widget")), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppSession | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`session ${response.status}`);
      const body = (await response.json()) as {
        authenticated: boolean;
        session?: AppSession;
      };
      if (mounted.current) {
        setData(body.authenticated ? (body.session ?? null) : null);
      }
    } catch {
      if (mounted.current) setData(null);
    } finally {
      if (mounted.current) setIsPending(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    rememberReturnLocation();
    void refetch();

    let cleanWidgetListeners: (() => void) | undefined;
    void loadWidgetConfig()
      .then(injectWidget)
      .then(() => {
        if (!mounted.current || !window.AscenciaID) return;
        setIsAuthReady(true);
        const unsubscribers = [
          window.AscenciaID.on("signin", () => {
            void refetch().then(notifyAuthChange);
          }),
          window.AscenciaID.on("error", () => {
            setError("La connexion avec Ascencia ID a échoué.");
          }),
        ];
        cleanWidgetListeners = () => {
          for (const unsubscribe of unsubscribers) unsubscribe();
        };
      })
      .catch(() => {
        if (mounted.current) {
          setError("Ascencia ID n’a pas pu être chargé.");
        }
      });

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(AUTH_CHANNEL);
      channel.addEventListener("message", () => void refetch());
    } catch {
      channel = null;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY) void refetch();
    };
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.data?.type === "grand-oral-auth-change"
      ) {
        void refetch();
      }
    };
    const handleLocalChange = () => void refetch();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("message", handleMessage);
    window.addEventListener(AUTH_EVENT, handleLocalChange);

    return () => {
      mounted.current = false;
      cleanWidgetListeners?.();
      channel?.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(AUTH_EVENT, handleLocalChange);
    };
  }, [refetch]);

  const value = useMemo(
    () => ({ data, isPending, isAuthReady, error, refetch }),
    [data, isPending, isAuthReady, error, refetch],
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession doit être utilisé dans AuthSessionProvider.");
  }
  return value;
}

export async function signIn(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (window.AscenciaID) {
      await window.AscenciaID.signIn();
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }
  throw new Error("Ascencia ID n’est pas prêt.");
}

export async function signOut(): Promise<void> {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("La déconnexion a échoué.");
  notifyAuthChange();
}

export function readAuthReturnLocation(): string | null {
  try {
    const target = sessionStorage.getItem(AUTH_RETURN_KEY);
    sessionStorage.removeItem(AUTH_RETURN_KEY);
    if (!target) return null;
    const url = new URL(target, window.location.origin);
    return url.origin === window.location.origin ? url.href : null;
  } catch {
    return null;
  }
}
