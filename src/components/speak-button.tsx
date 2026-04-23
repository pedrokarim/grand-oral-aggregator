"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play, Square } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { speak, stopSpeaking, stripMarkdown } from "@/lib/tts";

interface SpeakButtonProps {
  text: string;
  label?: string;
}

export function SpeakButton({ text, label = "Écouter" }: SpeakButtonProps) {
  const [settings] = useSettings();
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  function start() {
    const cleaned = stripMarkdown(text);
    if (!cleaned) return;
    const utter = speak(cleaned, settings.tts);
    if (!utter) return;
    utterRef.current = utter;
    setState("playing");
    utter.onend = () => setState("idle");
    utter.onerror = () => setState("idle");
  }

  function togglePause() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (state === "playing") {
      window.speechSynthesis.pause();
      setState("paused");
    } else if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
    }
  }

  function stop() {
    stopSpeaking();
    setState("idle");
  }

  if (typeof window !== "undefined" && !window.speechSynthesis) return null;

  const baseBtn =
    "inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-md " +
    "border border-transparent hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f] " +
    "text-[#4D4F46] dark:text-[#9EA096] " +
    "hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f] transition-colors cursor-default";

  if (state === "idle") {
    return (
      <button onClick={start} className={baseBtn} title="Lire à voix haute">
        <Volume2 className="h-3.5 w-3.5" />
        {label}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button onClick={togglePause} className={baseBtn} title={state === "playing" ? "Pause" : "Reprendre"}>
        {state === "playing" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {state === "playing" ? "Pause" : "Reprendre"}
      </button>
      <button onClick={stop} className={baseBtn} title="Arrêter">
        <Square className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
