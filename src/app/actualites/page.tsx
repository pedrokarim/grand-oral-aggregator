"use client";

import { useEffect, useState } from "react";
import { EmbedLink } from "@/components/embed-link";
import { Newspaper, History, Trash2 } from "lucide-react";
import { NewsFeed } from "@/components/news-feed";
import { getHistory, clearHistory } from "@/lib/news-history";
import { getThemeColor } from "@/lib/theme-colors";
import type { NewsHistoryEntry } from "@/lib/news-history";

export default function ActualitesPage() {
  const [history, setHistory] = useState<NewsHistoryEntry[]>([]);

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#E5E7E0]/30 dark:bg-[#2a2b2f]/30 p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-[#EB9D2A]/10 p-3">
            <Newspaper className="h-8 w-8 text-[#EB9D2A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#23251D] dark:text-[#EAECF6]">
              Actualités
            </h1>
            <p className="text-[15px] text-[#9EA096]">
              Dernières actualités liées aux thèmes du Grand Oral
            </p>
          </div>
        </div>
      </div>

      {/* History section */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#9EA096]" />
              <h2 className="text-[15px] font-semibold text-[#23251D] dark:text-[#EAECF6]">
                Consultés récemment
              </h2>
            </div>
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1 text-[12px] text-[#9EA096] hover:text-[#4D4F46] dark:hover:text-[#EAECF6] transition-colors cursor-default"
            >
              <Trash2 className="h-3 w-3" />
              Effacer
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {history.slice(0, 8).map((entry) => {
              const color = getThemeColor(entry.theme);
              return (
                <EmbedLink
                  key={entry.slug}
                  href={`/actualites/${entry.slug}`}
                  className="shrink-0 w-56 rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-3
                    bg-[#FDFDF8] dark:bg-[#1E1F23]
                    hover:border-[#BFC1B7] dark:hover:border-[#555]
                    hover:translate-y-[-1px] active:translate-y-[1px]
                    transition-all"
                >
                  <p className="text-[13px] font-medium text-[#23251D] dark:text-[#EAECF6] leading-snug line-clamp-2">
                    {entry.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {entry.favicon && (
                      <img src={entry.favicon} alt="" className="w-3 h-3" />
                    )}
                    <span className="text-[11px] text-[#9EA096] truncate">{entry.source}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${color.bgLight} ${color.text}`}>
                      {entry.theme}
                    </span>
                  </div>
                </EmbedLink>
              );
            })}
          </div>
        </div>
      )}

      <NewsFeed />
    </div>
  );
}
