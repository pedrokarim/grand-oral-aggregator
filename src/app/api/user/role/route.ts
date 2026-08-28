import { NextResponse } from "next/server";
import { resolveCurrentRole } from "@/lib/roles";

export async function GET() {
  const role = await resolveCurrentRole();
  return NextResponse.json({
    role: role.role,
    isAdmin: role.isAdmin,
    isSuperAdmin: role.isSuperAdmin,
  });
}
