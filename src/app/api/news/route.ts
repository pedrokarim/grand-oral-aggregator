import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import type { CachedNews, NewsArticle } from "@/lib/news";

const CACHE_DIR = join(process.cwd(), "resources", "news-cache");

export async function GET(request: NextRequest) {
  const theme = request.nextUrl.searchParams.get("theme");

  try {
    if (theme) {
      const filePath = join(CACHE_DIR, `${slugify(theme)}.json`);
      const data: CachedNews = JSON.parse(await readFile(filePath, "utf-8"));
      return NextResponse.json(data);
    }

    // Return all cached news
    const { readdir } = await import("fs/promises");
    let allArticles: NewsArticle[] = [];

    try {
      const files = await readdir(CACHE_DIR);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const data: CachedNews = JSON.parse(
          await readFile(join(CACHE_DIR, file), "utf-8")
        );
        allArticles.push(...data.articles);
      }
    } catch {
      // Cache dir doesn't exist yet
    }

    allArticles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({ articles: allArticles.slice(0, 30) });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
