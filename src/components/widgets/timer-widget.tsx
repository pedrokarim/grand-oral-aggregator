"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { WidgetComponentProps } from "@/lib/widgets-types";

const PRESETS: { label: string; seconds: number }[] = [
  { label: "Exposé 5 min", seconds: 5 * 60 },
  { label: "Échange 10 min", seconds: 10 * 60 },
  { label: "20 min", seconds: 20 * 60 },
];

const STORAGE_KEY = "widget-timer-preset";

function fmt(total: number): string {
  const sign = total < 0 ? "-" : "";
  const abs = Math.abs(total);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${sign}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimerWidget({ state }: WidgetComponentProps) {
  const [duration, setDuration] = useState(PRESETS[0].seconds);
  const [remaining, setRemaining] = useState(PRESETS[0].seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n) && n > 0) {
          setDuration(n);
          setRemaining(n);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const selectPreset = useCallback((seconds: number) => {
    setRunning(false);
    setDuration(seconds);
    setRemaining(seconds);
    try {
      localStorage.setItem(STORAGE_KEY, String(seconds));
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(duration);
  }, [duration]);

  const isBold = state.style === "bold";
  const overtime = remaining < 0;
  const lowTime = remaining >= 0 && remaining <= 30;

  const timeColor = overtime
    ? "text-[#D1453B]"
    : lowTime
      ? "text-[#EB9D2A]"
      : isBold
        ? "text-[#EB9D2A]"
        : "text-[#23251D] dark:text-[#EAECF6]";

  return (
    <div className="h-full flex flex-col p-3 gap-2">
      <div className="flex flex-wrap gap-1 shrink-0">
        {PRESETS.map((p) => {
          const active = p.seconds === duration;
          return (
            <button
              key={p.seconds}
              onClick={() => selectPreset(p.seconds)}
              className={`px-1.5 py-0.5 text-[11px] rounded-md border transition-colors cursor-default ${
                active
                  ? "border-[#EB9D2A] bg-[#EB9D2A]/10 text-[#23251D] dark:text-[#EAECF6]"
                  : "border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:border-[#BFC1B7] dark:hover:border-[#555]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <div
          className={`font-mono font-bold tracking-tight tabular-nums ${timeColor} ${
            overtime ? "animate-pulse" : ""
          }`}
          style={{ fontSize: "min(3rem, 26cqw)", lineHeight: 1 }}
        >
          {fmt(remaining)}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[12px] font-medium rounded-md bg-[#EB9D2A] text-[#FDFDF8] hover:bg-[#CD8407] transition-colors cursor-default"
        >
          {running ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              {remaining === duration ? "Démarrer" : "Reprendre"}
            </>
          )}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center p-1.5 rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/60 dark:hover:bg-[#2a2b2f]/60 transition-colors cursor-default"
          aria-label="Réinitialiser le minuteur"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
