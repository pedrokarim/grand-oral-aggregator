import "server-only";

import { cookies } from "next/headers";
import {
  ASCENCIA_SESSION_COOKIE,
  readAscenciaSession,
} from "@/lib/ascencia/session";

/** Lit la session opaque de Grand Oral et rafraîchit son jeton si nécessaire. */
export async function getServerSession() {
  const cookieStore = await cookies();
  return readAscenciaSession(
    cookieStore.get(ASCENCIA_SESSION_COOKIE)?.value,
  );
}
