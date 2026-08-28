import { describe, expect, test } from "bun:test";
import { resolveEffectiveRole } from "./role-policy";

describe("resolveEffectiveRole", () => {
  test("conserve un membre ordinaire", () => {
    expect(
      resolveEffectiveRole({
        localRole: "user",
        applicationRoles: ["user"],
        platformRoles: [],
      }),
    ).toEqual({ role: "user", isAdmin: false, isSuperAdmin: false });
  });

  test("reconnaît les administrateurs et propriétaires d'application", () => {
    for (const role of ["admin", "owner"]) {
      expect(
        resolveEffectiveRole({
          localRole: "user",
          applicationRoles: [role],
          platformRoles: [],
        }),
      ).toEqual({ role: "admin", isAdmin: true, isSuperAdmin: false });
    }
  });

  test("conserve une délégation locale existante", () => {
    expect(
      resolveEffectiveRole({
        localRole: "admin",
        applicationRoles: [],
        platformRoles: [],
      }),
    ).toEqual({ role: "admin", isAdmin: true, isSuperAdmin: false });
  });

  test("donne la priorité au superadmin plateforme", () => {
    expect(
      resolveEffectiveRole({
        localRole: "user",
        applicationRoles: ["user"],
        platformRoles: ["superadmin"],
      }),
    ).toEqual({ role: "superadmin", isAdmin: true, isSuperAdmin: true });
  });
});
