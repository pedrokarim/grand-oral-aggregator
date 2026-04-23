"use client";

import { useState, useEffect, useCallback } from "react";
import { type AppSettings, type AIProviderConfig, type TTSConfig, DEFAULT_SETTINGS } from "@/lib/settings";

const STORAGE_KEY = "grand-oral-settings";

type SettingsUpdate = Omit<Partial<AppSettings>, "ai" | "tts"> & {
  ai?: Partial<AIProviderConfig>;
  tts?: Partial<TTSConfig>;
};

export function useSettings(): [AppSettings, (update: SettingsUpdate) => void] {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai },
          tts: { ...DEFAULT_SETTINGS.tts, ...parsed.tts },
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const updateSettings = useCallback((update: SettingsUpdate) => {
    setSettings((prev) => {
      const { ai, tts, ...rest } = update;
      const next: AppSettings = { ...prev, ...rest };
      if (ai) next.ai = { ...prev.ai, ...ai };
      if (tts) next.tts = { ...prev.tts, ...tts };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return [settings, updateSettings];
}
