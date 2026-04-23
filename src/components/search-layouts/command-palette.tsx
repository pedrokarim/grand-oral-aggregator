"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft } from "lucide-react";
import { EmbedLink } from "@/components/embed-link";
import { slugifySubject } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import type { SearchLayoutProps } from "./types";

type FlatItem = {
  key: string;
  href: string;
  title: string;
  sub: string;
  theme: string;
  group: "Actualités" | "Sujets" | "Thèmes";
};

/**
 * LAYOUT 5 — Command palette
 * Floating modal-style card centered on the page, grouped by category with
 * uppercase Syne separators, keyboard navigation (↑↓ to move, Enter to open).
 */
export function CommandPaletteLayout({ data }: SearchLayoutProps) {
  const { query, onQueryChange, themes, builtInSubjects, customSubjects, news, loading, hasQuery } = data;
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<FlatItem[]>(() => {
    const out: FlatItem[] = [];
    for (const a of news) out.push({ key: `n-${a.slug}`, href: `/actualites/${a.slug}`, title: a.title, sub: a.source, theme: a.theme, group: "Actualités" });
    for (const s of customSubjects) out.push({ key: `us-${s.id}`, href: `/sujets/${s.slug}`, title: s.sujet, sub: `@${s.author?.displayName ?? s.author?.name ?? "user"}`, theme: s.theme, group: "Sujets" });
    for (const s of builtInSubjects) out.push({ key: `bs-${out.length}`, href: `/sujets/${slugifySubject(s.theme, s.sujet)}`, title: s.sujet, sub: s.domaine, theme: s.theme, group: "Sujets" });
    for (const t of themes) out.push({ key: `t-${t.slug}`, href: `/themes/${t.slug}`, title: t.theme, sub: `${t.count} sujets`, theme: t.theme, group: "Thèmes" });
    return out;
  }, [news, customSubjects, builtInSubjects, themes]);

  useEffect(() => {
    setCursor(0);
  }, [query, items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (items.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const sel = items[cursor];
        if (sel) window.location.href = sel.href;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, cursor]);

  const grouped = {
    Actualités: items.filter((i) => i.group === "Actualités"),
    Sujets: items.filter((i) => i.group === "Sujets"),
    Thèmes: items.filter((i) => i.group === "Thèmes"),
  };

  return (
    <div
      className="min-h-screen px-4 pt-[10vh] pb-10 bg-[radial-gradient(ellipse_at_top,rgba(235,157,42,0.05),transparent_60%),#FDFDF8] dark:bg-[radial-gradient(ellipse_at_top,rgba(235,157,42,0.05),transparent_60%),#1E1F23]"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      <div className="max-w-2xl mx-auto rounded-xl border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white/95 dark:bg-[#1E1F23]/95 backdrop-blur shadow-2xl overflow-hidden">
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#D2D3CC] dark:border-[#3a3b3f]">
          <Search className="h-4 w-4 text-[#9EA096] shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoFocus
            placeholder="Que cherchez-vous ?"
            className="flex-1 text-[15px] bg-transparent outline-none text-[#23251D] dark:text-[#EAECF6] placeholder:text-[#9EA096]"
          />
          <span className="text-[10px] text-[#9EA096] hidden sm:inline">ESC pour fermer</span>
        </div>

        {/* Results grouped — always render all 3 groups to show per-section state */}
        <div ref={listRef} className="max-h-[60vh] overflow-auto">
          {items.length === 0 && loading ? (
            <p className="text-center text-[13px] text-[#9EA096] italic py-8">Recherche…</p>
          ) : (
            (["Actualités", "Sujets", "Thèmes"] as const).map((grp) => {
              const list = grouped[grp];
              return (
                <div key={grp} className="py-2">
                  <p
                    className="px-4 py-1 text-[10px] tracking-[0.22em] uppercase text-[#9EA096]"
                    style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
                  >
                    {grp} <span className="opacity-60">({list.length})</span>
                    {!hasQuery && list.length > 0 && (
                      <span className="ml-2 text-[#EB9D2A] normal-case tracking-normal">· Tendances</span>
                    )}
                  </p>
                  {list.length === 0 ? (
                    <p className="px-4 py-2 text-[12px] italic text-[#9EA096]">
                      {hasQuery ? `Aucun pour « ${query} »` : "—"}
                    </p>
                  ) : (
                    list.map((r) => {
                    const globalIdx = items.indexOf(r);
                    const active = globalIdx === cursor;
                    const color = getThemeColor(r.theme);
                    return (
                      <EmbedLink
                        key={r.key}
                        href={r.href}
                        onMouseEnter={() => setCursor(globalIdx)}
                        className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                          active
                            ? "bg-[#EB9D2A]/10"
                            : "hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${color.bg} shrink-0`} />
                        <span className="flex-1 truncate text-[13px] text-[#23251D] dark:text-[#EAECF6]">
                          {r.title}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${color.bgLight} ${color.text}`}>
                          {r.theme}
                        </span>
                        <span className="text-[10px] text-[#9EA096] truncate max-w-[100px] hidden sm:inline">
                          {r.sub}
                        </span>
                        {active && <CornerDownLeft className="h-3 w-3 text-[#EB9D2A]" />}
                      </EmbedLink>
                    );
                  })
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[#D2D3CC] dark:border-[#3a3b3f] text-[10px] text-[#9EA096]">
          <span>
            <kbd className="px-1 py-0.5 rounded border border-[#D2D3CC] dark:border-[#3a3b3f]">↑</kbd>
            <kbd className="px-1 py-0.5 rounded border border-[#D2D3CC] dark:border-[#3a3b3f] ml-0.5">↓</kbd> naviguer
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded border border-[#D2D3CC] dark:border-[#3a3b3f]">⏎</kbd> ouvrir
          </span>
          <span className="ml-auto">{items.length} résultat{items.length > 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
