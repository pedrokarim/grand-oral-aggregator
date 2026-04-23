import type { CustomSubject, Subject, themeStats } from "@/lib/data";

export interface SearchNewsItem {
  slug: string;
  title: string;
  description: string;
  source: string;
  theme: string;
  publishedAt: string;
  image?: string | null;
  favicon?: string | null;
}

export type ThemeStat = (typeof themeStats)[number];

export interface SearchLayoutData {
  query: string;
  onQueryChange: (q: string) => void;
  themes: ThemeStat[];
  builtInSubjects: Subject[];
  customSubjects: CustomSubject[];
  news: SearchNewsItem[];
  loading: boolean;
  hasQuery: boolean;
}

export interface SearchLayoutProps {
  data: SearchLayoutData;
}
