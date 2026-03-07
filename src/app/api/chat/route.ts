import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";
import { getChatChannel } from "@/lib/sse";

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor");
  const limit = 50;

  const messages = await prisma.chatMessage.findMany({
    where: cursor ? { id: { lt: parseInt(cursor) } } : undefined,
    orderBy: { id: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true, displayName: true, image: true, status: true },
      },
    },
  });

  return NextResponse.json({
    messages: messages.reverse(),
    nextCursor: messages.length === limit ? messages[0]?.id : null,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { content, mentions } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      userId: session.user.id,
      content: content.trim(),
      mentions: mentions ?? [],
    },
    include: {
      user: {
        select: { id: true, name: true, displayName: true, image: true, status: true },
      },
    },
  });

  getChatChannel().broadcast("message", message);

  return NextResponse.json({ message });
}

const userSelect = { id: true, name: true, displayName: true, image: true, status: true };

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { messageId, content } = await request.json();
  if (!messageId || !content?.trim()) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const existing = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  if (existing.deleted) {
    return NextResponse.json({ error: "Message supprimé" }, { status: 400 });
  }

  const [, updated] = await prisma.$transaction([
    prisma.editHistory.create({
      data: { entityType: "chat", entityId: messageId, oldContent: existing.content },
    }),
    prisma.chatMessage.update({
      where: { id: messageId },
      data: { content: content.trim(), editedAt: new Date() },
      include: { user: { select: userSelect } },
    }),
  ]);

  getChatChannel().broadcast("edit", updated);
  return NextResponse.json({ message: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { messageId } = await request.json();
  if (!messageId) {
    return NextResponse.json({ error: "messageId requis" }, { status: 400 });
  }

  const existing = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { deleted: true, content: "", mentions: [] },
  });

  getChatChannel().broadcast("delete", { id: messageId });
  return NextResponse.json({ success: true });
}
