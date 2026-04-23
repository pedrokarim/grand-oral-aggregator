"use client";

import { Search, Newspaper, FileText, LayoutGrid, Lock } from "lucide-react";
import { EmbedLink } from "@/components/embed-link";
import { slugifySubject } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import type { SearchLayoutProps } from "./types";

/**
 * LAYOUT 6 — Masonry éditorial (default)
 * Magazine-style grid with blocks of varying heights, Syne uppercase labels,
 * colored theme chips. Pinterest/editorial feel.
 */
export function MasonryEditorialLayout({ data }: SearchLayoutProps) {
  const { query, onQueryChange, themes, builtInSubjects, customSubjects, news, loading, hasQuery } = data;

  const items = buildItems({ builtInSubjects, customSubjects, news, themes });
  const newsCount = news.length;
  const subjectsCount = builtInSubjects.length + customSubjects.length;
  const themesCount = themes.length;

  return (
    <div className="min-h-screen bg-[#FDFDF8] dark:bg-[#1E1F23]" style={{ fontFamily: "var(--font-dm-sans)" }}>
      {/* Hero search */}
      <div className="px-6 pt-[12vh] pb-8 border-b border-[#D2D3CC] dark:border-[#3a3b3f]">
        <div className="max-w-3xl mx-auto">
          <p
            className="text-[10px] tracking-[0.22em] uppercase text-[#9EA096] mb-3"
            style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
          >
            {hasQuery ? "Recherche · Résultats" : "Éditorial · Tendances"}
          </p>
          <h1
            className="text-4xl sm:text-5xl leading-[1.05] text-[#23251D] dark:text-[#EAECF6] mb-6 text-balance"
            style={{ fontFamily: "var(--font-syne)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            {hasQuery ? (
              <>Résultats pour <span className="text-[#EB9D2A]">« {query} »</span></>
            ) : (
              <>Explorez thèmes, sujets &amp; actualités.</>
            )}
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9EA096]" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              autoFocus
              placeholder="Chercher un mot-clé, un sujet, un thème…"
              className="w-full pl-12 pr-4 py-3.5 text-[16px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] placeholder:text-[#9EA096] focus:outline-none focus:border-[#EB9D2A] focus:ring-2 focus:ring-[#EB9D2A]/20"
            />
          </div>
          <SectionCounts
            news={newsCount}
            subjects={subjectsCount}
            themes={themesCount}
            hasQuery={hasQuery}
            loading={loading}
          />
        </div>
      </div>

      {/* Masonry grid */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {items.length === 0 ? (
            <p className="text-center text-[13px] text-[#9EA096] italic py-10">
              {hasQuery ? `Aucun résultat pour « ${query} »` : "Pas de tendance pour l'instant"}
            </p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 [column-fill:balance]">
              {items.map((item) => (
                <MasonryCard key={item.key} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCounts({
  news,
  subjects,
  themes,
  hasQuery,
  loading,
}: {
  news: number;
  subjects: number;
  themes: number;
  hasQuery: boolean;
  loading: boolean;
}) {
  if (loading) return <p className="mt-3 text-[12px] text-[#9EA096]">Recherche…</p>;
  const pill = (label: string, count: number) => (
    <span
      className={`inline-flex items-center gap-1 ${
        count === 0 && hasQuery ? "text-[#9EA096] line-through" : "text-[#4D4F46] dark:text-[#9EA096]"
      }`}
    >
      <span
        className="uppercase tracking-[0.14em] text-[10px]"
        style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
      >
        {label}
      </span>
      <span className="tabular-nums">{count}</span>
    </span>
  );
  return (
    <p className="mt-3 flex items-center gap-3 flex-wrap text-[12px]">
      {pill("Actualités", news)}
      <span className="text-[#D2D3CC]">·</span>
      {pill("Sujets", subjects)}
      <span className="text-[#D2D3CC]">·</span>
      {pill("Thèmes", themes)}
      {hasQuery && (news === 0 || subjects === 0 || themes === 0) && (
        <span className="text-[11px] text-[#9EA096] italic ml-auto">catégorie barrée = 0 résultat</span>
      )}
    </p>
  );
}

type Item =
  | { kind: "news"; key: string; href: string; theme: string; title: string; source: string; image?: string | null }
  | { kind: "subject"; key: string; href: string; theme: string; title: string; source: "builtin" | "user"; isPublic?: boolean; author?: string | null; domaine?: string }
  | { kind: "theme"; key: string; href: string; theme: string; count: number };

function buildItems(opts: {
  news: SearchLayoutProps["data"]["news"];
  builtInSubjects: SearchLayoutProps["data"]["builtInSubjects"];
  customSubjects: SearchLayoutProps["data"]["customSubjects"];
  themes: SearchLayoutProps["data"]["themes"];
}): Item[] {
  const items: Item[] = [];
  for (const t of opts.themes) {
    items.push({ kind: "theme", key: `t-${t.slug}`, href: `/themes/${t.slug}`, theme: t.theme, count: t.count });
  }
  for (const s of opts.customSubjects) {
    items.push({
      kind: "subject",
      key: `us-${s.id}`,
      href: `/sujets/${s.slug}`,
      theme: s.theme,
      title: s.sujet,
      source: "user",
      isPublic: s.isPublic,
      author: s.author?.displayName ?? s.author?.name ?? null,
    });
  }
  for (const s of opts.builtInSubjects) {
    items.push({
      kind: "subject",
      key: `bs-${s.sujet.slice(0, 20)}-${items.length}`,
      href: `/sujets/${slugifySubject(s.theme, s.sujet)}`,
      theme: s.theme,
      title: s.sujet,
      source: "builtin",
      domaine: s.domaine,
    });
  }
  for (const a of opts.news) {
    items.push({
      kind: "news",
      key: `n-${a.slug}`,
      href: `/actualites/${a.slug}`,
      theme: a.theme,
      title: a.title,
      source: a.source,
      image: a.image,
    });
  }
  return items;
}

function MasonryCard({ item }: { item: Item }) {
  const color = getThemeColor(item.theme);
  const accent = item.kind === "subject" && item.source === "user" ? "border-[#EB9D2A]/30" : "border-[#D2D3CC] dark:border-[#3a3b3f]";

  return (
    <EmbedLink
      href={item.href}
      className={`block mb-5 rounded-md border ${accent} bg-[#FDFDF8] dark:bg-[#1E1F23] overflow-hidden hover:-translate-y-0.5 hover:border-[#BFC1B7] dark:hover:border-[#555] transition-all break-inside-avoid`}
    >
      {/* News cards: image hero if available */}
      {item.kind === "news" && item.image && (
        <div className="w-full aspect-[16/10] overflow-hidden bg-[#E5E7E0] dark:bg-[#2a2b2f]">
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Kind label in Syne uppercase */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] tracking-[0.18em] uppercase text-[#9EA096]"
            style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
          >
            {item.kind === "news" ? "Actualité" : item.kind === "subject" ? (item.source === "user" ? "Sujet ajouté" : "Sujet") : "Thème"}
          </span>
          {item.kind === "subject" && item.source === "user" && item.isPublic === false && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#EB9D2A]">
              <Lock className="h-3 w-3" /> Privé
            </span>
          )}
        </div>

        {/* Theme chip */}
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded ${color.bgLight} ${color.text}`}>
          {item.theme}
        </span>

        {/* Title */}
        {item.kind === "theme" ? (
          <h3
            className="text-[20px] leading-tight text-[#23251D] dark:text-[#EAECF6]"
            style={{ fontFamily: "var(--font-syne)", fontWeight: 700, letterSpacing: "-0.01em" }}
          >
            {item.theme}
          </h3>
        ) : (
          <h3 className="text-[15px] font-medium leading-snug text-[#23251D] dark:text-[#EAECF6] text-balance">
            {item.title}
          </h3>
        )}

        {/* Meta */}
        {item.kind === "theme" && (
          <p className="text-[12px] text-[#9EA096]">{item.count} sujet{item.count > 1 ? "s" : ""} de préparation</p>
        )}
        {item.kind === "news" && (
          <p className="text-[12px] text-[#9EA096] inline-flex items-center gap-1.5">
            <Newspaper className="h-3 w-3" /> {item.source}
          </p>
        )}
        {item.kind === "subject" && item.source === "user" && (
          <p className="text-[12px] text-[#9EA096]">par @{item.author ?? "utilisateur"}</p>
        )}
        {item.kind === "subject" && item.source === "builtin" && (
          <p className="text-[12px] text-[#9EA096] inline-flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> {item.domaine}
          </p>
        )}
      </div>
    </EmbedLink>
  );
}

export { LayoutGrid }; // re-export for potential external use
