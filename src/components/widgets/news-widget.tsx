"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, RefreshCw, Newspaper } from "lucide-react";
import { getThemeColor } from "@/lib/theme-colors";
import type { NewsArticle } from "@/lib/news";
import type { WidgetComponentProps } from "@/lib/widgets-types";

const REFRESH_MS = 5 * 60 * 1000;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function NewsWidget({ onOpenRoute }: WidgetComponentProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setArticles(Array.isArray(data.articles) ? data.articles : []);
      setError(null);
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="h-full flex flex-col">
      {/* Sub-header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#D2D3CC] dark:border-[#3a3b3f] shrink-0">
        <Newspaper className="w-3.5 h-3.5 text-[#9EA096]" />
        <span className="text-[11px] uppercase tracking-wider text-[#9EA096] font-semibold">
          Toutes catégories
        </span>
        <button
          onClick={load}
          disabled={refreshing}
          className="ml-auto p-1 rounded-[5px] text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] hover:bg-[#E5E7E0]/60 dark:hover:bg-[#2a2b2f]/60 transition-colors cursor-default"
          aria-label="Rafraîchir"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
                <div className="h-2 w-1/2 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-[12px] text-[#9EA096]">{error}</div>
        ) : articles.length === 0 ? (
          <div className="p-4 text-center text-[12px] text-[#9EA096]">
            Aucune actualité pour le moment.
          </div>
        ) : (
          <ul className="m-0 p-0 list-none divide-y divide-[#D2D3CC]/60 dark:divide-[#3a3b3f]/60">
            {articles.map((a) => {
              const color = getThemeColor(a.theme);
              return (
                <li key={a.slug} className="p-2.5">
                  <button
                    onClick={() => onOpenRoute(`/actualites/${a.slug}`, `${a.slug}.mdx`)}
                    className="w-full text-left group cursor-default"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`inline-flex px-1.5 py-0 text-[10px] font-medium rounded ${color.bgLight} ${color.text}`}
                          >
                            {a.theme}
                          </span>
                          <span className="text-[10px] text-[#9EA096]">{timeAgo(a.publishedAt)}</span>
                        </div>
                        <p className="text-[12.5px] font-medium text-[#23251D] dark:text-[#EAECF6] leading-snug line-clamp-2 group-hover:text-[#EB9D2A] transition-colors">
                          {a.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {a.favicon && (
                            <img
                              src={a.favicon}
                              alt=""
                              className="w-3 h-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          )}
                          <span className="text-[11px] text-[#9EA096] truncate">{a.source}</span>
                        </div>
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="shrink-0 p-1 text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] transition-colors cursor-default"
                        aria-label="Lien externe"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
