import { NextRequest, NextResponse } from "next/server";
import {
  buildSummaryPrompts,
  buildThemeFicheUserPrompt,
  resolveOllamaBaseUrl,
  THEME_FICHE_PROMPT,
} from "@/lib/ai-providers";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import type { SummaryLength } from "@/lib/settings";

const VALID_LENGTHS: SummaryLength[] = ["short", "medium", "long"];
const PROMPT_VERSION = "v2-problematique";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type CacheTarget =
  | {
      kind: "article";
      articleId: number;
      provider: string;
      model: string;
      content?: string;
    }
  | {
      kind: "subject";
      subjectKey: string;
      provider: string;
      model: string;
      content?: string;
    };

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

function encodeJsonLine(payload: unknown) {
  return encoder.encode(`${JSON.stringify(payload)}\n`);
}

function streamCachedText(text: string) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encodeJsonLine({ type: "chunk", content: text }));
      controller.enqueue(encodeJsonLine({ type: "done" }));
      controller.close();
    },
  });
}

function streamHeaders() {
  return {
    "Cache-Control": "no-cache, no-transform",
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "X-Accel-Buffering": "no",
  };
}

function parseOllamaLine(line: string) {
  try {
    return JSON.parse(line) as {
      error?: string;
      done?: boolean;
      message?: { content?: string };
    };
  } catch {
    return null;
  }
}

async function getCachedContent(target: CacheTarget) {
  if (target.kind === "article") {
    const cached = await prisma.aiSummary.findUnique({
      where: {
        articleId_provider_model: {
          articleId: target.articleId,
          provider: target.provider,
          model: target.model,
        },
      },
    });
    return cached?.content ?? null;
  }

  const cached = await prisma.aiSummary.findUnique({
    where: {
      subjectKey_provider_model: {
        subjectKey: target.subjectKey,
        provider: target.provider,
        model: target.model,
      },
    },
  });
  return cached?.content ?? null;
}

async function saveCachedContent(target: CacheTarget, content: string) {
  if (target.kind === "article") {
    await prisma.aiSummary.upsert({
      where: {
        articleId_provider_model: {
          articleId: target.articleId,
          provider: target.provider,
          model: target.model,
        },
      },
      update: { content },
      create: {
        articleId: target.articleId,
        provider: target.provider,
        model: target.model,
        content,
      },
    });
    return;
  }

  await prisma.aiSummary.upsert({
    where: {
      subjectKey_provider_model: {
        subjectKey: target.subjectKey,
        provider: target.provider,
        model: target.model,
      },
    },
    update: { content },
    create: {
      subjectKey: target.subjectKey,
      provider: target.provider,
      model: target.model,
      content,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const {
    slug,
    subject,
    theme,
    provider,
    model,
    baseUrl,
    articleContent,
    kind,
    subjects,
    force,
  } = body;

  if (provider !== "ollama") {
    return NextResponse.json({ error: "Le streaming est disponible avec Ollama uniquement" }, { status: 400 });
  }
  if (!model) {
    return NextResponse.json({ error: "Paramètre manquant (model)" }, { status: 400 });
  }

  let systemPrompt: string;
  let userPrompt: string;
  let cacheTarget: CacheTarget | null = null;

  if (kind === "theme") {
    if (!theme || !Array.isArray(subjects)) {
      return NextResponse.json(
        { error: "Paramètres manquants pour une fiche de thème (theme, subjects[])" },
        { status: 400 }
      );
    }

    systemPrompt = THEME_FICHE_PROMPT;
    userPrompt = buildThemeFicheUserPrompt(theme, subjects as string[]);
    cacheTarget = {
      kind: "subject",
      subjectKey: themeFicheKeyFor(theme),
      provider,
      model: buildThemeCacheModel(model),
    };
  } else {
    if (!subject || !theme) {
      return NextResponse.json(
        { error: "Paramètres manquants (subject, theme)" },
        { status: 400 }
      );
    }

    const lengthRaw = body.length as SummaryLength;
    const length = VALID_LENGTHS.includes(lengthRaw) ? lengthRaw : "medium";
    const prompts = buildSummaryPrompts(subject, theme, articleContent, length);
    systemPrompt = prompts.sysPrompt;
    userPrompt = prompts.userPrompt;

    const cacheModel = buildCacheModel(model, length);
    if (slug) {
      const article = await prisma.newsArticle.findUnique({ where: { slug } });
      if (article) {
        cacheTarget = {
          kind: "article",
          articleId: article.id,
          provider,
          model: cacheModel,
        };
      }
    } else {
      cacheTarget = {
        kind: "subject",
        subjectKey: subjectKeyFor(theme, subject),
        provider,
        model: cacheModel,
      };
    }
  }

  if (cacheTarget && !force) {
    const cached = await getCachedContent(cacheTarget);
    if (cached) {
      return new Response(streamCachedText(cached), { headers: streamHeaders() });
    }
  }

  const ollamaBaseUrl = resolveOllamaBaseUrl(baseUrl);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
      let buffer = "";
      let fullText = "";

      function enqueue(payload: unknown) {
        if (closed) return;
        try {
          controller.enqueue(encodeJsonLine(payload));
        } catch {
          closed = true;
        }
      }

      function close() {
        if (!closed) {
          closed = true;
          controller.close();
        }
      }

      enqueue({ type: "start" });

      const ping = setInterval(() => {
        enqueue({ type: "ping" });
      }, 15000);

      try {
        const ollamaRes = await fetch(`${ollamaBaseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            stream: true,
          }),
        });

        if (!ollamaRes.ok || !ollamaRes.body) {
          const text = await ollamaRes.text();
          throw new Error(text || `Ollama a répondu ${ollamaRes.status}`);
        }

        reader = ollamaRes.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const data = parseOllamaLine(trimmed);
            if (!data) continue;
            if (data.error) throw new Error(data.error);

            const chunk = data.message?.content ?? "";
            if (chunk) {
              fullText += chunk;
              enqueue({ type: "chunk", content: chunk });
            }
          }
        }

        const remaining = buffer.trim();
        if (remaining) {
          const data = parseOllamaLine(remaining);
          const chunk = data?.message?.content ?? "";
          if (data?.error) throw new Error(data.error);
          if (chunk) {
            fullText += chunk;
            enqueue({ type: "chunk", content: chunk });
          }
        }

        if (cacheTarget && fullText.trim()) {
          await saveCachedContent(cacheTarget, fullText);
        }

        enqueue({ type: "done" });
        close();
      } catch (error) {
        enqueue({
          type: "error",
          error: error instanceof Error ? error.message : "Erreur lors de la génération",
        });
        close();
      } finally {
        clearInterval(ping);
        reader?.releaseLock();
      }
    },
  });

  return new Response(stream, { headers: streamHeaders() });
}
