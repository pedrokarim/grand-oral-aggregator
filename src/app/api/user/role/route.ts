import { NextResponse } from "next/server";
import { resolveCurrentRole } from "@/lib/roles";

export async function GET() {
  const r = await resolveCurrentRole();
  // Never expose the raw list of super-admin Discord IDs, only the derived
  // boolean for the caller. Super-admin status is *never* writable from here.
  return NextResponse.json({
    role: r.role,
    isAdmin: r.isAdmin,
    isSuperAdmin: r.isSuperAdmin,
  });
}
