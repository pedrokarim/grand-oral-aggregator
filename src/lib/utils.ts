import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeDescription(desc: string): string {
  if (!desc) return "Cliquez pour lire l'article";

  let cleaned = desc
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 20) return "Cliquez pour lire l'article";
  if (cleaned.length > 250) cleaned = cleaned.slice(0, 250) + "...";

  return cleaned;
}
