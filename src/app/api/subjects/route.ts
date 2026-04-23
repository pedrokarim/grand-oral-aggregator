import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";
import { slugifySubject, type CustomSubject } from "@/lib/data";

const authorSelect = {
  id: true,
  name: true,
  displayName: true,
  image: true,
} as const;

type DbSubject = {
  id: number;
  type: string;
  domaine: string;
  sujet: string;
  isPublic: boolean;
  createdAt: Date;
  userId: string | null;
  theme: { name: string };
  user: { id: string; name: string; displayName: string | null; image: string | null } | null;
};

function serialize(s: DbSubject, currentUserId: string | null): CustomSubject {
  return {
    source: "user",
    id: s.id,
    type: s.type,
    domaine: s.domaine,
    theme: s.theme.name,
    sujet: s.sujet,
    slug: slugifySubject(s.theme.name, s.sujet),
    isPublic: s.isPublic,
    createdAt: s.createdAt.toISOString(),
    author: s.user
      ? {
          id: s.user.id,
          name: s.user.name,
          displayName: s.user.displayName,
          image: s.user.image,
        }
      : null,
    isMine: !!currentUserId && s.userId === currentUserId,
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const themeName = params.get("theme");
  const mine = params.get("mine") === "true";
  const slug = params.get("slug");

  const session = await getServerSession();
  const userId = session?.user?.id ?? null;

  if (mine) {
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const where = themeName
      ? { userId, theme: { name: themeName } }
      : { userId };
    const rows = await prisma.subject.findMany({
      where,
      include: { theme: { select: { name: true } }, user: { select: authorSelect } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ subjects: rows.map((r) => serialize(r, userId)) });
  }

  if (slug) {
    // Scan visible subjects and match by computed slug. We narrow by prefix of the
    // theme token in the slug to avoid scanning everything, but fall back to a
    // full visible scan since slugs compress both theme and sujet.
    const rows = await prisma.subject.findMany({
      where: userId
        ? { OR: [{ isPublic: true }, { userId }] }
        : { isPublic: true },
      include: { theme: { select: { name: true } }, user: { select: authorSelect } },
    });
    const match = rows.find(
      (r) => slugifySubject(r.theme.name, r.sujet) === slug,
    );
    if (!match) return NextResponse.json({ subject: null });
    return NextResponse.json({ subject: serialize(match, userId) });
  }

  if (!themeName) {
    return NextResponse.json({ error: "theme required" }, { status: 400 });
  }

  const rows = await prisma.subject.findMany({
    where: {
      theme: { name: themeName },
      ...(userId
        ? { OR: [{ isPublic: true }, { userId }] }
        : { isPublic: true }),
    },
    include: { theme: { select: { name: true } }, user: { select: authorSelect } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subjects: rows.map((r) => serialize(r, userId)) });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { theme, sujet, domaine, type, isPublic } = body as {
    theme?: string;
    sujet?: string;
    domaine?: string;
    type?: string;
    isPublic?: boolean;
  };

  if (!theme?.trim() || !sujet?.trim()) {
    return NextResponse.json(
      { error: "theme et sujet requis" },
      { status: 400 },
    );
  }

  const themeRow = await prisma.theme.findUnique({ where: { name: theme } });
  if (!themeRow) {
    return NextResponse.json({ error: "Thème inconnu" }, { status: 404 });
  }

  const created = await prisma.subject.create({
    data: {
      theme: { connect: { id: themeRow.id } },
      user: { connect: { id: userId } },
      sujet: sujet.trim().slice(0, 500),
      domaine: (domaine ?? "INFO").slice(0, 64),
      type: (type ?? "Sujet de préparation").slice(0, 64),
      isPublic: isPublic === false ? false : true,
    },
    include: { theme: { select: { name: true } }, user: { select: authorSelect } },
  });

  return NextResponse.json({ subject: serialize(created, userId) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "number") {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const target = await prisma.subject.findUnique({ where: { id: body.id } });
  if (!target) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (target.userId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const data: { isPublic?: boolean } = {};
  if (typeof body.isPublic === "boolean") data.isPublic = body.isPublic;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const updated = await prisma.subject.update({
    where: { id: body.id },
    data,
    include: { theme: { select: { name: true } }, user: { select: authorSelect } },
  });

  return NextResponse.json({ subject: serialize(updated, userId) });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "number") {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const target = await prisma.subject.findUnique({ where: { id: body.id } });
  if (!target) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (target.userId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.subject.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
