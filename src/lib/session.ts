import { cookies } from "next/headers";
import { getServerSession } from "./auth-server";

const SESSION_COOKIE = "grand-oral-session";

export async function getSessionId(): Promise<string> {
  // Try authenticated session first
  try {
    const session = await getServerSession();
    if (session?.user?.id) return `user:${session.user.id}`;
  } catch {
    // Fall through to anonymous session
  }

  // Fall back to anonymous cookie
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 365 * 86400,
    path: "/",
  });
  return id;
}
