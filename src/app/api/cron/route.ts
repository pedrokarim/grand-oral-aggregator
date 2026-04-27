import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { timingSafeEqual } from "crypto";

/**
 * Trigger news fetching.
 * Requires CRON_SECRET env var. The route refuses requests when the secret
 * is not configured — never leave it unset in production.
 *
 * GET /api/cron?secret=$CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "Cron disabled" }, { status: 503 });
  }

  const provided = request.nextUrl.searchParams.get("secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expectedSecret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Detached fire-and-forget so the HTTP request doesn't tie up a worker
  // for the full duration of the scrape.
  const child = spawn("bun", ["run", "scripts/fetch-news.ts"], {
    cwd: process.cwd(),
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  return NextResponse.json({ success: true, message: "News fetch scheduled" });
}
