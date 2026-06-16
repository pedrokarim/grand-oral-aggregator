"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Pencil, Check } from "lucide-react";
import type { WidgetComponentProps } from "@/lib/widgets-types";

const STORAGE_KEY = "widget-countdown-target";
const DEFAULT_TARGET = "2026-06-30";

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

function diff(target: string): Parts {
  const end = new Date(`${target}T08:00:00`).getTime();
  let delta = end - Date.now();
  const past = delta < 0;
  delta = Math.abs(delta);
  const days = Math.floor(delta / 86_400_000);
  const hours = Math.floor((delta % 86_400_000) / 3_600_000);
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  const seconds = Math.floor((delta % 60_000) / 1000);
  return { days, hours, minutes, seconds, past };
}

export function CountdownWidget({ state }: WidgetComponentProps) {
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [parts, setParts] = useState<Parts | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_TARGET);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setTarget(raw);
        setDraft(raw);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setParts(diff(target));
    const t = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  const save = useCallback(() => {
    if (!draft) return;
    setTarget(draft);
    setEditing(false);
    try {
      localStorage.setItem(STORAGE_KEY, draft);
    } catch {
      /* ignore */
    }
  }, [draft]);

  const isBold = state.style === "bold";
  const accent = isBold || (parts && !parts.past && parts.days <= 7);

  const formattedDate = new Date(`${target}T08:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="h-full flex flex-col p-3 gap-1.5">
      <div className="flex items-center gap-1.5 shrink-0">
        <CalendarClock className="w-3.5 h-3.5 text-[#EB9D2A]" />
        <span className="text-[11px] uppercase tracking-wider text-[#9EA096] font-semibold flex-1 truncate">
          {parts?.past ? "Depuis le jour J" : "Jour J"}
        </span>
        <button
          onClick={() => {
            setEditing((e) => !e);
            setDraft(target);
          }}
          className="p-1 rounded-[5px] text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] hover:bg-[#E5E7E0]/60 dark:hover:bg-[#2a2b2f]/60 transition-colors cursor-default"
          aria-label="Modifier la date"
        >
          <Pencil className="w-3 h-3" />
        </button>
      </div>

      {editing ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
          <input
            type="date"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-2 py-1 text-[13px] rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] text-[#23251D] dark:text-[#EAECF6] cursor-text"
          />
          <button
            onClick={save}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] rounded-md bg-[#EB9D2A] text-[#FDFDF8] hover:bg-[#CD8407] transition-colors cursor-default"
          >
            <Check className="w-3.5 h-3.5" />
            Valider
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 flex items-center justify-center min-h-0">
            {parts && (
              <div className="flex items-end gap-2">
                <Unit value={parts.days} label="j" big accent={!!accent} />
                <Unit value={parts.hours} label="h" accent={!!accent} />
                <Unit value={parts.minutes} label="min" accent={!!accent} />
                <Unit value={parts.seconds} label="s" accent={!!accent} />
              </div>
            )}
          </div>
          <div className="text-[11px] text-center text-[#9EA096] capitalize shrink-0 truncate">
            {formattedDate}
          </div>
        </>
      )}
    </div>
  );
}

function Unit({
  value,
  label,
  big,
  accent,
}: {
  value: number;
  label: string;
  big?: boolean;
  accent: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-mono font-bold tabular-nums leading-none ${
          accent ? "text-[#EB9D2A]" : "text-[#23251D] dark:text-[#EAECF6]"
        }`}
        style={{ fontSize: big ? "min(2.6rem, 18cqw)" : "min(1.5rem, 11cqw)" }}
      >
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[#9EA096]">{label}</span>
    </div>
  );
}
