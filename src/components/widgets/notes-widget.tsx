"use client";

import { useEffect, useRef, useState } from "react";
import { StickyNote, Check } from "lucide-react";
import type { WidgetComponentProps } from "@/lib/widgets-types";

const STORAGE_KEY = "widget-notes-content";

export function NotesWidget(_props: WidgetComponentProps) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const loadedRef = useRef(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setValue(raw);
    } catch {
      /* ignore */
    }
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, value);
        setSaved(true);
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 1200);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#D2D3CC] dark:border-[#3a3b3f] shrink-0">
        <StickyNote className="w-3.5 h-3.5 text-[#9EA096]" />
        <span className="text-[11px] uppercase tracking-wider text-[#9EA096] font-semibold">
          Bloc-notes
        </span>
        <span
          className={`ml-auto inline-flex items-center gap-1 text-[10px] text-[#9EA096] transition-opacity ${
            saved ? "opacity-100" : "opacity-0"
          }`}
        >
          <Check className="w-3 h-3 text-[#6E9B5B]" />
          Enregistré
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Idées, accroches, plan, mots-clés…"
        spellCheck={false}
        className="flex-1 w-full resize-none bg-transparent px-3 py-2 text-[13px] leading-relaxed text-[#23251D] dark:text-[#EAECF6] placeholder:text-[#9EA096]/70 outline-none cursor-text"
      />
    </div>
  );
}
