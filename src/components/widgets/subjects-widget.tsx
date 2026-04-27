"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, Shuffle, ArrowRight } from "lucide-react";
import { subjects, slugifySubject, type Subject } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import type { WidgetComponentProps } from "@/lib/widgets-types";

function pickRandom(): Subject {
  return subjects[Math.floor(Math.random() * subjects.length)];
}

export function SubjectsWidget({ onOpenRoute }: WidgetComponentProps) {
  const [pick, setPick] = useState<Subject | null>(null);

  useEffect(() => {
    setPick(pickRandom());
  }, []);

  const reroll = useCallback(() => {
    setPick(pickRandom());
  }, []);

  if (!pick) {
    return null;
  }

  const color = getThemeColor(pick.theme);
  const slug = slugifySubject(pick.theme, pick.sujet);

  return (
    <div className="h-full flex flex-col p-3 gap-2">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#EB9D2A]" />
        <span className="text-[11px] uppercase tracking-wider text-[#9EA096] font-semibold">
          Sujet pour s'entraîner
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        <span
          className={`inline-flex self-start px-1.5 py-0 text-[10px] font-medium rounded mb-2 ${color.bgLight} ${color.text}`}
        >
          {pick.theme}
        </span>
        <p className="text-[14px] font-semibold text-[#23251D] dark:text-[#EAECF6] leading-snug line-clamp-3">
          {pick.sujet}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={reroll}
          className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/60 dark:hover:bg-[#2a2b2f]/60 transition-colors cursor-default"
        >
          <Shuffle className="w-3 h-3" />
          Autre
        </button>
        <button
          onClick={() => onOpenRoute(`/sujets/${slug}`, `${slug}.mdx`)}
          className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md bg-[#EB9D2A] text-[#FDFDF8] hover:bg-[#CD8407] transition-colors cursor-default"
        >
          Ouvrir
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
