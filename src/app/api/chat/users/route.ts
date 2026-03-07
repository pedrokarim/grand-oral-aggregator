import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { status: { not: "invisible" } },
    select: {
      id: true,
      name: true,
      displayName: true,
      image: true,
      status: true,
      chatMentionOptOut: true,
    },
    orderBy: { name: "asc" },
  });

  // Filter out users who opted out of chat mentions
  const mentionable = users.filter((u) => !u.chatMentionOptOut);

  return NextResponse.json({ users: mentionable });
}
