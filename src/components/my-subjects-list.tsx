"use client";

import { useState } from "react";
import { SubjectCard } from "@/components/subject-card";
import type { ThemeColor } from "@/lib/theme-colors";
import type { CustomSubject } from "@/lib/data";

interface MySubjectsListProps {
  color: ThemeColor;
  initialSubjects: CustomSubject[];
}

export function MySubjectsList({ color, initialSubjects }: MySubjectsListProps) {
  const [subjects, setSubjects] = useState<CustomSubject[]>(initialSubjects);

  async function handleDelete(id: number) {
    const prev = subjects;
    setSubjects(prev.filter((s) => s.id !== id));
    const res = await fetch("/api/subjects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setSubjects(prev);
      alert("Suppression impossible.");
    }
  }

  async function handleTogglePublic(id: number, next: boolean) {
    const prev = subjects;
    setSubjects((list) =>
      list.map((s) => (s.id === id ? { ...s, isPublic: next } : s)),
    );
    const res = await fetch("/api/subjects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublic: next }),
    });
    if (!res.ok) {
      setSubjects(prev);
      alert("Mise à jour impossible.");
    }
  }

  if (subjects.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[#D2D3CC] dark:border-[#3a3b3f] p-8 text-center text-[#9EA096]">
        Vous n'avez ajouté aucun sujet dans ce thème pour l'instant.
      </div>
    );
  }

  return (
    <ul className="list-none m-0 p-0 space-y-3">
      {subjects.map((s) => (
        <li key={s.id}>
          <SubjectCard
            sujet={s.sujet}
            type={s.type}
            domaine={s.domaine}
            theme={s.theme}
            color={color}
            source="user"
            subjectId={s.id}
            isPublic={s.isPublic}
            isMine={true}
            author={s.author}
            onDelete={handleDelete}
            onTogglePublic={handleTogglePublic}
          />
        </li>
      ))}
    </ul>
  );
}
