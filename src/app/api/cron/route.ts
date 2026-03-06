import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

/**
 * API route to trigger news fetching.
 * Can be called by an external cron service (e.g., Vercel Cron, cron-job.org).
 *
 * GET /api/cron?secret=YOUR_CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    execSync("bun run scripts/fetch-news.ts", {
      cwd: process.cwd(),
      timeout: 120_000,
    });

    return NextResponse.json({ success: true, message: "News fetched successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch news", details: String(error) },
      { status: 500 }
    );
  }
}
