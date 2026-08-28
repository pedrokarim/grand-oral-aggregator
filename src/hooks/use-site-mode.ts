"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

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

function subscribe(onStoreChange: () => void): () => void {
  const onModeChange = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener(EVENT, onModeChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onModeChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSiteMode(): [SiteMode, (mode: SiteMode) => void, boolean] {
  const mode = useSyncExternalStore<SiteMode>(subscribe, readStored, () => "desktop");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const update = useCallback((next: SiteMode) => {
    setSiteMode(next);
  }, []);

  return [mode, update, hydrated];
}
