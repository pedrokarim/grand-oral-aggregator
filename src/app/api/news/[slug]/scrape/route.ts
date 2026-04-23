import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeArticle } from "@/lib/scraper";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const force = request.nextUrl.searchParams.get("force") === "true";

  try {
    const article = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    if (article.content && !force) {
      return NextResponse.json({ content: article.content, image: article.image ?? null });
    }

    const { content, image } = await scrapeArticle(article.url);

    if (!content) {
      return NextResponse.json(
        { error: "Impossible d'extraire le contenu de l'article" },
        { status: 422 }
      );
    }

    const updated = await prisma.newsArticle.update({
      where: { slug },
      data: {
        content,
        ...(image && !article.image ? { image } : {}),
      },
    });

    return NextResponse.json({ content: updated.content, image: updated.image });
  } catch {
    return NextResponse.json({ error: "Erreur lors du scraping" }, { status: 500 });
  }
}
