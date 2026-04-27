import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export interface ScrapedContent {
  content: string;
  image: string;
}

// SSRF guard: refuse anything that isn't a public http(s) URL pointing to a
// real hostname. We don't resolve DNS here (the scraper's network call will),
// so this only catches the obvious "literal local IP" cases. Combined with
// the URL coming exclusively from server-side scrapers, that's enough.
function isPublicHttpUrl(rawUrl: string): boolean {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost")) return false;
  if (/^(?:0\.|10\.|127\.|169\.254\.|192\.168\.)/.test(host)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
    return false;
  }
  return true;
}

async function fetchHtml(url: string, timeoutMs = 20000): Promise<string | null> {
  if (!isPublicHttpUrl(url)) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const text = await res.text();
    if (!/<(?:body|html|article|main)\b/i.test(text)) return null;
    return text;
  } catch {
    return null;
  }
}

function normalizeParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 20)
    .slice(0, 30)
    .join("\n\n");
}

function extractImage(document: Document): string {
  const og = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
  if (og) return og;
  const tw = document.querySelector('meta[name="twitter:image"]')?.getAttribute("content");
  if (tw) return tw;
  return "";
}

function extractViaReadability(html: string): ScrapedContent {
  try {
    const { document } = parseHTML(html);
    const image = extractImage(document as unknown as Document);
    const reader = new Readability(document, { charThreshold: 50 });
    const article = reader.parse();
    if (!article?.textContent) return { content: "", image };
    return { content: normalizeParagraphs(article.textContent), image };
  } catch {
    return { content: "", image: "" };
  }
}

function extractFallback(html: string): ScrapedContent {
  try {
    const { document } = parseHTML(html);
    const image = extractImage(document as unknown as Document);
    const root =
      document.querySelector("article") ??
      document.querySelector("main") ??
      document.querySelector("body");
    if (!root) return { content: "", image };
    const paragraphs = Array.from(root.querySelectorAll("p"))
      .map((p) => (p.textContent || "").replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 20)
      .slice(0, 30);
    return { content: paragraphs.join("\n\n"), image };
  } catch {
    return { content: "", image: "" };
  }
}

export async function scrapeArticle(url: string): Promise<ScrapedContent> {
  let html = await fetchHtml(url);
  if (!html) {
    await new Promise((r) => setTimeout(r, 500));
    html = await fetchHtml(url);
  }
  if (!html) return { content: "", image: "" };

  const primary = extractViaReadability(html);
  if (primary.content.length >= 200) return primary;

  const fallback = extractFallback(html);
  const image = primary.image || fallback.image;
  const content =
    fallback.content.length > primary.content.length ? fallback.content : primary.content;
  return { content, image };
}
