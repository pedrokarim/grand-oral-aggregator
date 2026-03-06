import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai-providers";
import type { AIProviderConfig } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, theme, provider, apiKey, model, baseUrl } = body;

    if (!subject || !theme || !provider || (!apiKey && provider !== "ollama")) {
      return NextResponse.json(
        { error: "Paramètres manquants (subject, theme, provider, apiKey)" },
        { status: 400 }
      );
    }

    const config: AIProviderConfig = { provider, apiKey, model, baseUrl };
    const summary = await generateSummary(config, subject, theme);

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}
