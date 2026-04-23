"use client";

import { Search } from "lucide-react";
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
  image?: string | null;
  kind: "Actualité" | "Sujet" | "Sujet ajouté" | "Thème";
};

/**
 * LAYOUT 4 — Split hero + liste
 * Top result (news with image preferred, else first match) blown up on the
 * left at 60%, compact list on the right at 40%.
 */
export function SplitHeroLayout({ data }: SearchLayoutProps) {
  const { query, onQueryChange, themes, builtInSubjects, customSubjects, news, loading, hasQuery } = data;

  const items: FlatItem[] = [];
  for (const a of news) items.push({ key: `n-${a.slug}`, href: `/actualites/${a.slug}`, title: a.title, sub: a.source, theme: a.theme, image: a.image, kind: "Actualité" });
  for (const s of customSubjects) items.push({ key: `us-${s.id}`, href: `/sujets/${s.slug}`, title: s.sujet, sub: `@${s.author?.displayName ?? s.author?.name ?? "user"}`, theme: s.theme, kind: "Sujet ajouté" });
  for (const s of builtInSubjects) items.push({ key: `bs-${items.length}`, href: `/sujets/${slugifySubject(s.theme, s.sujet)}`, title: s.sujet, sub: s.domaine, theme: s.theme, kind: "Sujet" });
  for (const t of themes) items.push({ key: `t-${t.slug}`, href: `/themes/${t.slug}`, title: t.theme, sub: `${t.count} sujets`, theme: t.theme, kind: "Thème" });

  // Pick hero: prefer news with image, else first item
  const heroIdx = items.findIndex((i) => i.kind === "Actualité" && i.image);
  const hero = heroIdx >= 0 ? items[heroIdx] : items[0];
  const rest = items.filter((_, i) => i !== (heroIdx >= 0 ? heroIdx : 0));

  return (
    <div className="min-h-screen bg-[#FDFDF8] dark:bg-[#1E1F23]" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <div className="px-6 pt-6 pb-4 border-b border-[#D2D3CC] dark:border-[#3a3b3f]">
        <div className="max-w-6xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9EA096]" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoFocus
            placeholder="Mettre en avant le meilleur résultat…"
            className="w-full pl-12 pr-4 py-3 text-[15px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-white dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] placeholder:text-[#9EA096] focus:outline-none focus:border-[#EB9D2A] focus:ring-2 focus:ring-[#EB9D2A]/20"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        {/* Hero */}
        <div>
          {!hero ? (
            <p className="text-center text-[13px] text-[#9EA096] italic py-10">
              {hasQuery ? `Aucun résultat pour « ${query} »` : "Pas de tendance pour l'instant"}
            </p>
          ) : (
            <HeroCard item={hero} kicker={hasQuery ? "Top résultat" : "Tendance du moment"} />
          )}
        </div>

        {/* Grouped list */}
        <aside className="space-y-5 max-h-[80vh] overflow-auto pr-1 -mr-1">
          {(["Actualité", "Sujet ajouté", "Sujet", "Thème"] as const).map((kind) => {
            const list = rest.filter((r) => r.kind === kind);
            const label =
              kind === "Actualité"
                ? "Actualités"
                : kind === "Sujet ajouté"
                ? "Sujets ajoutés"
                : kind === "Sujet"
                ? "Sujets"
                : "Thèmes";
            return (
              <div key={kind}>
                <header className="flex items-center gap-2 mb-2">
                  <h3
                    className="text-[10px] tracking-[0.22em] uppercase text-[#9EA096]"
                    style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
                  >
                    {label}
                  </h3>
                  <span className="text-[10px] text-[#9EA096] tabular-nums">({list.length})</span>
                </header>
                {list.length === 0 ? (
                  <p className="text-[11px] italic text-[#9EA096] px-1">
                    {hasQuery ? `Aucun pour « ${query} »` : "—"}
                  </p>
                ) : (
                  <ul className="space-y-1 list-none m-0 p-0">
                    {list.map((r) => {
                      const color = getThemeColor(r.theme);
                      return (
                        <li key={r.key}>
                          <EmbedLink
                            href={r.href}
                            className="block px-3 py-2 rounded-md hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f] transition-colors"
                          >
                            <p className="text-[13px] font-medium leading-snug text-[#23251D] dark:text-[#EAECF6] line-clamp-2">
                              {r.title}
                            </p>
                            <p className="text-[11px] text-[#9EA096] mt-0.5 flex items-center gap-1.5">
                              <span className={`inline-block px-1.5 py-0 rounded text-[10px] ${color.bgLight} ${color.text}`}>
                                {r.theme}
                              </span>
                              {r.sub}
                            </p>
                          </EmbedLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}

function HeroCard({ item, kicker }: { item: FlatItem; kicker: string }) {
  const color = getThemeColor(item.theme);
  return (
    <EmbedLink
      href={item.href}
      className="block rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] overflow-hidden hover:-translate-y-0.5 hover:border-[#BFC1B7] dark:hover:border-[#555] transition-all"
    >
      <div className="aspect-[16/9] bg-[#E5E7E0] dark:bg-[#2a2b2f] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${color.bgLight}`}>
            <span
              className={`text-[14px] tracking-[0.2em] uppercase ${color.text}`}
              style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
            >
              {kicker}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] tracking-[0.2em] uppercase text-[#EB9D2A]"
            style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
          >
            {kicker} · {item.kind}
          </span>
          <span className={`inline-flex px-2 py-0.5 text-[11px] rounded ${color.bgLight} ${color.text}`}>
            {item.theme}
          </span>
        </div>
        <h2
          className="text-2xl sm:text-3xl leading-tight text-[#23251D] dark:text-[#EAECF6] text-balance"
          style={{ fontFamily: "var(--font-syne)", fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          {item.title}
        </h2>
        <p className="text-[13px] text-[#9EA096]">{item.sub}</p>
      </div>
    </EmbedLink>
  );
}
