// Re-scrape news articles whose content contains U+FFFD ('�'), i.e. that were
// fetched before the scraper learned to honour Content-Type / <meta> charset.
//
// Safe to re-run; only touches rows/entries that still look corrupt.
//
// Local DB:
//   bun run scripts/fix-news-encoding.ts
// Production DB (run from your machine against the prod Postgres):
//   DATABASE_URL="postgres://...prod..." bun run scripts/fix-news-encoding.ts
// Preview without writing:
//   bun run scripts/fix-news-encoding.ts --dry-run

import "dotenv/config";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { scrapeArticle } from "../src/lib/scraper";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CACHE_DIR = join(import.meta.dir, "..", "resources", "news-cache");
const DRY_RUN = process.argv.includes("--dry-run");
const REPLACEMENT_CHAR = "�";

const isCorrupt = (s: string | null | undefined): boolean =>
  !!s && s.includes(REPLACEMENT_CHAR);

interface CacheArticle {
  url: string;
  title?: string;
  description?: string;
  content?: string;
  image?: string;
}
interface CacheFile {
  articles: CacheArticle[];
  fetchedAt: string;
}

async function main() {
  if (DRY_RUN) console.log("[DRY RUN] no writes will happen\n");

  // 1. Load every cache file and collect corrupt URLs from them.
  const caches = new Map<string, CacheFile>();
  const corruptUrls = new Set<string>();

  if (existsSync(CACHE_DIR)) {
    for (const name of readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json"))) {
      const path = join(CACHE_DIR, name);
      const data = JSON.parse(readFileSync(path, "utf-8")) as CacheFile;
      caches.set(path, data);
      for (const a of data.articles) {
        if (isCorrupt(a.content) || isCorrupt(a.title) || isCorrupt(a.description)) {
          corruptUrls.add(a.url);
        }
      }
    }
  }

  // 2. Add any corrupt rows from the DB.
  const dbCorrupt = await prisma.newsArticle.findMany({
    where: {
      OR: [
        { content: { contains: REPLACEMENT_CHAR } },
        { title: { contains: REPLACEMENT_CHAR } },
        { description: { contains: REPLACEMENT_CHAR } },
      ],
    },
    select: { url: true },
  });
  for (const { url } of dbCorrupt) corruptUrls.add(url);

  console.log(
    `Found ${corruptUrls.size} corrupt URL(s) (${caches.size} cache files, ${dbCorrupt.length} DB rows).\n`
  );

  if (corruptUrls.size === 0) {
    console.log("Nothing to do.");
    return;
  }

  // 3. Re-scrape each URL once and propagate the fix to every place that has it.
  let fixed = 0;
  let failed = 0;

  for (const url of corruptUrls) {
    process.stdout.write(`  ${url.slice(0, 90)}… `);

    if (DRY_RUN) {
      console.log("(dry run, skipped)");
      continue;
    }

    const { content, image } = await scrapeArticle(url);

    if (!content) {
      console.log("FAILED (no content extracted)");
      failed++;
      continue;
    }
    if (isCorrupt(content)) {
      console.log("FAILED (still corrupt — source likely has bad bytes)");
      failed++;
      continue;
    }

    // DB: a URL can belong to multiple themes, so use updateMany.
    await prisma.newsArticle.updateMany({
      where: { url },
      data: {
        content,
        ...(image ? { image } : {}),
      },
    });

    // Cache files: patch every entry sharing this URL.
    for (const data of caches.values()) {
      for (const a of data.articles) {
        if (a.url !== url) continue;
        a.content = content;
        if (image && !a.image) a.image = image;
      }
    }

    fixed++;
    console.log(`OK (${content.length} chars)`);
    await new Promise((r) => setTimeout(r, 300));
  }

  // 4. Persist the patched cache files.
  if (!DRY_RUN) {
    for (const [path, data] of caches) {
      writeFileSync(path, JSON.stringify(data, null, 2));
    }
  }

  console.log(`\nDone. Fixed ${fixed}, failed ${failed}.`);
}

main().finally(() => prisma.$disconnect());
