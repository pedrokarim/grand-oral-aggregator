"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  type AppSettings,
  type AIProviderConfig,
  type TTSConfig,
  DEFAULT_SETTINGS,
  SERVER_BACKED_FIELDS,
} from "@/lib/settings";
import { useSession } from "@/lib/auth-client";

const STORAGE_KEY = "grand-oral-settings";

type SettingsUpdate = Omit<Partial<AppSettings>, "ai" | "tts"> & {
  ai?: Partial<AIProviderConfig>;
  tts?: Partial<TTSConfig>;
};

function readFromStorage(): Partial<AppSettings> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppSettings>) : null;
  } catch {
    return null;
  }
}

function writeToStorage(next: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function useSettings(): [AppSettings, (update: SettingsUpdate) => void] {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const session = useSession();
  const userId = session.data?.user?.id ?? null;
  const lastSyncedUserIdRef = useRef<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const parsed = readFromStorage();
    if (!parsed) return;
    setSettings({
      ...DEFAULT_SETTINGS,
      ...parsed,
      ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai },
      tts: { ...DEFAULT_SETTINGS.tts, ...parsed.tts },
    });
  }, []);

  // On login transition (null -> id): fetch server prefs and override local
  // for SERVER_BACKED_FIELDS. Other fields stay as local.
  useEffect(() => {
    if (!userId) {
      lastSyncedUserIdRef.current = null;
      return;
    }
    if (lastSyncedUserIdRef.current === userId) return;
    lastSyncedUserIdRef.current = userId;

    const ctrl = new AbortController();
    fetch("/api/user/preferences", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const prefs = data?.preferences;
        if (!prefs) return;
        setSettings((prev) => {
          const next = { ...prev };
          for (const field of SERVER_BACKED_FIELDS) {
            const v = prefs[field];
            if (v !== undefined && v !== null) {
              (next as Record<string, unknown>)[field] = v;
            }
          }
          writeToStorage(next);
          return next;
        });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [userId]);

  const updateSettings = useCallback(
    (update: SettingsUpdate) => {
      setSettings((prev) => {
        const { ai, tts, ...rest } = update;
        const next: AppSettings = { ...prev, ...rest };
        if (ai) next.ai = { ...prev.ai, ...ai };
        if (tts) next.tts = { ...prev.tts, ...tts };
        writeToStorage(next);

        // Mirror server-backed fields to DB when authenticated
        if (userId) {
          const serverPatch: Record<string, unknown> = {};
          for (const field of SERVER_BACKED_FIELDS) {
            if (field in rest) {
              serverPatch[field] = (rest as Record<string, unknown>)[field];
            }
          }
          if (Object.keys(serverPatch).length > 0) {
            fetch("/api/user/preferences", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(serverPatch),
            }).catch(() => {
              // best-effort; local is source of truth until next sync
            });
          }
        }

        return next;
      });
    },
    [userId],
  );

  return [settings, updateSettings];
}
