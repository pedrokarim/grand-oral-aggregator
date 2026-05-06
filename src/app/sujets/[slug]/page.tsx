"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EmbedLink } from "@/components/embed-link";
import { MarkdownContent } from "@/components/markdown-content";
import { SpeakButton } from "@/components/speak-button";
import { speak, stripMarkdown } from "@/lib/tts";
import { ArrowLeft, Sparkles, AlertCircle, Lock } from "lucide-react";
import { getThemeColor } from "@/lib/theme-colors";
import { useSettings } from "@/hooks/use-settings";
import { getSubjectBySlug, slugify, type CustomSubject } from "@/lib/data";
import type { Subject } from "@/lib/data";
import { streamAISummary } from "@/lib/ai-stream-client";

type AnySubject =
  | (Subject & { source: "builtin" })
  | CustomSubject;

export default function SubjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [subject, setSubject] = useState<AnySubject | null | undefined>(undefined);

  const [settings] = useSettings();
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Lookup: try JSON synchronously, then fall back to DB via API for custom subjects.
  useEffect(() => {
    if (!slug) return;
    const fromJson = getSubjectBySlug(slug);
    if (fromJson) {
      setSubject({ ...fromJson, source: "builtin" });
      return;
    }
    const ctrl = new AbortController();
    fetch(`/api/subjects?slug=${encodeURIComponent(slug)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        setSubject(data?.subject ?? null);
      })
      .catch(() => setSubject(null));
    return () => ctrl.abort();
  }, [slug]);

  useEffect(() => {
    if (!subject) return;
    const { provider, model } = settings.ai;
    if (!provider || !model) return;
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      subject: subject.sujet,
      theme: subject.theme,
      provider,
      model,
      length: settings.summaryLength,
    });
    fetch(`/api/ai/summarize?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.summary) {
          setSummary(data.summary);
          setSummaryOpen(true);
        }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [subject?.sujet, subject?.theme, settings.ai.provider, settings.ai.model, settings.summaryLength]);

  async function generateSummary() {
    if (!subject) return;
    if (summary) {
      setSummaryOpen(!summaryOpen);
      return;
    }
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const payload = {
        subject: subject.sujet,
        theme: subject.theme,
        provider: settings.ai.provider,
        apiKey: settings.ai.apiKey,
        model: settings.ai.model,
        baseUrl: settings.ai.baseUrl,
        length: settings.summaryLength,
      };

      if (settings.ai.provider === "ollama") {
        setSummary("");
        setSummaryOpen(true);
        const streamedSummary = await streamAISummary(payload, setSummary);
        if (settings.tts.autoPlay && streamedSummary) {
          speak(stripMarkdown(streamedSummary), settings.tts);
        }
        return;
      }

      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary);
      setSummaryOpen(true);
      if (settings.tts.autoPlay && data.summary) {
        speak(stripMarkdown(data.summary), settings.tts);
      }
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setSummaryLoading(false);
    }
  }

  const hasAIConfig = settings.ai.apiKey || settings.ai.provider === "ollama";

  if (subject === undefined) {
    return (
      <div className="p-6 space-y-4 max-w-3xl">
        <div className="h-4 w-32 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
        <div className="h-24 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
      </div>
    );
  }

  if (subject === null) {
    return (
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-6 text-center text-[#9EA096] m-6">
        Sujet introuvable
      </div>
    );
  }

  const isCustom = subject.source === "user";
  const customAuthor = isCustom ? (subject as CustomSubject).author : null;
  const customPrivate = isCustom && !(subject as CustomSubject).isPublic;

  const color = getThemeColor(subject.theme);
  const themeSlug = slugify(subject.theme);
  const actionButtonBase =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors disabled:opacity-60 cursor-default whitespace-nowrap";

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <EmbedLink
        href={`/themes/${themeSlug}`}
        className="inline-flex items-center gap-1.5 text-[13px] text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour au thème
      </EmbedLink>

      {/* Header card */}
      <article className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] p-4 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-flex px-2 py-0.5 text-[12px] font-medium rounded-md ${color.bgLight} ${color.text}`}
          >
            {subject.theme}
          </span>
          <span className="inline-flex px-2 py-0.5 text-[12px] uppercase font-medium rounded-md bg-[#E5E7E0] dark:bg-[#2a2b2f] text-[#4D4F46] dark:text-[#9EA096]">
            {subject.domaine}
          </span>
          {isCustom && customAuthor && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] rounded-full bg-[#EB9D2A]/10 text-[#B17816] dark:text-[#EB9D2A]">
              {customAuthor.image ? (
                <img src={customAuthor.image} alt="" className="w-3.5 h-3.5 rounded-full" />
              ) : null}
              Ajouté par @{customAuthor.displayName || customAuthor.name}
            </span>
          )}
          {customPrivate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] rounded-full border border-[#EB9D2A]/40 text-[#B17816] dark:text-[#EB9D2A]">
              <Lock className="h-3 w-3" />
              Privé
            </span>
          )}
          <span className="inline-flex px-2 py-0.5 text-[12px] font-medium rounded-full border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096]">
            {subject.type}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#23251D] dark:text-[#EAECF6] leading-snug text-balance">
          {subject.sujet}
        </h1>
      </article>

      {/* Actions */}
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] p-4 flex flex-wrap items-center gap-2">
        <p className="text-[11px] uppercase tracking-wider text-[#9EA096] font-medium mr-2">
          Actions
        </p>
        {hasAIConfig && (
          <button
            onClick={generateSummary}
            disabled={summaryLoading}
            className={`${actionButtonBase} border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${summaryLoading ? "animate-spin" : ""}`} />
            {summary ? (summaryOpen ? "Masquer le résumé" : "Afficher le résumé") : "Générer le résumé IA"}
          </button>
        )}
        <SpeakButton text={subject.sujet} label="Écouter le sujet" />
      </div>

      {/* AI Summary — full width */}
      {(summaryLoading || summaryError || (summaryOpen && summary)) && (
        <section className="rounded-md bg-[#E5E7E0]/50 dark:bg-[#2a2b2f]/50 p-5 sm:p-8 border border-[#D2D3CC] dark:border-[#3a3b3f] space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D2D3CC]/60 dark:border-[#3a3b3f]/60">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#EB9D2A]" />
              <span className="text-[14px] font-semibold text-[#23251D] dark:text-[#EAECF6]">
                Résumé IA
              </span>
            </div>
            {summaryOpen && summary && <SpeakButton text={summary} />}
          </div>

          {summaryLoading && !summary && (
            <div className="space-y-3 py-2">
              <p className="text-[12px] text-[#9EA096] animate-pulse">
                Génération du résumé IA...
              </p>
              <div className="h-3 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
            </div>
          )}

          {summaryLoading && summary && (
            <p className="text-[12px] text-[#9EA096] animate-pulse">
              Génération en cours… le résumé s&apos;écrit au fur et à mesure.
            </p>
          )}

          {summaryError && (
            <div className="flex items-start gap-2 text-[13px] text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{summaryError}</span>
            </div>
          )}

          {summaryOpen && summary && (
            <div className="[&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3 [&_h1]:mt-6 [&_h2]:mt-6 [&_h3]:mt-4 leading-7">
              <MarkdownContent>{summary}</MarkdownContent>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
