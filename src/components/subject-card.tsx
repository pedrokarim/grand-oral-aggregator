"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowUpRight,
  Lock,
  Unlock,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { MarkdownContent } from "@/components/markdown-content";
import { SpeakButton } from "@/components/speak-button";
import { EmbedLink } from "@/components/embed-link";
import { speak, stripMarkdown } from "@/lib/tts";
import { slugifySubject, type SubjectAuthor } from "@/lib/data";
import type { ThemeColor } from "@/lib/theme-colors";

interface SubjectCardProps {
  sujet: string;
  type: string;
  domaine: string;
  theme: string;
  color: ThemeColor;
  /** "builtin" (JSON) or "user" (DB). Controls the author chip + owner menu. */
  source?: "builtin" | "user";
  /** DB id for user-created subjects — required for delete/toggle actions. */
  subjectId?: number;
  isPublic?: boolean;
  isMine?: boolean;
  author?: SubjectAuthor | null;
  /** When true, auto-trigger summary generation on mount (one-shot). Used after creation. */
  autoGenerate?: boolean;
  onDelete?: (id: number) => void;
  onTogglePublic?: (id: number, next: boolean) => void;
}

export function SubjectCard({
  sujet,
  type,
  domaine,
  theme,
  color,
  source = "builtin",
  subjectId,
  isPublic = true,
  isMine = false,
  author = null,
  autoGenerate = false,
  onDelete,
  onTogglePublic,
}: SubjectCardProps) {
  const [settings] = useSettings();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load cached summary for this subject under current AI config.
  useEffect(() => {
    const { provider, model } = settings.ai;
    if (!provider || !model) return;
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      subject: sujet,
      theme,
      provider,
      model,
      length: settings.summaryLength,
    });
    fetch(`/api/ai/summarize?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.summary) setSummary(data.summary);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [sujet, theme, settings.ai.provider, settings.ai.model, settings.summaryLength]);

  const hasAIConfig = settings.ai.apiKey || settings.ai.provider === "ollama";

  async function generateSummary(forceOpen = true) {
    if (summary) {
      if (forceOpen) setOpen(!open);
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
          length: settings.summaryLength,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSummary(data.summary);
      if (forceOpen) setOpen(true);

      if (forceOpen && settings.tts.autoPlay && data.summary) {
        speak(stripMarkdown(data.summary), settings.tts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setLoading(false);
    }
  }

  // One-shot auto-generation (after creation).
  const autoGenFired = useRef(false);
  useEffect(() => {
    if (!autoGenerate || autoGenFired.current) return;
    if (!hasAIConfig) return;
    if (summary || loading) return;
    autoGenFired.current = true;
    // Generate silently; don't auto-open so the list stays compact.
    void generateSummary(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, hasAIConfig, summary, loading]);

  const authorLabel = author?.displayName || author?.name || "utilisateur";
  const slug = slugifySubject(theme, sujet);

  return (
    <div
      className={`rounded-md border ${
        source === "user"
          ? "border-[#EB9D2A]/30 dark:border-[#EB9D2A]/25"
          : "border-[#D2D3CC] dark:border-[#3a3b3f]"
      } bg-[#FDFDF8] dark:bg-[#1E1F23]
        hover:border-[#BFC1B7] dark:hover:border-[#555] hover:translate-y-[-1px] active:translate-y-[1px]
        transition-all p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <EmbedLink
          href={`/sujets/${slug}`}
          className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] leading-snug hover:underline underline-offset-2 decoration-[#D2D3CC] dark:decoration-[#3a3b3f] flex-1"
        >
          {sujet}
        </EmbedLink>
        <div className="flex items-center gap-2 shrink-0 relative">
          {hasAIConfig && (
            <button
              onClick={() => generateSummary(true)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2 py-1 text-[12px] font-medium rounded-md
                border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f]
                text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]
                transition-colors cursor-default"
            >
              <Sparkles className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {summary
                ? open
                  ? <ChevronUp className="h-3 w-3" />
                  : <ChevronDown className="h-3 w-3" />
                : "Résumé IA"}
            </button>
          )}
          <EmbedLink
            href={`/sujets/${slug}`}
            title="Voir la fiche du sujet"
            className="inline-flex items-center gap-1 px-2 py-1 text-[12px] font-medium rounded-md
              border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f]
              text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]
              transition-colors"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </EmbedLink>
          <span className="inline-flex px-2 py-0.5 text-[12px] font-medium rounded-full border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096]">
            {type}
          </span>

          {isMine && subjectId !== undefined && (
            <>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                title="Actions"
                className="inline-flex items-center p-1 rounded-md text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f] transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute right-0 top-full mt-1 z-10 min-w-[180px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] shadow-lg py-1"
                >
                  <button
                    onClick={() => {
                      onTogglePublic?.(subjectId, !isPublic);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[13px] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f] inline-flex items-center gap-2"
                  >
                    {isPublic ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    {isPublic ? "Passer en privé" : "Rendre public"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer ce sujet ?")) {
                        onDelete?.(subjectId);
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <span className="inline-flex px-2 py-0.5 text-[12px] uppercase font-medium rounded-md bg-[#E5E7E0] dark:bg-[#2a2b2f] text-[#4D4F46] dark:text-[#9EA096]">
          {domaine}
        </span>
        <span className={`inline-flex px-2 py-0.5 text-[12px] font-medium rounded-md ${color.bgLight} ${color.text}`}>
          {theme}
        </span>
        {source === "user" && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] rounded-full bg-[#EB9D2A]/10 text-[#B17816] dark:text-[#EB9D2A]">
            {author?.image ? (
              <img src={author.image} alt="" className="w-3.5 h-3.5 rounded-full" />
            ) : null}
            Ajouté par @{authorLabel}
          </span>
        )}
        {source === "user" && !isPublic && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] rounded-full border border-[#EB9D2A]/40 text-[#B17816] dark:text-[#EB9D2A]">
            <Lock className="h-3 w-3" />
            Privé
          </span>
        )}
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
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#EB9D2A]" />
              <span className="text-[13px] font-medium text-[#23251D] dark:text-[#EAECF6]">Résumé IA</span>
            </div>
            <SpeakButton text={summary} />
          </div>
          <MarkdownContent>{summary}</MarkdownContent>
        </div>
      )}
    </div>
  );
}
