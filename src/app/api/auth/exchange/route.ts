import { type NextRequest, NextResponse } from "next/server";
import {
  ASCENCIA_SESSION_COOKIE,
  createAscenciaSession,
} from "@/lib/ascencia/session";

function applicationOrigin(request: NextRequest): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.ASCENCIA_REDIRECT_URI;
  return configured ? new URL(configured).origin : request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== applicationOrigin(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
    code_verifier?: unknown;
    redirect_uri?: unknown;
  } | null;
  if (
    typeof body?.code !== "string" ||
    typeof body.code_verifier !== "string" ||
    typeof body.redirect_uri !== "string"
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 422 });
  }

  const issuer = process.env.ASCENCIA_ISSUER?.replace(/\/$/, "");
  const allowedRedirects = new Set([
    process.env.ASCENCIA_REDIRECT_URI,
    issuer ? `${issuer}/embed/callback` : undefined,
  ]);
  if (!allowedRedirects.has(body.redirect_uri)) {
    return NextResponse.json(
      { error: "invalid_redirect_uri" },
      { status: 422 },
    );
  }

  try {
    const sessionId = await createAscenciaSession({
      code: body.code,
      codeVerifier: body.code_verifier,
      redirectUri: body.redirect_uri,
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ASCENCIA_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "exchange_failed" }, { status: 401 });
  }
}
