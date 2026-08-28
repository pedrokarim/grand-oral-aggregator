import { type NextRequest, NextResponse } from "next/server";
import {
  ASCENCIA_SESSION_COOKIE,
  deleteAscenciaSession,
} from "@/lib/ascencia/session";

export async function POST(request: NextRequest) {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.ASCENCIA_REDIRECT_URI;
  const allowedOrigin = configured
    ? new URL(configured).origin
    : request.nextUrl.origin;
  const origin = request.headers.get("origin");
  if (origin && origin !== allowedOrigin) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  await deleteAscenciaSession(
    request.cookies.get(ASCENCIA_SESSION_COOKIE)?.value,
  );
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ASCENCIA_SESSION_COOKIE);
  return response;
}
