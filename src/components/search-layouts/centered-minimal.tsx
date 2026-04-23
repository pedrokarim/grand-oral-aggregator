"use client";

import { Search } from "lucide-react";
import { EmbedLink } from "@/components/embed-link";
import { slugifySubject } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import type { SearchLayoutProps } from "./types";

type Row = {
  key: string;
  href: string;
  title: string;
  theme: string;
  meta?: string;
};

/**
 * LAYOUT 1 — Centered minimal
 * Centered search bar, results grouped in 3 sober sections (Actualités /
 * Sujets / Thèmes). Linear/Vercel-like restraint. Per-section empty
 * messages when filtering yields nothing in a category.
 */
export function CenteredMinimalLayout({ data }: SearchLayoutProps) {
  const { query, onQueryChange, themes, builtInSubjects, customSubjects, news, loading, hasQuery } = data;

  const newsRows: Row[] = news.map((a) => ({
    key: `n-${a.slug}`,
    href: `/actualites/${a.slug}`,
    title: a.title,
    theme: a.theme,
    meta: a.source,
  }));
  const subjectRows: Row[] = [
    ...customSubjects.map((s) => ({
      key: `us-${s.id}`,
      href: `/sujets/${s.slug}`,
      title: s.sujet,
      theme: s.theme,
      meta: s.isPublic ? `@${s.author?.displayName ?? s.author?.name ?? "user"}` : "privé",
    })),
    ...builtInSubjects.map((s, i) => ({
      key: `bs-${i}-${s.sujet.slice(0, 10)}`,
      href: `/sujets/${slugifySubject(s.theme, s.sujet)}`,
      title: s.sujet,
      theme: s.theme,
      meta: s.domaine,
    })),
  ];
  const themeRows: Row[] = themes.map((t) => ({
    key: `t-${t.slug}`,
    href: `/themes/${t.slug}`,
    title: t.theme,
    theme: t.theme,
    meta: `${t.count} sujets`,
  }));

  return (
    <div className="min-h-screen bg-[#FDFDF8] dark:bg-[#1E1F23]" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <div className="pt-[15vh] px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9EA096]" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              autoFocus
              placeholder="Rechercher…"
              className="w-full pl-12 pr-4 py-3 text-[15px] rounded-full border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] placeholder:text-[#9EA096] focus:outline-none focus:border-[#EB9D2A] focus:ring-2 focus:ring-[#EB9D2A]/20"
            />
          </div>
          <p className="mt-3 text-center text-[12px] text-[#9EA096]">
            {hasQuery
              ? loading
                ? "Recherche…"
                : `${newsRows.length + subjectRows.length + themeRows.length} résultat${
                    newsRows.length + subjectRows.length + themeRows.length > 1 ? "s" : ""
                  } pour « ${query} »`
              : "Tendances du moment"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-12 space-y-6">
        <SectionBlock
          label="Actualités"
          rows={newsRows}
          emptyMsg={hasQuery ? `Aucune actualité pour « ${query} »` : "—"}
        />
        <SectionBlock
          label="Sujets"
          rows={subjectRows}
          emptyMsg={hasQuery ? `Aucun sujet pour « ${query} »` : "—"}
        />
        <SectionBlock
          label="Thèmes"
          rows={themeRows}
          emptyMsg={hasQuery ? `Aucun thème pour « ${query} »` : "—"}
        />
      </div>
    </div>
  );
}

function SectionBlock({ label, rows, emptyMsg }: { label: string; rows: Row[]; emptyMsg: string }) {
  return (
    <div>
      <header className="flex items-center gap-2 mb-2">
        <h2
          className="text-[10px] tracking-[0.22em] uppercase text-[#9EA096]"
          style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
        >
          {label}
        </h2>
        <span className="text-[10px] text-[#9EA096] tabular-nums">({rows.length})</span>
      </header>
      {rows.length === 0 ? (
        <p className="px-1 py-3 text-[12px] italic text-[#9EA096]">{emptyMsg}</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => {
            const color = getThemeColor(r.theme);
            return (
              <EmbedLink
                key={r.key}
                href={r.href}
                className="block px-4 py-2.5 rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#1E1F23] hover:border-[#EB9D2A] transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-[14px] font-medium text-[#23251D] dark:text-[#EAECF6] flex-1 leading-snug">
                    {r.title}
                  </p>
                  <span className={`inline-flex px-1.5 py-0.5 text-[10px] rounded ${color.bgLight} ${color.text}`}>
                    {r.theme}
                  </span>
                  {r.meta && <span className="text-[11px] text-[#9EA096]">{r.meta}</span>}
                </div>
              </EmbedLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
