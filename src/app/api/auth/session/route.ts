import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession();
  return NextResponse.json(
    session ? { authenticated: true, session } : { authenticated: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
