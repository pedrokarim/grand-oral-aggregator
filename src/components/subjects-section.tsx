"use client";

import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { SubjectCard } from "@/components/subject-card";
import { AddSubjectForm } from "@/components/add-subject-form";
import { EmbedLink } from "@/components/embed-link";
import { useSession } from "@/lib/auth-client";
import type { ThemeColor } from "@/lib/theme-colors";
import type { BuiltInSubject, CustomSubject } from "@/lib/data";

interface SubjectsSectionProps {
  theme: string;
  themeSlug: string;
  color: ThemeColor;
  builtInSubjects: BuiltInSubject[];
  initialCustomSubjects: CustomSubject[];
}

export function SubjectsSection({
  theme,
  themeSlug,
  color,
  builtInSubjects,
  initialCustomSubjects,
}: SubjectsSectionProps) {
  const session = useSession();
  const isAuthenticated = !!session.data?.user;

  const [customSubjects, setCustomSubjects] = useState<CustomSubject[]>(
    initialCustomSubjects,
  );
  // Track subjects to auto-generate summary for (freshly created)
  const [autoGenIds, setAutoGenIds] = useState<Set<number>>(new Set());

  const sortedCustoms = useMemo(
    () =>
      [...customSubjects].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [customSubjects],
  );

  function handleCreated(s: CustomSubject) {
    setCustomSubjects((prev) => [s, ...prev.filter((p) => p.id !== s.id)]);
    setAutoGenIds((prev) => new Set(prev).add(s.id));
  }

  async function handleDelete(id: number) {
    const prev = customSubjects;
    setCustomSubjects(prev.filter((s) => s.id !== id));
    const res = await fetch("/api/subjects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setCustomSubjects(prev);
      alert("Suppression impossible.");
    }
  }

  async function handleTogglePublic(id: number, next: boolean) {
    const prev = customSubjects;
    setCustomSubjects((list) =>
      list.map((s) => (s.id === id ? { ...s, isPublic: next } : s)),
    );
    const res = await fetch("/api/subjects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublic: next }),
    });
    if (!res.ok) {
      setCustomSubjects(prev);
      alert("Mise à jour impossible.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#23251D] dark:text-[#EAECF6]">
          Sujets
          <span className="ml-2 text-[13px] font-normal text-[#9EA096]">
            ({builtInSubjects.length + sortedCustoms.length})
          </span>
        </h2>
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <AddSubjectForm theme={theme} onCreated={handleCreated} />
            <EmbedLink
              href={`/themes/${themeSlug}/mes-sujets`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md
                border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f]
                text-[#4D4F46] dark:text-[#9EA096]
                hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f] transition-colors"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Gérer mes sujets
            </EmbedLink>
          </div>
        )}
      </div>

      <ul className="list-none m-0 p-0 space-y-3">
        {sortedCustoms.map((s) => (
          <li key={`user-${s.id}`}>
            <SubjectCard
              sujet={s.sujet}
              type={s.type}
              domaine={s.domaine}
              theme={s.theme}
              color={color}
              source="user"
              subjectId={s.id}
              isPublic={s.isPublic}
              isMine={s.isMine}
              author={s.author}
              autoGenerate={autoGenIds.has(s.id)}
              onDelete={handleDelete}
              onTogglePublic={handleTogglePublic}
            />
          </li>
        ))}
        {builtInSubjects.map((s, i) => (
          <li key={`builtin-${i}`}>
            <SubjectCard
              sujet={s.sujet}
              type={s.type}
              domaine={s.domaine}
              theme={s.theme}
              color={color}
              source="builtin"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
