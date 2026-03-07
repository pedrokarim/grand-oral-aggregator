import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "name requis" }, { status: 400 });
  }

  const theme = await prisma.theme.findUnique({
    where: { name },
    select: { id: true },
  });

  if (!theme) {
    return NextResponse.json({ error: "Thème introuvable" }, { status: 404 });
  }

  return NextResponse.json({ themeId: theme.id });
}
