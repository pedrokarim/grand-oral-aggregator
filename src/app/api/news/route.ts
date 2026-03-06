import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

export async function GET(request: NextRequest) {
  const theme = request.nextUrl.searchParams.get("theme");

  try {
    const where = theme ? { theme: { name: theme } } : {};

    const articles = await prisma.newsArticle.findMany({
      where,
      include: { theme: true },
      orderBy: { publishedAt: "desc" },
      take: 30,
    });

    // Check visited status
    let visitedSlugs = new Set<string>();
    try {
      const sessionId = await getSessionId();
      const visited = await prisma.newsHistory.findMany({
        where: { sessionId },
        select: { article: { select: { slug: true } } },
      });
      visitedSlugs = new Set(visited.map((v) => v.article.slug));
    } catch {
      // No session cookie yet
    }

    const mapped = articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      description: a.description,
      content: a.content,
      url: a.url,
      source: a.source,
      image: a.image,
      favicon: a.favicon,
      publishedAt: a.publishedAt.toISOString(),
      theme: a.theme.name,
      visited: visitedSlugs.has(a.slug),
    }));

    return NextResponse.json({ articles: mapped });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
