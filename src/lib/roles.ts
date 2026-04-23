import "server-only";
import { prisma } from "./prisma";
import { getServerSession } from "./auth-server";

/**
 * Role system
 * -----------
 * - "user"        : default
 * - "admin"       : granted in DB (User.role = "admin"), visible to the app
 * - "superadmin"  : NEVER stored in DB. Derived exclusively from the env var
 *                   SUPER_ADMIN_DISCORD_IDS (comma/space-separated Discord IDs).
 *                   Super admins implicitly also have admin privileges.
 *
 * Hard rule: it is impossible to become super admin through any DB state or
 * API call — only ops with access to the deployment env can grant it.
 */

export type Role = "user" | "admin" | "superadmin";

const DISCORD_PROVIDER_ID = "discord";

let cachedIds: Set<string> | null = null;

function superAdminIds(): Set<string> {
  if (cachedIds) return cachedIds;
  const raw = process.env.SUPER_ADMIN_DISCORD_IDS ?? "";
  cachedIds = new Set(
    raw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );
  return cachedIds;
}

export function isSuperAdminDiscordId(discordId: string | null | undefined): boolean {
  if (!discordId) return false;
  return superAdminIds().has(discordId);
}

export interface ResolvedRole {
  role: Role;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userId: string | null;
  discordId: string | null;
}

const ANON: ResolvedRole = {
  role: "user",
  isAdmin: false,
  isSuperAdmin: false,
  userId: null,
  discordId: null,
};

/**
 * Resolve the effective role for a user id.
 * Looks up the Discord account id linked to the user, then compares it with
 * the env var. Falls back to the DB role field for admin/user.
 */
export async function resolveRoleForUserId(userId: string): Promise<ResolvedRole> {
  const [user, discordAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    }),
    prisma.account.findFirst({
      where: { userId, providerId: DISCORD_PROVIDER_ID },
      select: { accountId: true },
    }),
  ]);
  if (!user) return ANON;

  const discordId = discordAccount?.accountId ?? null;
  const isSuperAdmin = isSuperAdminDiscordId(discordId);
  const dbRole: Role = user.role === "admin" ? "admin" : "user";
  const role: Role = isSuperAdmin ? "superadmin" : dbRole;

  return {
    role,
    isAdmin: role === "admin" || role === "superadmin",
    isSuperAdmin,
    userId: user.id,
    discordId,
  };
}

export async function resolveCurrentRole(): Promise<ResolvedRole> {
  const session = await getServerSession();
  const userId = session?.user?.id;
  if (!userId) return ANON;
  return resolveRoleForUserId(userId);
}

export async function requireAdmin(): Promise<ResolvedRole> {
  const r = await resolveCurrentRole();
  if (!r.isAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }
  return r;
}

export async function requireSuperAdmin(): Promise<ResolvedRole> {
  const r = await resolveCurrentRole();
  if (!r.isSuperAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }
  return r;
}
