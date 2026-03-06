"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EmbedLink } from "@/components/embed-link";
import { ExternalLink, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
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

  async function generateSummary() {
    if (!article) return;
    if (summary) {
      setSummaryOpen(!summaryOpen);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: article.slug,
          subject: article.title,
          theme: article.theme,
          articleContent: article.content || undefined,
          provider: settings.ai.provider,
          apiKey: settings.ai.apiKey,
          model: settings.ai.model,
          baseUrl: settings.ai.baseUrl,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSummary(data.summary);
      setSummaryOpen(true);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setSummaryLoading(false);
    }
  }

  const hasAIConfig = settings.ai.apiKey || settings.ai.provider === "ollama";

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
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
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-6 text-center text-[#9EA096]">
        {error ?? "Article non trouvé"}
      </div>
    );
  }

  const color = getThemeColor(article.theme);
  const contentParagraphs = article.content?.split("\n\n").filter(Boolean) ?? [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back link */}
      <EmbedLink
        href="/actualites"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux actualités
      </EmbedLink>

      {/* Article card */}
      <article className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] overflow-hidden">
        {/* OG image */}
        {article.image && (
          <div className="w-full max-h-72 overflow-hidden">
            <img
              src={article.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Meta: source + date + theme badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {article.favicon && (
                <img src={article.favicon} alt="" className="w-4 h-4" />
              )}
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
            <span className={`inline-flex px-2 py-0.5 text-[12px] font-medium rounded-md ${color.bgLight} ${color.text}`}>
              {article.theme}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-[#23251D] dark:text-[#EAECF6] leading-snug">
            {article.title}
          </h1>

          {/* Content or description fallback */}
          {contentParagraphs.length > 0 ? (
            <div className="space-y-3">
              {contentParagraphs.map((p, i) => (
                <p key={i} className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#4D4F46] dark:text-[#9EA096] leading-relaxed">
              {sanitizeDescription(article.description)}
            </p>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#D2D3CC] dark:border-[#3a3b3f]">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md
                border border-[#D2D3CC] dark:border-[#3a3b3f]
                text-[#4D4F46] dark:text-[#9EA096]
                hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]
                transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Lire l&apos;article original
            </a>

            {hasAIConfig && (
              <button
                onClick={generateSummary}
                disabled={summaryLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md
                  border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f]
                  text-[#4D4F46] dark:text-[#9EA096]
                  hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]
                  transition-colors cursor-default"
              >
                <Sparkles className={`h-3.5 w-3.5 ${summaryLoading ? "animate-spin" : ""}`} />
                Résumé IA
              </button>
            )}
          </div>

          {/* AI Summary loading */}
          {summaryLoading && (
            <div className="space-y-2">
              <div className="h-4 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              <div className="h-4 w-4/6 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
            </div>
          )}

          {/* AI Summary error */}
          {summaryError && (
            <div className="flex items-center gap-2 text-[13px] text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              {summaryError}
            </div>
          )}

          {/* AI Summary result */}
          {summaryOpen && summary && (
            <div className="rounded-md bg-[#E5E7E0]/50 dark:bg-[#2a2b2f]/50 p-4 border border-[#D2D3CC] dark:border-[#3a3b3f]">
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
      </article>
    </div>
  );
}
