import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";
import { SEARCH_LAYOUT_IDS } from "@/lib/settings";

const USER_PREF_SELECT = {
  displayName: true,
  status: true,
  globalMentionOptOut: true,
  chatMentionOptOut: true,
  commentMentionOptOut: true,
  searchLayout: true,
} as const;

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: USER_PREF_SELECT,
  });

  return NextResponse.json({ preferences: user });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const allowed = [
    "displayName",
    "status",
    "globalMentionOptOut",
    "chatMentionOptOut",
    "commentMentionOptOut",
    "searchLayout",
  ];
  const data: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (typeof data.displayName === "string") {
    const dn = data.displayName.trim().slice(0, 64);
    if (!dn) {
      return NextResponse.json({ error: "displayName invalide" }, { status: 400 });
    }
    data.displayName = dn;
  } else if ("displayName" in data && data.displayName !== null) {
    return NextResponse.json({ error: "displayName invalide" }, { status: 400 });
  }

  if (data.status && !["online", "idle", "dnd", "invisible"].includes(data.status as string)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  if (
    typeof data.searchLayout === "string" &&
    !SEARCH_LAYOUT_IDS.includes(data.searchLayout as (typeof SEARCH_LAYOUT_IDS)[number])
  ) {
    return NextResponse.json({ error: "Layout invalide" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: USER_PREF_SELECT,
  });

  return NextResponse.json({ preferences: user });
}
