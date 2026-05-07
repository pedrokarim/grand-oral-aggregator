"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { AuthButton } from "./auth-button";
import { MobileDock } from "./mobile-dock";
import { ThemeToggle } from "./theme-toggle";
import { themeStats } from "@/lib/data";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/actualites": "Actualités",
  "/settings": "Paramètres",
  "/profile": "Profil",
  "/demo": "Démo",
  "/recherche": "Recherche",
  "/docs": "Docs",
};

function getMobileTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/themes/")) {
    const slug = pathname.split("/")[2];
    return themeStats.find((t) => t.slug === slug)?.theme ?? "Thème";
  }
  if (pathname.startsWith("/actualites/")) return "Article";
  if (pathname.startsWith("/sujets/")) return "Sujet";
  return "Grand Oral";
}

export function MobileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#FDFDF8] text-[#23251D] dark:bg-[#1E1F23] dark:text-[#EAECF6] md:hidden">
      <header className="sticky top-0 z-40 border-b border-[#D2D3CC] bg-[#FDFDF8]/95 px-3 py-2 backdrop-blur dark:border-[#3a3b3f] dark:bg-[#1E1F23]/95">
        <div className="flex min-h-11 items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EB9D2A] text-[#FDFDF8]"
            aria-label="Accueil"
          >
            <GraduationCap className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-[#9EA096]">
              Grand Oral
            </p>
            <h1 className="truncate text-base font-semibold leading-tight">
              {getMobileTitle(pathname)}
            </h1>
          </div>
          <ThemeToggle />
          <AuthButton />
        </div>
      </header>

      <main className="min-h-[calc(100dvh-4rem)] overflow-x-hidden pb-[calc(5.75rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <MobileDock />
    </div>
  );
}
