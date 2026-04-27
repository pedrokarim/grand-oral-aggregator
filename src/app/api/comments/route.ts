import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";
import { getCommentChannel } from "@/lib/sse";

// Build nested reply includes up to given depth
function buildReplyInclude(depth: number): Record<string, unknown> {
  if (depth >= 3) return {};
  return {
    replies: {
      include: {
        user: { select: { id: true, name: true, displayName: true, image: true } },
        ...buildReplyInclude(depth + 1),
      },
      orderBy: { createdAt: "asc" as const },
    },
  };
}

export async function GET(request: NextRequest) {
  const themeId = parseInt(request.nextUrl.searchParams.get("themeId") ?? "0");
  const cursor = request.nextUrl.searchParams.get("cursor");
  const limit = 20;

  if (!themeId) {
    return NextResponse.json({ error: "themeId requis" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      themeId,
      parentId: null,
      ...(cursor ? { id: { lt: parseInt(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, displayName: true, image: true } },
      ...buildReplyInclude(0),
    },
  });

  const total = await prisma.comment.count({ where: { themeId } });

  return NextResponse.json({
    comments: comments.reverse(),
    total,
    nextCursor: comments.length === limit ? comments[0]?.id : null,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { themeId, parentId, content, mentions } = await request.json();
  const trimmed = typeof content === "string" ? content.trim() : "";

  if (!themeId || !trimmed) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }
  if (trimmed.length > 4000) {
    return NextResponse.json({ error: "Commentaire trop long" }, { status: 413 });
  }
  const cleanMentions = Array.isArray(mentions)
    ? mentions.filter((m): m is string => typeof m === "string").slice(0, 32)
    : [];

  // Calculate depth from parent
  let depth = 0;
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { depth: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "Commentaire parent introuvable" }, { status: 404 });
    }
    depth = parent.depth + 1;
    if (depth >= 10) {
      return NextResponse.json({ error: "Profondeur maximale atteinte" }, { status: 400 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      themeId,
      parentId: parentId ?? null,
      content: trimmed,
      mentions: cleanMentions,
      depth,
    },
    include: {
      user: { select: { id: true, name: true, displayName: true, image: true } },
    },
  });

  getCommentChannel(themeId).broadcast("comment", comment);

  return NextResponse.json({ comment });
}

const commentUserSelect = { id: true, name: true, displayName: true, image: true };

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { commentId, content } = await request.json();
  const trimmed = typeof content === "string" ? content.trim() : "";
  if (!commentId || !trimmed) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }
  if (trimmed.length > 4000) {
    return NextResponse.json({ error: "Commentaire trop long" }, { status: 413 });
  }

  const existing = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  if (existing.deleted) {
    return NextResponse.json({ error: "Commentaire supprimé" }, { status: 400 });
  }

  const [, updated] = await prisma.$transaction([
    prisma.editHistory.create({
      data: { entityType: "comment", entityId: commentId, oldContent: existing.content },
    }),
    prisma.comment.update({
      where: { id: commentId },
      data: { content: trimmed, editedAt: new Date() },
      include: { user: { select: commentUserSelect } },
    }),
  ]);

  getCommentChannel(existing.themeId).broadcast("edit", updated);
  return NextResponse.json({ comment: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { commentId } = await request.json();
  if (!commentId) {
    return NextResponse.json({ error: "commentId requis" }, { status: 400 });
  }

  const existing = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deleted: true, content: "", mentions: [] },
  });

  getCommentChannel(existing.themeId).broadcast("delete", { id: commentId, themeId: existing.themeId });
  return NextResponse.json({ success: true });
}
