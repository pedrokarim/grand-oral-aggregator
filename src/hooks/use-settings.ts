"use client";

import { useState, useEffect, useCallback } from "react";
import { type AppSettings, DEFAULT_SETTINGS } from "@/lib/settings";

const STORAGE_KEY = "grand-oral-settings";

export function useSettings(): [AppSettings, (update: Partial<AppSettings>) => void] {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed, ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai } });
      }
    } catch {
      // ignore
    }
  }, []);

  const updateSettings = useCallback((update: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...update };
      if (update.ai) {
        next.ai = { ...prev.ai, ...update.ai };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return [settings, updateSettings];
}
