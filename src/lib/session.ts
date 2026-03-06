import { cookies } from "next/headers";

const SESSION_COOKIE = "grand-oral-session";

export async function getSessionId(): Promise<string> {
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
