import { NextRequest, NextResponse } from "next/server";
import { resolveOllamaBaseUrl } from "@/lib/ai-providers";

export async function GET(request: NextRequest) {
  const baseUrl = resolveOllamaBaseUrl(request.nextUrl.searchParams.get("baseUrl") ?? undefined);

  try {
    const res = await fetch(`${baseUrl}/api/tags`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Ollama a répondu ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: `Impossible de joindre Ollama sur ${baseUrl}` },
      { status: 502 }
    );
  }
}
