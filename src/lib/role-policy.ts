export type EffectiveRole = "user" | "admin" | "superadmin";

export interface EffectiveRoleInput {
  localRole: string;
  applicationRoles: string[];
  platformRoles: string[];
}

export interface EffectiveRoleResult {
  role: EffectiveRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/** Combine les délégations locales et les rôles portés par Ascencia ID. */
export function resolveEffectiveRole(
  input: EffectiveRoleInput,
): EffectiveRoleResult {
  const isSuperAdmin = input.platformRoles.includes("superadmin");
  const isApplicationAdmin = input.applicationRoles.some((role) =>
    ["owner", "admin"].includes(role),
  );
  const isAdmin =
    isSuperAdmin || isApplicationAdmin || input.localRole === "admin";

  return {
    role: isSuperAdmin ? "superadmin" : isAdmin ? "admin" : "user",
    isAdmin,
    isSuperAdmin,
  };
}
