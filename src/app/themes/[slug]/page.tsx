import { notFound } from "next/navigation";
import {
  getThemeBySlug,
  getSubjectsByTheme,
  themeStats,
  themeIcons,
} from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import { SubjectCard } from "@/components/subject-card";
import { NewsFeed } from "@/components/news-feed";
import {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link as LinkIcon, Brain, Settings,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link: LinkIcon, Brain, Settings,
};

export function generateStaticParams() {
  return themeStats.map(({ slug }) => ({ slug }));
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const themeStat = getThemeBySlug(slug);
  if (!themeStat) notFound();

  const subjects = getSubjectsByTheme(themeStat.theme);
  const Icon = iconMap[themeIcons[themeStat.theme]] ?? Settings;
  const color = getThemeColor(themeStat.theme);

  return (
    <div className="space-y-8">
      <div className={`rounded-xl p-6 ${color.bgLight}`}>
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-3 ${color.bg}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {themeStat.theme}
            </h1>
            <p className="text-muted-foreground">
              {themeStat.count} sujet{themeStat.count > 1 ? "s" : ""} de
              préparation
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Sujets</h2>
        <div className="grid gap-3">
          {subjects.map((subject, i) => (
            <SubjectCard
              key={i}
              sujet={subject.sujet}
              type={subject.type}
              domaine={subject.domaine}
              theme={subject.theme}
              color={color}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Actualités liées</h2>
        <NewsFeed theme={themeStat.theme} />
      </div>
    </div>
  );
}
