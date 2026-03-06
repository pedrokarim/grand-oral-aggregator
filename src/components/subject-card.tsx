"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import type { ThemeColor } from "@/lib/theme-colors";

interface SubjectCardProps {
  sujet: string;
  type: string;
  domaine: string;
  theme: string;
  color: ThemeColor;
}

export function SubjectCard({ sujet, type, domaine, theme, color }: SubjectCardProps) {
  const [settings] = useSettings();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function generateSummary() {
    if (summary) {
      setOpen(!open);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: sujet,
          theme,
          provider: settings.ai.provider,
          apiKey: settings.ai.apiKey,
          model: settings.ai.model,
          baseUrl: settings.ai.baseUrl,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSummary(data.summary);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setLoading(false);
    }
  }

  const hasAIConfig = settings.ai.apiKey || settings.ai.provider === "ollama";

  return (
    <div
      className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23]
        hover:border-[#BFC1B7] dark:hover:border-[#555] hover:translate-y-[-1px] active:translate-y-[1px]
        transition-all p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] leading-snug">
          {sujet}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {hasAIConfig && (
            <button
              onClick={generateSummary}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2 py-1 text-[12px] font-medium rounded-md
                border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f]
                text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]
                transition-colors cursor-default"
            >
              <Sparkles className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {summary ? (open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : "Résumé IA"}
            </button>
          )}
          <span className="inline-flex px-2 py-0.5 text-[12px] font-medium rounded-full border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096]">
            {type}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <span className="inline-flex px-2 py-0.5 text-[12px] uppercase font-medium rounded-md bg-[#E5E7E0] dark:bg-[#2a2b2f] text-[#4D4F46] dark:text-[#9EA096]">
          {domaine}
        </span>
        <span className={`inline-flex px-2 py-0.5 text-[12px] font-medium rounded-md ${color.bgLight} ${color.text}`}>
          {theme}
        </span>
      </div>

      {loading && (
        <div className="space-y-2 pt-3">
          <div className="h-4 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
          <div className="h-4 w-4/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-[13px] text-red-600 dark:text-red-400 pt-3">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {open && summary && (
        <div className="rounded-md bg-[#E5E7E0]/50 dark:bg-[#2a2b2f]/50 p-4 mt-3 border border-[#D2D3CC] dark:border-[#3a3b3f]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[#EB9D2A]" />
            <span className="text-[13px] font-medium text-[#23251D] dark:text-[#EAECF6]">Résumé IA</span>
          </div>
          <div className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
