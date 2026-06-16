"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, X, StickyNote } from "lucide-react";
import type { WidgetComponentProps } from "@/lib/widgets-types";

const STORAGE_KEY = "widget-postits";

type PostitColor = "yellow" | "pink" | "green" | "blue" | "orange";

interface Postit {
  id: string;
  text: string;
  color: PostitColor;
}

const COLORS: {
  id: PostitColor;
  bg: string;
  border: string;
  text: string;
  dot: string;
}[] = [
  {
    id: "yellow",
    bg: "bg-[#FFF9C4] dark:bg-[#4a4520]",
    border: "border-[#F0E68C] dark:border-[#6b6330]",
    text: "text-[#3d3a1f] dark:text-[#f5efb0]",
    dot: "bg-[#FFF176]",
  },
  {
    id: "pink",
    bg: "bg-[#FCE4EC] dark:bg-[#4a2030]",
    border: "border-[#F8BBD9] dark:border-[#6b3050]",
    text: "text-[#4a2030] dark:text-[#f5d0e0]",
    dot: "bg-[#F48FB1]",
  },
  {
    id: "green",
    bg: "bg-[#E8F5E9] dark:bg-[#1f3a24]",
    border: "border-[#C8E6C9] dark:border-[#305a38]",
    text: "text-[#1f3a24] dark:text-[#c8e6c9]",
    dot: "bg-[#81C784]",
  },
  {
    id: "blue",
    bg: "bg-[#E3F2FD] dark:bg-[#1a2a3a]",
    border: "border-[#BBDEFB] dark:border-[#2a4560]",
    text: "text-[#1a2a3a] dark:text-[#bbdefb]",
    dot: "bg-[#64B5F6]",
  },
  {
    id: "orange",
    bg: "bg-[#FFF3E0] dark:bg-[#4a3018]",
    border: "border-[#FFE0B2] dark:border-[#6b4828]",
    text: "text-[#4a3018] dark:text-[#ffe0b2]",
    dot: "bg-[#FFB74D]",
  },
];

const COLOR_MAP = Object.fromEntries(COLORS.map((c) => [c.id, c])) as Record<
  PostitColor,
  (typeof COLORS)[number]
>;

const ROTATIONS = ["-rotate-1", "rotate-1", "-rotate-[0.5deg]", "rotate-[0.5deg]", "rotate-0"];

function nextColor(current: PostitColor): PostitColor {
  const i = COLORS.findIndex((c) => c.id === current);
  return COLORS[(i + 1) % COLORS.length].id;
}

function newPostit(color: PostitColor = "yellow"): Postit {
  return { id: crypto.randomUUID(), text: "", color };
}

export function PostitsWidget(_props: WidgetComponentProps) {
  const [notes, setNotes] = useState<Postit[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Postit[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          loadedRef.current = true;
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setNotes([
      newPostit("yellow"),
      newPostit("pink"),
      newPostit("green"),
    ]);
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [notes]);

  const add = useCallback(() => {
    const color = COLORS[notes.length % COLORS.length].id;
    setNotes((prev) => [...prev, newPostit(color)]);
  }, [notes.length]);

  const remove = useCallback((id: string) => {
    setNotes((prev) => (prev.length <= 1 ? prev : prev.filter((n) => n.id !== id)));
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const cycleColor = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, color: nextColor(n.color) } : n)),
    );
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#D2D3CC] dark:border-[#3a3b3f] shrink-0">
        <StickyNote className="w-3.5 h-3.5 text-[#9EA096]" />
        <span className="text-[11px] uppercase tracking-wider text-[#9EA096] font-semibold">
          Post-its
        </span>
        <button
          onClick={add}
          className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/60 dark:hover:bg-[#2a2b2f]/60 transition-colors cursor-default"
        >
          <Plus className="w-3 h-3" />
          Ajouter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2 auto-rows-min">
          {notes.map((note, i) => {
            const c = COLOR_MAP[note.color];
            return (
              <div
                key={note.id}
                className={`relative rounded-sm border shadow-sm ${c.bg} ${c.border} ${ROTATIONS[i % ROTATIONS.length]} transition-transform hover:rotate-0 hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-1 px-1.5 pt-1">
                  <button
                    onClick={() => cycleColor(note.id)}
                    className={`w-3 h-3 rounded-full border border-black/10 shrink-0 ${c.dot} cursor-default`}
                    title="Changer la couleur"
                    aria-label="Changer la couleur"
                  />
                  {notes.length > 1 && (
                    <button
                      onClick={() => remove(note.id)}
                      className="ml-auto p-0.5 rounded text-black/30 hover:text-black/60 dark:text-white/30 dark:hover:text-white/60 transition-colors cursor-default"
                      aria-label="Supprimer le post-it"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <textarea
                  value={note.text}
                  onChange={(e) => updateText(note.id, e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  placeholder="…"
                  rows={3}
                  spellCheck={false}
                  className={`w-full resize-none bg-transparent px-2 pb-2 pt-0.5 text-[12px] leading-snug outline-none cursor-text placeholder:text-black/25 dark:placeholder:text-white/25 ${c.text}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
