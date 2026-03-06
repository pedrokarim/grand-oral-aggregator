import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

export async function GET() {
  try {
    const sessionId = await getSessionId();

    const entries = await prisma.newsHistory.findMany({
      where: { sessionId },
      include: { article: { include: { theme: true } } },
      orderBy: { visitedAt: "desc" },
      take: 50,
    });

    const history = entries.map((e) => ({
      slug: e.article.slug,
      title: e.article.title,
      source: e.article.source,
      theme: e.article.theme.name,
      favicon: e.article.favicon,
      visitedAt: e.visitedAt.toISOString(),
    }));

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ history: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const { slug } = await request.json();

    const article = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await prisma.newsHistory.upsert({
      where: { articleId_sessionId: { articleId: article.id, sessionId } },
      update: { visitedAt: new Date() },
      create: { articleId: article.id, sessionId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const sessionId = await getSessionId();
    await prisma.newsHistory.deleteMany({ where: { sessionId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
