import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const commentId = parseInt(request.nextUrl.searchParams.get("commentId") ?? "0");
  if (!commentId) {
    return NextResponse.json({ error: "commentId requis" }, { status: 400 });
  }

  const history = await prisma.editHistory.findMany({
    where: { entityType: "comment", entityId: commentId },
    orderBy: { editedAt: "desc" },
  });

  return NextResponse.json({ history });
}
