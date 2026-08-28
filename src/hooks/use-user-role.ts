"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

export type Role = "user" | "admin" | "superadmin";

export interface RoleInfo {
  role: Role;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}

const ANON: RoleInfo = {
  role: "user",
  isAdmin: false,
  isSuperAdmin: false,
  loading: false,
};

const LOADING: RoleInfo = { ...ANON, loading: true };

interface RoleResponse {
  role: Role;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useUserRole(): RoleInfo {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const [result, setResult] = useState<{
    userId: string;
    info: RoleInfo;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/user/role", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: RoleResponse | null) => {
        if (cancelled) return;
        if (!data) {
          setResult({ userId, info: ANON });
          return;
        }
        setResult({
          userId,
          info: {
            role: data.role,
            isAdmin: data.isAdmin,
            isSuperAdmin: data.isSuperAdmin,
            loading: false,
          },
        });
      })
      .catch(() => {
        if (!cancelled) setResult({ userId, info: ANON });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isPending) return LOADING;
  if (!userId) return ANON;
  return result?.userId === userId ? result.info : LOADING;
}
