"use client";

import { useEffect, useState } from "react";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { MarkdownContent } from "@/components/markdown-content";
import { SpeakButton } from "@/components/speak-button";

interface ThemeFicheProps {
  theme: string;
  subjects: string[];
}

export function ThemeFiche({ theme, subjects }: ThemeFicheProps) {
  const [settings] = useSettings();
  const [fiche, setFiche] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // On mount: check for cached fiche
  useEffect(() => {
    const { provider, model } = settings.ai;
    if (!provider || !model) return;
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      kind: "theme",
      theme,
      provider,
      model,
    });
    fetch(`/api/ai/summarize?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.summary) {
          setFiche(data.summary);
          setOpen(true);
        }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [theme, settings.ai.provider, settings.ai.model]);

  async function generate(force = false) {
    if (loading) return;
    if (fiche && !force) {
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
          kind: "theme",
          theme,
          subjects,
          provider: settings.ai.provider,
          apiKey: settings.ai.apiKey,
          model: settings.ai.model,
          baseUrl: settings.ai.baseUrl,
          force,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiche(data.summary);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setLoading(false);
    }
  }

  const hasAIConfig = settings.ai.apiKey || settings.ai.provider === "ollama";
  if (!hasAIConfig) return null;

  const buttonBase =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors disabled:opacity-60 cursor-default whitespace-nowrap";

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] p-4 flex flex-wrap items-center gap-2">
        <p className="text-[11px] uppercase tracking-wider text-[#9EA096] font-medium mr-2">
          Fiche complète du thème
        </p>
        <button
          onClick={() => generate(false)}
          disabled={loading}
          className={`${buttonBase} border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]`}
        >
          <Sparkles className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {fiche ? (open ? "Masquer la fiche" : "Afficher la fiche") : "Générer la fiche complète"}
        </button>
        {fiche && (
          <button
            onClick={() => generate(true)}
            disabled={loading}
            title="Régénérer la fiche en ignorant le cache"
            className={`${buttonBase} border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Régénérer
          </button>
        )}
      </div>

      {(loading || error || (open && fiche)) && (
        <section className="rounded-md bg-[#E5E7E0]/50 dark:bg-[#2a2b2f]/50 p-5 sm:p-8 border border-[#D2D3CC] dark:border-[#3a3b3f] space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D2D3CC]/60 dark:border-[#3a3b3f]/60">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#EB9D2A]" />
              <span className="text-[14px] font-semibold text-[#23251D] dark:text-[#EAECF6]">
                Fiche de révision — {theme}
              </span>
            </div>
            {open && fiche && <SpeakButton text={fiche} />}
          </div>

          {loading && (
            <div className="space-y-3 py-2">
              <p className="text-[12px] text-[#9EA096] animate-pulse">
                Génération de la fiche complète… ({subjects.length} sujets pris en compte)
              </p>
              <div className="h-3 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-3 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-[13px] text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {open && fiche && (
            <div className="[&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3 [&_h1]:mt-6 [&_h2]:mt-6 [&_h3]:mt-4 leading-7">
              <MarkdownContent>{fiche}</MarkdownContent>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
