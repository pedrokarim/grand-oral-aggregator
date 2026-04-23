import type { TTSConfig } from "./settings";

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<br\s*\/?>/gi, ". ")
    .replace(/<[^>]+>/g, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, (line) =>
      line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
        .join(", ")
    )
    .replace(/^\s*[:|-]+\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function speak(text: string, config: TTSConfig): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = config.lang;
  utter.rate = config.rate;
  utter.pitch = config.pitch;
  utter.volume = config.volume;

  if (config.voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.voiceURI === config.voiceURI);
    if (voice) utter.voice = voice;
  }

  window.speechSynthesis.speak(utter);
  return utter;
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
