import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai-providers";
import { prisma } from "@/lib/prisma";
import type { AIProviderConfig } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, subject, theme, provider, apiKey, model, baseUrl, articleContent } = body;

    if (!subject || !theme || !provider || (!apiKey && provider !== "ollama")) {
      return NextResponse.json(
        { error: "Paramètres manquants (subject, theme, provider, apiKey)" },
        { status: 400 }
      );
    }

    // Check cache if this is an article (has slug)
    if (slug && provider && model) {
      const article = await prisma.newsArticle.findUnique({ where: { slug } });
      if (article) {
        const cached = await prisma.aiSummary.findUnique({
          where: { articleId_provider_model: { articleId: article.id, provider, model } },
        });
        if (cached) {
          return NextResponse.json({ summary: cached.content });
        }
      }
    }

    const config: AIProviderConfig = { provider, apiKey, model, baseUrl };
    const summary = await generateSummary(config, subject, theme, articleContent);

    // Cache the summary if this is an article
    if (slug && provider && model) {
      const article = await prisma.newsArticle.findUnique({ where: { slug } });
      if (article) {
        await prisma.aiSummary.upsert({
          where: { articleId_provider_model: { articleId: article.id, provider, model } },
          update: { content: summary },
          create: { articleId: article.id, provider, model, content: summary },
        });
      }
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}
