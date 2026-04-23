import sujetsData from "./sujets.json";

export interface Subject {
  type: string;
  domaine: string;
  theme: string;
  sujet: string;
}

export const subjects: Subject[] = sujetsData;

export const themes = Array.from(new Set(subjects.map((s) => s.theme)));

export const themeStats = themes.map((theme) => ({
  theme,
  slug: slugify(theme),
  count: subjects.filter((s) => s.theme === theme).length,
}));

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getThemeBySlug(slug: string) {
  return themeStats.find((t) => t.slug === slug);
}

export function getSubjectsByTheme(theme: string) {
  return subjects.filter((s) => s.theme === theme);
}

export function slugifySubject(theme: string, sujet: string): string {
  return slugify(`${theme}-${sujet}`).slice(0, 100);
}

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((s) => slugifySubject(s.theme, s.sujet) === slug);
}

export interface SubjectAuthor {
  id: string;
  name: string;
  displayName: string | null;
  image: string | null;
}

export interface CustomSubject {
  source: "user";
  id: number;
  type: string;
  domaine: string;
  theme: string;
  sujet: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
  author: SubjectAuthor | null;
  isMine: boolean;
}

export interface BuiltInSubject extends Subject {
  source: "builtin";
  slug: string;
}

export type DisplaySubject = BuiltInSubject | CustomSubject;

export function toBuiltIn(s: Subject): BuiltInSubject {
  return { ...s, source: "builtin", slug: slugifySubject(s.theme, s.sujet) };
}

export const themeIcons: Record<string, string> = {
  "SI et environnement": "Leaf",
  "Cybersecurité": "Shield",
  "Cloud et virtualisation": "Cloud",
  "Big Data": "Database",
  "Développement": "Code",
  "Mobilité": "Smartphone",
  "Management et stratégie": "Briefcase",
  "Blockchain": "Link",
  "Intelligence artificielle": "Brain",
  "Optimisation du SI": "Settings",
};
