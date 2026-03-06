import { NextRequest, NextResponse } from "next/server";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { prisma } from "@/lib/prisma";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function scrapeArticleContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

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

  if (!res.ok) return "";

  const html = await res.text();
  let article;
  try {
    const { document } = parseHTML(html);
    const reader = new Readability(document, { charThreshold: 100 });
    article = reader.parse();
  } catch {
    return "";
  }

  if (!article?.textContent) return "";

  return article.textContent
    .split(/\n{2,}/)
    .map((p: string) => p.replace(/\s+/g, " ").trim())
    .filter((p: string) => p.length > 30)
    .slice(0, 20)
    .join("\n\n");
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const article = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    // If content already exists, return it
    if (article.content) {
      return NextResponse.json({ content: article.content });
    }

    // Scrape the article URL
    const content = await scrapeArticleContent(article.url);

    if (!content) {
      return NextResponse.json(
        { error: "Impossible d'extraire le contenu de l'article" },
        { status: 422 }
      );
    }

    // Save to DB for future use
    await prisma.newsArticle.update({
      where: { slug },
      data: { content },
    });

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Erreur lors du scraping" }, { status: 500 });
  }
}
