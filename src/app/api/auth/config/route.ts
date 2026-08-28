import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ASCENCIA_CLIENT_ID;
  const issuer = process.env.ASCENCIA_ISSUER?.replace(/\/$/, "");
  const redirectUri = process.env.ASCENCIA_REDIRECT_URI;
  if (!clientId || !issuer || !redirectUri) {
    return NextResponse.json(
      { error: "auth_not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      clientId,
      issuer,
      redirectUri,
      siteName: "Grand Oral Aggregator",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
