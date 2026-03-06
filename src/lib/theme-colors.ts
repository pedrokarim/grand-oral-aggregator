export interface ThemeColor {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  dot: string;
}

export const themeColorMap: Record<string, ThemeColor> = {
  "SI et environnement": {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
  },
  Cybersecurité: {
    bg: "bg-red-500",
    bgLight: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-l-red-500",
    dot: "bg-red-500",
  },
  "Cloud et virtualisation": {
    bg: "bg-blue-500",
    bgLight: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-l-blue-500",
    dot: "bg-blue-500",
  },
  "Big Data": {
    bg: "bg-purple-500",
    bgLight: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-l-purple-500",
    dot: "bg-purple-500",
  },
  Développement: {
    bg: "bg-teal-500",
    bgLight: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-l-teal-500",
    dot: "bg-teal-500",
  },
  Mobilité: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
  },
  "Management et stratégie": {
    bg: "bg-rose-500",
    bgLight: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-l-rose-500",
    dot: "bg-rose-500",
  },
  Blockchain: {
    bg: "bg-cyan-500",
    bgLight: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-l-cyan-500",
    dot: "bg-cyan-500",
  },
  "Intelligence artificielle": {
    bg: "bg-violet-500",
    bgLight: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-l-violet-500",
    dot: "bg-violet-500",
  },
  "Optimisation du SI": {
    bg: "bg-lime-500",
    bgLight: "bg-lime-600/10",
    text: "text-lime-600 dark:text-lime-400",
    border: "border-l-lime-500",
    dot: "bg-lime-500",
  },
};

const defaultColor: ThemeColor = {
  bg: "bg-gray-500",
  bgLight: "bg-gray-500/10",
  text: "text-gray-600 dark:text-gray-400",
  border: "border-l-gray-500",
  dot: "bg-gray-500",
};

export function getThemeColor(theme: string): ThemeColor {
  return themeColorMap[theme] ?? defaultColor;
}
