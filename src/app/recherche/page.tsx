"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  subjects as builtInSubjects,
  themeStats,
} from "@/lib/data";
import type { CustomSubject, Subject } from "@/lib/data";
import { useSettings } from "@/hooks/use-settings";
import { SEARCH_LAYOUT_COMPONENTS } from "@/components/search-layouts";
import type { SearchNewsItem } from "@/components/search-layouts/types";
import { SearchLayoutPicker } from "@/components/search-layout-picker";

function useDebounced<T>(value: T, delay = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const TRENDING_BUILTIN_COUNT = 12;
const TRENDING_NEWS_COUNT = 12;
const TRENDING_THEMES_COUNT = 10; // show all

export default function RecherchePage() {
  const [settings, updateSettings] = useSettings();
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 250);

  const [news, setNews] = useState<SearchNewsItem[]>([]);
  const [customSubjects, setCustomSubjects] = useState<CustomSubject[]>([]);
  const [loading, setLoading] = useState(false);

  // Shuffled built-in subjects computed once per mount for "trending"
  const trendingBuiltInsRef = useRef<Subject[]>([]);
  if (trendingBuiltInsRef.current.length === 0) {
    trendingBuiltInsRef.current = shuffle(builtInSubjects).slice(0, TRENDING_BUILTIN_COUNT);
  }

  // Trending themes: shuffle to avoid always showing same order
  const trendingThemesRef = useRef<typeof themeStats>([]);
  if (trendingThemesRef.current.length === 0) {
    trendingThemesRef.current = shuffle(themeStats).slice(0, TRENDING_THEMES_COUNT);
  }

  useEffect(() => {
    const q = debounced.trim();
    const ctrl = new AbortController();
    setLoading(true);

    // News: when q is empty, API returns top 30 recent — take first TRENDING_NEWS_COUNT.
    const newsUrl = q ? `/api/news?q=${encodeURIComponent(q)}` : `/api/news`;
    const newsReq = fetch(newsUrl, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        const articles: SearchNewsItem[] = data.articles ?? [];
        setNews(q ? articles : articles.slice(0, TRENDING_NEWS_COUNT));
      })
      .catch(() => {});

    // Custom subjects: q -> search endpoint; else trending (top 12 recent visible).
    const subjUrl = q ? `/api/subjects?q=${encodeURIComponent(q)}` : `/api/subjects`;
    const subjReq = fetch(subjUrl, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => setCustomSubjects(data.subjects ?? []))
      .catch(() => {});

    Promise.all([newsReq, subjReq]).finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [debounced]);

  const filteredThemes = useMemo(() => {
    const q = debounced.trim();
    if (!q) return trendingThemesRef.current;
    return themeStats.filter((t) => matches(t.theme, q));
  }, [debounced]);

  const filteredBuiltIns = useMemo(() => {
    const q = debounced.trim();
    if (!q) return trendingBuiltInsRef.current;
    return builtInSubjects
      .filter((s) => matches(s.sujet, q) || matches(s.theme, q))
      .slice(0, 50);
  }, [debounced]);

  const hasQuery = debounced.trim().length > 0;

  const Layout = SEARCH_LAYOUT_COMPONENTS[settings.searchLayout];

  return (
    <div className="relative">
      {/* Fixed bottom-right, out of the way of per-layout top chrome */}
      <div className="fixed right-4 bottom-4 z-30">
        <SearchLayoutPicker
          current={settings.searchLayout}
          onChange={(next) => updateSettings({ searchLayout: next })}
        />
      </div>

      <Layout
        data={{
          query,
          onQueryChange: setQuery,
          themes: filteredThemes,
          builtInSubjects: filteredBuiltIns,
          customSubjects,
          news,
          loading,
          hasQuery,
        }}
      />
    </div>
  );
}
