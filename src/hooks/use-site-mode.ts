"use client";

import { useCallback, useEffect, useState } from "react";

export type SiteMode = "desktop" | "site";

const STORAGE_KEY = "grand-oral-mode";
const EVENT = "grand-oral-mode-change";

function readStored(): SiteMode {
  if (typeof window === "undefined") return "desktop";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "site" ? "site" : "desktop";
  } catch {
    return "desktop";
  }
}

export function setSiteMode(mode: SiteMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: mode }));
}

export function useSiteMode(): [SiteMode, (mode: SiteMode) => void, boolean] {
  const [mode, setMode] = useState<SiteMode>("desktop");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMode(readStored());
    setHydrated(true);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<SiteMode>).detail;
      if (detail === "site" || detail === "desktop") setMode(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMode(readStored());
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = useCallback((next: SiteMode) => {
    setSiteMode(next);
  }, []);

  return [mode, update, hydrated];
}
