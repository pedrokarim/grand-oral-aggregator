import "server-only";
import { getServerSession } from "./auth-server";
import { resolveEffectiveRole } from "./role-policy";

export type Role = "user" | "admin" | "superadmin";

export interface ResolvedRole {
  role: Role;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userId: string | null;
  ascenciaAccountId: string | null;
}

const ANONYMOUS_ROLE: ResolvedRole = {
  role: "user",
  isAdmin: false,
  isSuperAdmin: false,
  userId: null,
  ascenciaAccountId: null,
};

/**
 * Les droits globaux viennent d'Ascencia ID. Le rôle local `admin` est gardé
 * pour ne pas retirer silencieusement une délégation déjà accordée dans Grand
 * Oral ; les nouveaux rôles d'application peuvent être gérés dans Ascencia.
 */
export async function resolveCurrentRole(): Promise<ResolvedRole> {
  const session = await getServerSession();
  if (!session) return ANONYMOUS_ROLE;

  const effective = resolveEffectiveRole({
    localRole: session.user.role,
    applicationRoles: session.ascencia.roles,
    platformRoles: session.ascencia.platformRoles,
  });

  return {
    ...effective,
    userId: session.user.id,
    ascenciaAccountId: session.ascencia.accountId,
  };
}

export async function requireAdmin(): Promise<ResolvedRole> {
  const role = await resolveCurrentRole();
  if (!role.isAdmin) throw new Response("Forbidden", { status: 403 });
  return role;
}

export async function requireSuperAdmin(): Promise<ResolvedRole> {
  const role = await resolveCurrentRole();
  if (!role.isSuperAdmin) throw new Response("Forbidden", { status: 403 });
  return role;
}
