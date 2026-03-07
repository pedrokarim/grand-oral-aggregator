import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const messageId = parseInt(request.nextUrl.searchParams.get("messageId") ?? "0");
  if (!messageId) {
    return NextResponse.json({ error: "messageId requis" }, { status: 400 });
  }

  const history = await prisma.editHistory.findMany({
    where: { entityType: "chat", entityId: messageId },
    orderBy: { editedAt: "desc" },
  });

  return NextResponse.json({ history });
}
