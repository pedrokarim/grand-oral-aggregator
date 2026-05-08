import { NextRequest, NextResponse } from "next/server";
import { generateSummary, generateThemeFiche } from "@/lib/ai-providers";
import { prisma } from "@/lib/prisma";
import { resolveCurrentRole } from "@/lib/roles";
import type { AIProviderConfig, SummaryLength } from "@/lib/settings";

const VALID_LENGTHS: SummaryLength[] = ["short", "medium", "long"];

// Bump PROMPT_VERSION whenever the prompts in lib/ai-providers change so that
// previously cached summaries (produced with older prompt wording) are not
// served stale — they'll be regenerated on next request.
const PROMPT_VERSION = "v2-problematique";

function buildCacheModel(model: string, length: SummaryLength) {
  return `${model}::${length}::${PROMPT_VERSION}`;
}

function buildThemeCacheModel(model: string) {
  return `${model}::theme-fiche::${PROMPT_VERSION}`;
}

function subjectKeyFor(theme: string, subject: string) {
  return `${theme}::${subject}`;
}

function themeFicheKeyFor(theme: string) {
  return `theme::${theme}`;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const slug = params.get("slug");
  const subject = params.get("subject");
  const theme = params.get("theme");
  const kind = params.get("kind");
  const provider = params.get("provider");
  const model = params.get("model");
  const lengthRaw = (params.get("length") ?? "medium") as SummaryLength;
  const length: SummaryLength = VALID_LENGTHS.includes(lengthRaw) ? lengthRaw : "medium";

  if (!provider || !model) {
    return NextResponse.json({ error: "provider and model required" }, { status: 400 });
  }

  if (kind === "theme" && theme) {
    const cacheModel = buildThemeCacheModel(model);
    const key = themeFicheKeyFor(theme);
    const cached = await prisma.aiSummary.findUnique({
      where: { subjectKey_provider_model: { subjectKey: key, provider, model: cacheModel } },
    });
    return NextResponse.json({ summary: cached?.content ?? null });
  }

  const cacheModel = buildCacheModel(model, length);

  if (slug) {
    const article = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!article) return NextResponse.json({ summary: null });
    const cached = await prisma.aiSummary.findUnique({
      where: { articleId_provider_model: { articleId: article.id, provider, model: cacheModel } },
    });
    return NextResponse.json({ summary: cached?.content ?? null });
  }

  if (subject && theme) {
    const key = subjectKeyFor(theme, subject);
    const cached = await prisma.aiSummary.findUnique({
      where: { subjectKey_provider_model: { subjectKey: key, provider, model: cacheModel } },
    });
    return NextResponse.json({ summary: cached?.content ?? null });
  }

  return NextResponse.json({ error: "slug, (subject+theme), or (kind=theme+theme) required" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const role = await resolveCurrentRole();
  if (!role.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      slug,
      subject,
      theme,
      provider,
      apiKey,
      model,
      baseUrl,
      articleContent,
      kind,
      subjects,
    } = body;

    if (!provider || (!apiKey && provider !== "ollama") || !model) {
      return NextResponse.json(
        { error: "Paramètres manquants (provider, apiKey, model)" },
        { status: 400 }
      );
    }

    const config: AIProviderConfig = { provider, apiKey, model, baseUrl };

    // ---- Theme fiche branch --------------------------------------------------
    if (kind === "theme") {
      if (!theme || !Array.isArray(subjects)) {
        return NextResponse.json(
          { error: "Paramètres manquants pour une fiche de thème (theme, subjects[])" },
          { status: 400 }
        );
      }
      const cacheModel = buildThemeCacheModel(model);
      const key = themeFicheKeyFor(theme);

      const cached = await prisma.aiSummary.findUnique({
        where: { subjectKey_provider_model: { subjectKey: key, provider, model: cacheModel } },
      });
      if (cached && !body.force) {
        return NextResponse.json({ summary: cached.content, cached: true });
      }

      const summary = await generateThemeFiche(config, theme, subjects as string[]);

      await prisma.aiSummary.upsert({
        where: { subjectKey_provider_model: { subjectKey: key, provider, model: cacheModel } },
        update: { content: summary },
        create: { subjectKey: key, provider, model: cacheModel, content: summary },
      });

      return NextResponse.json({ summary });
    }

    // ---- Subject / article branch -------------------------------------------
    if (!subject || !theme) {
      return NextResponse.json(
        { error: "Paramètres manquants (subject, theme)" },
        { status: 400 }
      );
    }

    const length: SummaryLength = VALID_LENGTHS.includes(body.length) ? body.length : "medium";
    const cacheModel = buildCacheModel(model, length);

    if (slug) {
      const article = await prisma.newsArticle.findUnique({ where: { slug } });
      if (article) {
        const cached = await prisma.aiSummary.findUnique({
          where: { articleId_provider_model: { articleId: article.id, provider, model: cacheModel } },
        });
        if (cached) {
          return NextResponse.json({ summary: cached.content, cached: true });
        }
      }
    } else {
      const key = subjectKeyFor(theme, subject);
      const cached = await prisma.aiSummary.findUnique({
        where: { subjectKey_provider_model: { subjectKey: key, provider, model: cacheModel } },
      });
      if (cached) {
        return NextResponse.json({ summary: cached.content, cached: true });
      }
    }

    const summary = await generateSummary(config, subject, theme, articleContent, length);

    if (slug) {
      const article = await prisma.newsArticle.findUnique({ where: { slug } });
      if (article) {
        await prisma.aiSummary.upsert({
          where: { articleId_provider_model: { articleId: article.id, provider, model: cacheModel } },
          update: { content: summary },
          create: { articleId: article.id, provider, model: cacheModel, content: summary },
        });
      }
    } else {
      const key = subjectKeyFor(theme, subject);
      await prisma.aiSummary.upsert({
        where: { subjectKey_provider_model: { subjectKey: key, provider, model: cacheModel } },
        update: { content: summary },
        create: { subjectKey: key, provider, model: cacheModel, content: summary },
      });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}
