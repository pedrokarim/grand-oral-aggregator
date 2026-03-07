import { NextRequest } from "next/server";
import { getCommentChannel, createSSEResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const themeId = parseInt(request.nextUrl.searchParams.get("themeId") ?? "0");
  if (!themeId) {
    return new Response("themeId requis", { status: 400 });
  }
  return createSSEResponse(getCommentChannel(themeId));
}
