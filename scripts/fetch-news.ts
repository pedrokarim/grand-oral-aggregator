// Cron script to fetch news for all themes.
// Usage: bun run scripts/fetch-news.ts
// Uses Bing News RSS by default (direct article links).
// Set NEWS_API_KEY for NewsAPI.org as alternative source.
// Schedule with cron: 0 0/6 * * * cd /path/to/project && bun run scripts/fetch-news.ts

import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { scrapeArticle as scrapeArticleShared } from "../src/lib/scraper";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CACHE_DIR = join(import.meta.dir, "..", "resources", "news-cache");
mkdirSync(CACHE_DIR, { recursive: true });

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const themeKeywords: Record<string, string[]> = {
  "SI et environnement": ["green IT", "sobriété numérique", "datacenter énergie", "numérique responsable"],
  "Cybersecurité": ["cybersécurité", "cyberattaque", "ransomware", "ANSSI"],
  "Cloud et virtualisation": ["cloud computing", "migration cloud", "cloud souverain", "conteneurisation"],
  "Big Data": ["big data", "data analytics", "données massives", "RGPD données"],
  "Développement": ["DevOps", "CI/CD", "qualité logicielle", "déploiement continu"],
  "Mobilité": ["BYOD entreprise", "mobilité numérique", "MDM mobile", "télétravail IT"],
  "Management et stratégie": ["DSI transformation", "gouvernance IT", "transformation digitale"],
  "Blockchain": ["blockchain", "smart contract", "Web3"],
  "Intelligence artificielle": ["intelligence artificielle entreprise", "IA entreprise", "machine learning"],
  "Optimisation du SI": ["optimisation SI", "ITIL", "amélioration continue IT", "veille technologique"],
};

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: string;
  theme: string;
  image?: string;
  favicon?: string;
  slug: string;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function slugifyTitle(title: string): string {
  return slugify(title).slice(0, 80);
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

function stripHtml(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function getFaviconUrl(url: string): string {
  const domain = extractDomain(url);
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

/** Extract real URL from Bing News redirect link */
function extractBingRealUrl(bingLink: string): string {
  const decoded = decodeHtmlEntities(bingLink);
  const urlParam = decoded.match(/[?&]url=([^&]+)/);
  if (urlParam) return decodeURIComponent(urlParam[1]);
  return decoded;
}

async function scrapeArticle(url: string) {
  console.log(`    [scrape] ${url.slice(0, 80)}...`);
  return scrapeArticleShared(url);
}

/* ============================================================
   Bing News RSS (default — gives direct article links)
   ============================================================ */

async function fetchFromBingNews(query: string, theme: string): Promise<NewsArticle[]> {
  const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss&mkt=fr-FR`;

  try {
    const response = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
    const xml = await response.text();

    const articles: NewsArticle[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && articles.length < 5) {
      const item = match[1];
      const title = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
      const rawLink = decodeHtmlEntities(item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "");
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";
      const rawDesc = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "";
      const description = stripHtml(rawDesc).slice(0, 300);

      // Bing source is in <news:source> or extract from domain
      const sourceTag = stripHtml(item.match(/<news:source>([\s\S]*?)<\/news:source>/i)?.[1] ?? "");

      if (!title || !rawLink) continue;

      // Extract real article URL from Bing redirect
      const articleUrl = extractBingRealUrl(rawLink);
      const source = sourceTag || extractDomain(articleUrl).replace(/^www\./, "");
      const favicon = getFaviconUrl(articleUrl);

      // Scrape the article content
      const { content, image } = await scrapeArticle(articleUrl);

      articles.push({
        title,
        description: description.length > 20 ? description : `${title} - ${source}`,
        content,
        url: articleUrl,
        source,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        theme,
        image: image || undefined,
        favicon: favicon || undefined,
        slug: slugifyTitle(title),
      });
    }

    return articles;
  } catch (error) {
    console.error(`Error fetching Bing News for "${query}":`, error);
    return [];
  }
}

/* ============================================================
   NewsAPI (requires API key)
   ============================================================ */

async function fetchFromNewsAPI(query: string, theme: string, apiKey: string): Promise<NewsArticle[]> {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=fr&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "ok") return [];

    const articles: NewsArticle[] = [];
    for (const a of data.articles) {
      const articleUrl = a.url ?? "";
      const { content, image } = await scrapeArticle(articleUrl);
      const favicon = getFaviconUrl(articleUrl);

      articles.push({
        title: a.title ?? "",
        description: a.description ?? "",
        content,
        url: articleUrl,
        source: a.source?.name ?? "Unknown",
        publishedAt: a.publishedAt ?? new Date().toISOString(),
        theme,
        image: image || a.urlToImage || undefined,
        favicon: favicon || undefined,
        slug: slugifyTitle(a.title ?? ""),
      });
    }
    return articles;
  } catch (error) {
    console.error(`Error fetching NewsAPI for "${query}":`, error);
    return [];
  }
}

/* ============================================================
   Main
   ============================================================ */

async function main() {
  const apiKey = process.env.NEWS_API_KEY;
  const useNewsAPI = !!apiKey;

  console.log(`Fetching news using ${useNewsAPI ? "NewsAPI" : "Bing News RSS"}...`);

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    console.log(`\nTheme: ${theme}`);
    let allArticles: NewsArticle[] = [];

    for (const keyword of keywords) {
      const articles = useNewsAPI
        ? await fetchFromNewsAPI(keyword, theme, apiKey!)
        : await fetchFromBingNews(keyword, theme);

      allArticles.push(...articles);
      const withContent = articles.filter((a) => a.content.length > 0).length;
      console.log(`  "${keyword}" -> ${articles.length} articles (${withContent} with content)`);

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    }

    // Deduplicate by slug
    const seen = new Set<string>();
    allArticles = allArticles.filter((a) => {
      if (seen.has(a.slug)) return false;
      seen.add(a.slug);
      return true;
    });

    // Sort by date
    allArticles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Keep top 10 per theme
    allArticles = allArticles.slice(0, 10);

    const cacheFile = join(CACHE_DIR, `${slugify(theme)}.json`);
    writeFileSync(
      cacheFile,
      JSON.stringify(
        { articles: allArticles, fetchedAt: new Date().toISOString() },
        null,
        2
      )
    );

    const totalContent = allArticles.filter((a) => a.content.length > 0).length;
    console.log(`  -> ${allArticles.length} articles cached (${totalContent} with content)`);

    // Write to PostgreSQL
    const themeRecord = await prisma.theme.findUnique({ where: { name: theme } });
    if (themeRecord) {
      for (const article of allArticles) {
        try {
          await prisma.newsArticle.upsert({
            where: { url_themeId: { url: article.url, themeId: themeRecord.id } },
            update: {
              title: article.title,
              description: article.description,
              content: article.content || null,
              source: article.source,
              image: article.image ?? null,
              favicon: article.favicon ?? null,
              slug: article.slug,
              publishedAt: new Date(article.publishedAt),
            },
            create: {
              title: article.title,
              description: article.description,
              content: article.content || null,
              url: article.url,
              source: article.source,
              image: article.image ?? null,
              favicon: article.favicon ?? null,
              slug: article.slug,
              publishedAt: new Date(article.publishedAt),
              themeId: themeRecord.id,
            },
          });
        } catch {
          // Slug collision — append theme suffix
          const suffixedSlug = `${article.slug}-${themeRecord.id}`;
          await prisma.newsArticle.upsert({
            where: { url_themeId: { url: article.url, themeId: themeRecord.id } },
            update: {
              title: article.title,
              description: article.description,
              content: article.content || null,
              source: article.source,
              image: article.image ?? null,
              favicon: article.favicon ?? null,
              slug: suffixedSlug,
              publishedAt: new Date(article.publishedAt),
            },
            create: {
              title: article.title,
              description: article.description,
              content: article.content || null,
              url: article.url,
              source: article.source,
              image: article.image ?? null,
              favicon: article.favicon ?? null,
              slug: suffixedSlug,
              publishedAt: new Date(article.publishedAt),
              themeId: themeRecord.id,
            },
          });
        }
      }
      console.log(`  -> ${allArticles.length} articles saved to DB`);
    }
  }

  console.log("\nDone! News cached in resources/news-cache/ and PostgreSQL.");
}

main().finally(() => prisma.$disconnect());
