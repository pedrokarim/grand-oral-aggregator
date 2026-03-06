"use client";

import { useEffect, useState } from "react";
import { EmbedLink } from "./embed-link";
import { ExternalLink } from "lucide-react";
import { sanitizeDescription } from "@/lib/utils";
import { getThemeColor } from "@/lib/theme-colors";
import type { NewsArticle } from "@/lib/news";

interface ArticleWithVisited extends NewsArticle {
  visited?: boolean;
}

export function NewsFeed({ theme }: { theme?: string }) {
  const [articles, setArticles] = useState<ArticleWithVisited[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = theme
      ? `/api/news?theme=${encodeURIComponent(theme)}`
      : `/api/news`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les actualités");
        setLoading(false);
      });
  }, [theme]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-4">
            <div className="h-5 w-3/4 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
            <div className="h-4 w-full rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse mt-3" />
            <div className="h-4 w-2/3 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-6 text-center text-[#9EA096]">
        {error}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-6 text-center text-[#9EA096]">
        Aucune actualité disponible pour le moment.
      </div>
    );
  }

  return (
    <ul className="list-none m-0 p-0 grid gap-3 md:grid-cols-2">
      {articles.map((article, i) => {
        const color = getThemeColor(article.theme);
        const isRead = !!article.visited;
        const detailHref = article.slug ? `/actualites/${article.slug}` : article.url;

        return (
          <li key={i} className="relative">
            <div
              className={`rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] overflow-hidden
                bg-[#FDFDF8] dark:bg-[#1E1F23]
                hover:border-[#BFC1B7] dark:hover:border-[#555]
                hover:translate-y-[-1px] hover:scale-[1.01]
                active:translate-y-[1px] active:scale-[.99]
                transition-all h-full ${isRead ? "opacity-75" : ""}`}
            >
              {/* Stretched link covering the whole card */}
              <EmbedLink
                href={detailHref}
                className="absolute inset-0 z-0"
                aria-label={article.title}
              />

              {/* OG image thumbnail */}
              {article.image && (
                <div className="w-full h-32 overflow-hidden">
                  <img
                    src={article.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    {isRead && (
                      <span className="text-[10px] font-medium text-[#9EA096] bg-[#E5E7E0] dark:bg-[#2a2b2f] px-1.5 py-0.5 rounded">
                        Lu
                      </span>
                    )}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 text-[#9EA096] hover:text-[#4D4F46] dark:hover:text-[#EAECF6] transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <p className="text-[13px] text-[#9EA096] line-clamp-2 mt-2">
                  {sanitizeDescription(article.description)}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-full border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096]">
                    {article.favicon && (
                      <img src={article.favicon} alt="" className="w-3.5 h-3.5" />
                    )}
                    {article.source}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 text-[12px] font-medium rounded-md ${color.bgLight} ${color.text}`}>
                    {article.theme}
                  </span>
                  <span className="text-[12px] text-[#9EA096] ml-auto">
                    {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
