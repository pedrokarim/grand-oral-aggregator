"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmbedLink } from "@/components/embed-link";
import { slugifySubject } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import type { SearchLayoutProps } from "./types";

type Tab = "all" | "news" | "subjects" | "themes";

/**
 * LAYOUT 3 — Top bar + grille de cartes
 * Full-width top bar with tabs (All / News / Subjects / Themes), results
 * as a visual card grid with image aspect ratios.
 */
export function TopGridLayout({ data }: SearchLayoutProps) {
  const { query, onQueryChange, themes, builtInSubjects, customSubjects, news, loading, hasQuery } = data;
  const [tab, setTab] = useState<Tab>("all");

  const counts = {
    all: themes.length + builtInSubjects.length + customSubjects.length + news.length,
    news: news.length,
    subjects: builtInSubjects.length + customSubjects.length,
    themes: themes.length,
  };

  const visibleNews = tab === "all" || tab === "news";
  const visibleSubjects = tab === "all" || tab === "subjects";
  const visibleThemes = tab === "all" || tab === "themes";

  type Card = {
    key: string;
    href: string;
    title: string;
    sub: string;
    theme: string;
    accent?: "user" | null;
    image?: string | null;
    kind: "news" | "subject" | "theme";
  };

  const cards = useMemo<Card[]>(() => {
    const out: Card[] = [];
    if (visibleNews) {
      for (const a of news) out.push({ key: `n-${a.slug}`, href: `/actualites/${a.slug}`, title: a.title, sub: a.source, theme: a.theme, image: a.image, kind: "news" });
    }
    if (visibleSubjects) {
      for (const s of customSubjects) out.push({ key: `us-${s.id}`, href: `/sujets/${s.slug}`, title: s.sujet, sub: `@${s.author?.displayName ?? s.author?.name ?? "user"}`, theme: s.theme, accent: "user", kind: "subject" });
      for (const s of builtInSubjects) out.push({ key: `bs-${out.length}`, href: `/sujets/${slugifySubject(s.theme, s.sujet)}`, title: s.sujet, sub: s.domaine, theme: s.theme, kind: "subject" });
    }
    if (visibleThemes) {
      for (const t of themes) out.push({ key: `t-${t.slug}`, href: `/themes/${t.slug}`, title: t.theme, sub: `${t.count} sujets`, theme: t.theme, kind: "theme" });
    }
    return out;
  }, [visibleNews, visibleSubjects, visibleThemes, news, customSubjects, builtInSubjects, themes]);

  return (
    <div className="min-h-screen bg-[#FDFDF8] dark:bg-[#1E1F23]" style={{ fontFamily: "var(--font-dm-sans)" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8]/90 dark:bg-[#1E1F23]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9EA096]" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              autoFocus
              placeholder="Rechercher…"
              className="w-full pl-10 pr-4 py-2 text-[14px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] placeholder:text-[#9EA096] focus:outline-none focus:border-[#EB9D2A]"
            />
          </div>
          <div className="flex items-center gap-1" style={{ fontFamily: "var(--font-syne)", fontWeight: 500 }}>
            {(
              [
                ["all", "Tous", counts.all],
                ["news", "Actualités", counts.news],
                ["subjects", "Sujets", counts.subjects],
                ["themes", "Thèmes", counts.themes],
              ] as const
            ).map(([id, label, count]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-3 py-1.5 text-[12px] uppercase tracking-wider rounded-full border transition-colors ${
                  tab === id
                    ? "border-[#EB9D2A] bg-[#EB9D2A]/10 text-[#B17816]"
                    : "border-transparent text-[#4D4F46] dark:text-[#9EA096] hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f]"
                }`}
              >
                {label} <span className="opacity-60 ml-1">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <p className="text-[12px] text-[#9EA096] mb-4">
          {hasQuery
            ? loading
              ? "Recherche…"
              : `${cards.length} résultat${cards.length > 1 ? "s" : ""} pour « ${query} »`
            : `Tendances · ${cards.length} élément${cards.length > 1 ? "s" : ""}`}
        </p>
        {cards.length === 0 ? (
          <p className="text-center text-[13px] text-[#9EA096] italic py-10">
            {hasQuery
              ? tab === "all"
                ? `Aucun résultat pour « ${query} »`
                : `Aucun${tab === "news" ? "e actualité" : tab === "subjects" ? " sujet" : " thème"} pour « ${query} »`
              : "Pas de tendance pour l'instant"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((c) => {
              const color = getThemeColor(c.theme);
              const border = c.accent === "user" ? "border-[#EB9D2A]/30" : "border-[#D2D3CC] dark:border-[#3a3b3f]";
              return (
                <EmbedLink
                  key={c.key}
                  href={c.href}
                  className={`group block rounded-md border ${border} bg-[#FDFDF8] dark:bg-[#1E1F23] overflow-hidden hover:-translate-y-0.5 hover:border-[#BFC1B7] dark:hover:border-[#555] transition-all`}
                >
                  <div className="aspect-video bg-[#E5E7E0] dark:bg-[#2a2b2f] overflow-hidden">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-[10px] tracking-[0.2em] uppercase ${color.text} ${color.bgLight}`} style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}>
                        {c.kind === "theme" ? "Thème" : c.kind === "subject" ? "Sujet" : "Actualité"}
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <span className={`inline-flex px-1.5 py-0.5 text-[10px] rounded ${color.bgLight} ${color.text}`}>
                      {c.theme}
                    </span>
                    <p className="text-[13px] font-medium leading-snug text-[#23251D] dark:text-[#EAECF6] line-clamp-3">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-[#9EA096]">{c.sub}</p>
                  </div>
                </EmbedLink>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
