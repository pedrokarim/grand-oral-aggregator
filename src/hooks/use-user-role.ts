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

export function useUserRole(): RoleInfo {
  const { data: session, isPending } = useSession();
  const [info, setInfo] = useState<RoleInfo>({ ...ANON, loading: true });

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      setInfo(ANON);
      return;
    }
    let cancelled = false;
    setInfo((prev) => ({ ...prev, loading: true }));
    fetch("/api/user/role", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setInfo(ANON);
          return;
        }
        setInfo({
          role: data.role,
          isAdmin: !!data.isAdmin,
          isSuperAdmin: !!data.isSuperAdmin,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) setInfo(ANON);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, isPending]);

  return info;
}
