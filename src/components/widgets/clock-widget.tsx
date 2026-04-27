"use client";

import { useEffect, useState } from "react";
import type { WidgetComponentProps } from "@/lib/widgets-types";

const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function ClockWidget({ state }: WidgetComponentProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return <div className="h-full flex items-center justify-center text-[#9EA096]">…</div>;
  }

  const isBold = state.style === "bold";

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-3 gap-1">
      <div
        className={`font-mono font-bold tracking-tight tabular-nums ${
          isBold ? "text-[#EB9D2A]" : "text-[#23251D] dark:text-[#EAECF6]"
        }`}
        style={{ fontSize: "min(3.5rem, 22cqw)", lineHeight: 1 }}
      >
        {pad(now.getHours())}
        <span className="opacity-50">:</span>
        {pad(now.getMinutes())}
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#9EA096]">
        {DAYS[now.getDay()]} {now.getDate()} {MONTHS[now.getMonth()]}
      </div>
    </div>
  );
}
