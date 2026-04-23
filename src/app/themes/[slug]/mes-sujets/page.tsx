import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getThemeBySlug, slugifySubject, type CustomSubject } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import { MySubjectsList } from "@/components/my-subjects-list";
import { EmbedLink } from "@/components/embed-link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";

export default async function MySubjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const themeStat = getThemeBySlug(slug);
  if (!themeStat) notFound();

  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect(`/themes/${slug}`);
  }
  const userId = session.user.id;

  const rows = await prisma.subject.findMany({
    where: {
      theme: { name: themeStat.theme },
      userId,
    },
    include: {
      theme: { select: { name: true } },
      user: { select: { id: true, name: true, displayName: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const subjects: CustomSubject[] = rows.map((r) => ({
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
    isMine: true,
  }));

  const color = getThemeColor(themeStat.theme);

  return (
    <div className="space-y-6 p-6">
      <EmbedLink
        href={`/themes/${slug}`}
        className="inline-flex items-center gap-1.5 text-[13px] text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour au thème
      </EmbedLink>

      <div className={`rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-5 ${color.bgLight}`}>
        <h1 className="text-xl font-bold text-[#23251D] dark:text-[#EAECF6]">
          Mes sujets — {themeStat.theme}
        </h1>
        <p className="text-[13px] text-[#9EA096] mt-1">
          {subjects.length} sujet{subjects.length > 1 ? "s" : ""} ajouté
          {subjects.length > 1 ? "s" : ""}. Basculez public ↔ privé ou supprimez depuis le menu « ⋯ ».
        </p>
      </div>

      <MySubjectsList color={color} initialSubjects={subjects} />
    </div>
  );
}
