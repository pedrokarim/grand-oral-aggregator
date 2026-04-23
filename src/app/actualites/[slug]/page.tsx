"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EmbedLink } from "@/components/embed-link";
import { MarkdownContent } from "@/components/markdown-content";
import { SpeakButton } from "@/components/speak-button";
import { speak, stripMarkdown } from "@/lib/tts";
import { ExternalLink, ArrowLeft, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { getThemeColor } from "@/lib/theme-colors";
import { sanitizeDescription } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { addToHistory } from "@/lib/news-history";
import type { NewsArticle } from "@/lib/news";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings] = useSettings();
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [refetchError, setRefetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/news/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setArticle(data.article);
          addToHistory(data.article.slug);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger l'article");
        setLoading(false);
      });
  }, [slug]);

  // Restore any cached summary so it survives page reloads
  useEffect(() => {
    if (!article) return;
    const { provider, model } = settings.ai;
    if (!provider || !model) return;
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      slug: article.slug,
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
  }, [article?.slug, settings.ai.provider, settings.ai.model, settings.summaryLength]);

  async function generateSummary() {
    if (!article) return;
    if (summary) {
      setSummaryOpen(!summaryOpen);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      // If no content, try on-demand scraping first
      let articleContent = article.content || "";
      if (!articleContent && article.slug) {
        setSummaryError(null);
        const scrapeRes = await fetch(`/api/news/${article.slug}/scrape`, { method: "POST" });
        const scrapeData = await scrapeRes.json();
        if (scrapeData.content) {
          articleContent = scrapeData.content;
          // Update local article state so content shows in the page too
          setArticle({ ...article, content: articleContent });
        }
      }

      if (!articleContent) {
        setSummaryError(
          "Impossible d'extraire le contenu de l'article. Le résumé sera basé uniquement sur le titre."
        );
      }

      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: article.slug,
          subject: article.title,
          theme: article.theme,
          articleContent: articleContent || undefined,
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
      setSummaryOpen(true);
      setSummaryError(null);

      if (settings.tts.autoPlay && data.summary) {
        speak(stripMarkdown(data.summary), settings.tts);
      }
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function refetchContent() {
    if (!article || refetching) return;
    setRefetching(true);
    setRefetchError(null);
    try {
      const res = await fetch(`/api/news/${article.slug}/scrape?force=true`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Erreur lors du re-scraping");
      }
      setArticle({
        ...article,
        content: data.content,
        image: data.image ?? article.image,
      });
      setSummary(null);
      setSummaryOpen(false);
    } catch (err) {
      setRefetchError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setRefetching(false);
    }
  }

  const hasAIConfig = settings.ai.apiKey || settings.ai.provider === "ollama";

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="h-8 w-48 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
        <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-6 space-y-4">
          <div className="h-6 w-3/4 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
          <div className="h-48 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-6 text-center text-[#9EA096] m-6">
        {error ?? "Article non trouvé"}
      </div>
    );
  }

  const color = getThemeColor(article.theme);
  const contentParagraphs = article.content?.split("\n\n").filter(Boolean) ?? [];

  const actionButtonBase =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors disabled:opacity-60 cursor-default whitespace-nowrap";

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Back link */}
      <EmbedLink
        href="/actualites"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux actualités
      </EmbedLink>

      {/* Header card: meta + title + hero image */}
      <article className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] overflow-hidden">
        {article.image && (
          <div className="w-full aspect-[16/7] max-h-96 overflow-hidden bg-[#E5E7E0] dark:bg-[#2a2b2f]">
            <img
              src={article.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {article.favicon && <img src={article.favicon} alt="" className="w-4 h-4" />}
              <span className="text-[13px] font-medium text-[#4D4F46] dark:text-[#9EA096]">
                {article.source}
              </span>
            </div>
            <span className="text-[12px] text-[#9EA096]">
              {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 text-[12px] font-medium rounded-md ${color.bgLight} ${color.text}`}
            >
              {article.theme}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#23251D] dark:text-[#EAECF6] leading-snug text-balance">
            {article.title}
          </h1>
        </div>
      </article>

      {/* Body grid: content + sidebar on lg+, stacked below */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-5 items-start">
        {/* Main content */}
        <article className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] p-4 sm:p-6 min-w-0">
          {contentParagraphs.length > 0 ? (
            <div className="space-y-3 max-w-none">
              {contentParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] leading-relaxed max-w-none">
              {sanitizeDescription(article.description)}
            </p>
          )}
        </article>

        {/* Sidebar: actions + summary. Sticky on large screens. */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-[#9EA096] font-medium">Actions</p>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${actionButtonBase} border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Lire l&apos;article original
              </a>

              {hasAIConfig && (
                <button
                  onClick={generateSummary}
                  disabled={summaryLoading}
                  className={`${actionButtonBase} border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]`}
                >
                  <Sparkles
                    className={`h-3.5 w-3.5 ${summaryLoading ? "animate-spin" : ""}`}
                  />
                  Résumé IA
                </button>
              )}

              {(article.content || article.description) && (
                <SpeakButton
                  text={article.content || sanitizeDescription(article.description)}
                  label="Écouter l'article"
                />
              )}

              <button
                onClick={refetchContent}
                disabled={refetching}
                title="Re-télécharger le contenu de l'article depuis la source"
                className={`${actionButtonBase} border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]`}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${refetching ? "animate-spin" : ""}`}
                />
                {refetching ? "Re-scraping…" : "Re-scraper"}
              </button>
            </div>

            {refetchError && (
              <div className="flex items-start gap-2 text-[13px] text-red-600 dark:text-red-400 pt-1">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{refetchError}</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* AI Summary — full width so the résumé has room to breathe */}
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

          {summaryLoading && (
            <div className="space-y-3 py-2">
              <p className="text-[12px] text-[#9EA096] animate-pulse">
                {!article.content
                  ? "Extraction du contenu de l'article..."
                  : "Génération du résumé IA..."}
              </p>
              <div className="h-3 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
            </div>
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
