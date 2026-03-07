import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const themeId = parseInt(request.nextUrl.searchParams.get("themeId") ?? "0");
  if (!themeId) {
    return NextResponse.json({ error: "themeId requis" }, { status: 400 });
  }

  // Get users who have commented on this theme
  const comments = await prisma.comment.findMany({
    where: { themeId },
    select: { userId: true },
    distinct: ["userId"],
  });

  const userIds = comments.map((c) => c.userId);
  if (userIds.length === 0) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      commentMentionOptOut: false,
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      image: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users });
}
