import { notFound } from "next/navigation";
import {
  getThemeBySlug,
  getSubjectsByTheme,
  themeIcons,
  slugifySubject,
  toBuiltIn,
  type CustomSubject,
} from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import { SubjectsSection } from "@/components/subjects-section";
import { NewsFeed } from "@/components/news-feed";
import { ThemeComments } from "@/components/theme-comments";
import { ThemeFiche } from "@/components/theme-fiche";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";
import {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link as LinkIcon, Brain, Settings,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link: LinkIcon, Brain, Settings,
};

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const themeStat = getThemeBySlug(slug);
  if (!themeStat) notFound();

  const builtInSubjectsRaw = getSubjectsByTheme(themeStat.theme);
  const builtInSubjects = builtInSubjectsRaw.map(toBuiltIn);
  const Icon = iconMap[themeIcons[themeStat.theme]] ?? Settings;
  const color = getThemeColor(themeStat.theme);

  const session = await getServerSession();
  const userId = session?.user?.id ?? null;

  const customRows = await prisma.subject.findMany({
    where: {
      theme: { name: themeStat.theme },
      ...(userId
        ? { OR: [{ isPublic: true }, { userId }] }
        : { isPublic: true }),
    },
    include: {
      theme: { select: { name: true } },
      user: { select: { id: true, name: true, displayName: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const initialCustomSubjects: CustomSubject[] = customRows.map((r) => ({
    source: "user",
    id: r.id,
    type: r.type,
    domaine: r.domaine,
    theme: r.theme.name,
    sujet: r.sujet,
    slug: slugifySubject(r.theme.name, r.sujet),
    isPublic: r.isPublic,
    createdAt: r.createdAt.toISOString(),
    author: r.user
      ? {
          id: r.user.id,
          name: r.user.name,
          displayName: r.user.displayName,
          image: r.user.image,
        }
      : null,
    isMine: !!userId && r.userId === userId,
  }));

  // Combined subjects list passed to ThemeFiche (built-in + publicly visible customs)
  const subjectsForFiche = [
    ...initialCustomSubjects.map((s) => s.sujet),
    ...builtInSubjects.map((s) => s.sujet),
  ];

  const totalCount = builtInSubjects.length + initialCustomSubjects.length;

  return (
    <div className="space-y-6 p-4 sm:space-y-8 sm:p-6">
      {/* Theme header */}
      <div className={`rounded-md border border-[#D2D3CC] p-4 dark:border-[#3a3b3f] sm:p-6 ${color.bgLight}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`rounded-lg p-2.5 sm:p-3 ${color.bg}`}>
            <Icon className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight text-[#23251D] dark:text-[#EAECF6] sm:text-2xl">
              {themeStat.theme}
            </h1>
            <p className="text-[15px] text-[#9EA096]">
              {totalCount} sujet{totalCount > 1 ? "s" : ""} de préparation
            </p>
          </div>
        </div>
      </div>

      {/* Theme fiche generator */}
      <ThemeFiche theme={themeStat.theme} subjects={subjectsForFiche} />

      {/* Subjects list (built-ins + custom) */}
      <SubjectsSection
        theme={themeStat.theme}
        themeSlug={themeStat.slug}
        color={color}
        builtInSubjects={builtInSubjects}
        initialCustomSubjects={initialCustomSubjects}
      />

      {/* Related news */}
      <div>
        <h2 className="text-lg font-semibold text-[#23251D] dark:text-[#EAECF6] mb-4">Actualités liées</h2>
        <NewsFeed theme={themeStat.theme} />
      </div>

      {/* Comments */}
      <ThemeComments themeName={themeStat.theme} />
    </div>
  );
}
