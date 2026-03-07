import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      status: true,
      globalMentionOptOut: true,
      chatMentionOptOut: true,
      commentMentionOptOut: true,
    },
  });

  return NextResponse.json({ preferences: user });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const allowed = ["displayName", "status", "globalMentionOptOut", "chatMentionOptOut", "commentMentionOptOut"];
  const data: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  // Validate status
  if (data.status && !["online", "idle", "dnd", "invisible"].includes(data.status as string)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      displayName: true,
      status: true,
      globalMentionOptOut: true,
      chatMentionOptOut: true,
      commentMentionOptOut: true,
    },
  });

  return NextResponse.json({ preferences: user });
}
