"use client";

import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { EmbedLink } from "@/components/embed-link";
import { slugifySubject } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import type { SearchLayoutProps } from "./types";

type Kind = "news" | "subject-builtin" | "subject-user" | "theme";
const ALL_KINDS: { id: Kind; label: string }[] = [
  { id: "news", label: "Actualités" },
  { id: "subject-builtin", label: "Sujets built-in" },
  { id: "subject-user", label: "Sujets ajoutés" },
  { id: "theme", label: "Thèmes" },
];

/**
 * LAYOUT 2 — Sidebar + liste dense
 * Left filter panel (theme checkboxes + kind toggles), right column is a
 * dense list with thumbnail/favicon. Good for lots of results.
 */
export function SidebarListLayout({ data }: SearchLayoutProps) {
  const { query, onQueryChange, themes, builtInSubjects, customSubjects, news, loading, hasQuery } = data;

  const [themeFilter, setThemeFilter] = useState<Set<string>>(new Set());
  const [kindFilter, setKindFilter] = useState<Set<Kind>>(new Set(ALL_KINDS.map((k) => k.id)));

  const themeAllowed = (t: string) => themeFilter.size === 0 || themeFilter.has(t);

  const rows = useMemo(() => {
    type Row = {
      key: string;
      href: string;
      kind: Kind;
      title: string;
      theme: string;
      sub: string;
      thumb?: string | null;
    };
    const out: Row[] = [];
    if (kindFilter.has("theme")) {
      for (const t of themes) if (themeAllowed(t.theme)) out.push({ key: `t-${t.slug}`, href: `/themes/${t.slug}`, kind: "theme", title: t.theme, theme: t.theme, sub: `${t.count} sujets` });
    }
    if (kindFilter.has("subject-user")) {
      for (const s of customSubjects)
        if (themeAllowed(s.theme))
          out.push({ key: `us-${s.id}`, href: `/sujets/${s.slug}`, kind: "subject-user", title: s.sujet, theme: s.theme, sub: `@${s.author?.displayName ?? s.author?.name ?? "user"}` });
    }
    if (kindFilter.has("subject-builtin")) {
      for (const s of builtInSubjects) if (themeAllowed(s.theme)) out.push({ key: `bs-${out.length}`, href: `/sujets/${slugifySubject(s.theme, s.sujet)}`, kind: "subject-builtin", title: s.sujet, theme: s.theme, sub: s.domaine });
    }
    if (kindFilter.has("news")) {
      for (const a of news) if (themeAllowed(a.theme)) out.push({ key: `n-${a.slug}`, href: `/actualites/${a.slug}`, kind: "news", title: a.title, theme: a.theme, sub: a.source, thumb: a.image ?? a.favicon });
    }
    return out;
  }, [themes, customSubjects, builtInSubjects, news, kindFilter, themeFilter]);

  const toggleTheme = (t: string) =>
    setThemeFilter((prev) => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });
  const toggleKind = (k: Kind) =>
    setKindFilter((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  return (
    <div className="min-h-screen bg-[#FDFDF8] dark:bg-[#1E1F23]" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <div className="px-6 pt-6">
        <div className="max-w-6xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9EA096]" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoFocus
            placeholder="Rechercher dans le corpus…"
            className="w-full pl-12 pr-4 py-3 text-[15px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] placeholder:text-[#9EA096] focus:outline-none focus:border-[#EB9D2A] focus:ring-2 focus:ring-[#EB9D2A]/20"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar filters */}
        <aside className="space-y-6">
          <div>
            <p
              className="text-[10px] tracking-[0.2em] uppercase text-[#9EA096] mb-2 inline-flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
            >
              <Filter className="h-3 w-3" />
              Filtres
            </p>
          </div>
          <FilterGroup title="Type">
            {ALL_KINDS.map((k) => (
              <Check
                key={k.id}
                checked={kindFilter.has(k.id)}
                onToggle={() => toggleKind(k.id)}
                label={k.label}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Thèmes">
            {themes.length === 0 ? (
              <p className="text-[11px] text-[#9EA096] italic">—</p>
            ) : (
              themes.map((t) => (
                <Check
                  key={t.slug}
                  checked={themeFilter.has(t.theme)}
                  onToggle={() => toggleTheme(t.theme)}
                  label={t.theme}
                />
              ))
            )}
          </FilterGroup>
        </aside>

        {/* Results */}
        <main>
          <p className="text-[12px] text-[#9EA096] mb-3">
            {hasQuery
              ? loading
                ? "Recherche…"
                : `${rows.length} résultat${rows.length > 1 ? "s" : ""} pour « ${query} »`
              : `Tendances — ${rows.length} élément${rows.length > 1 ? "s" : ""}`}
          </p>
          {rows.length === 0 ? (
            <p className="text-center text-[13px] text-[#9EA096] italic py-10">
              {hasQuery
                ? `Aucun résultat pour « ${query} » avec ces filtres`
                : "Pas de tendance pour l'instant"}
            </p>
          ) : (
            <ul className="space-y-1.5 list-none m-0 p-0">
              {rows.map((r) => {
                const color = getThemeColor(r.theme);
                return (
                  <li key={r.key}>
                    <EmbedLink
                      href={r.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#1E1F23] hover:border-[#EB9D2A] transition-colors"
                    >
                      <div className="w-8 h-8 shrink-0 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f] overflow-hidden flex items-center justify-center">
                        {r.thumb ? (
                          <img
                            src={r.thumb}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                          />
                        ) : (
                          <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#23251D] dark:text-[#EAECF6] truncate leading-snug">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-[#9EA096] flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-block px-1.5 py-0 rounded text-[10px] ${color.bgLight} ${color.text}`}>
                            {r.theme}
                          </span>
                          <span className="truncate">{r.sub}</span>
                        </p>
                      </div>
                    </EmbedLink>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-3">
      <p
        className="text-[10px] tracking-[0.2em] uppercase text-[#9EA096] mb-2"
        style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
      >
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Check({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <span
        onClick={onToggle}
        className={`w-3.5 h-3.5 rounded border ${checked ? "bg-[#EB9D2A] border-[#EB9D2A]" : "border-[#D2D3CC] dark:border-[#3a3b3f]"}`}
      />
      <span className="text-[12px] text-[#4D4F46] dark:text-[#9EA096] truncate" onClick={onToggle}>
        {label}
      </span>
    </label>
  );
}
