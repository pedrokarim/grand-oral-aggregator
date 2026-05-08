"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Newspaper, Search, Settings,
} from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

const baseDockItems = [
  { icon: Home, label: "Accueil", href: "/" },
  { icon: Search, label: "Recherche", href: "/recherche" },
  { icon: Newspaper, label: "Actus", href: "/actualites" },
];

const settingsItem = { icon: Settings, label: "Config", href: "/settings" };

export function MobileDock() {
  const pathname = usePathname();
  const { isSuperAdmin } = useUserRole();
  const dockItems = isSuperAdmin ? [...baseDockItems, settingsItem] : baseDockItems;
  const colsClass = dockItems.length === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className={`grid ${colsClass} gap-1 border-t border-[#BFC1B7] bg-[#EEEFE9]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur dark:border-[#3a3b3f] dark:bg-[#25262B]/95`}>
        {dockItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-md py-1.5 transition-colors
                ${isActive ? "bg-[#E5E7E0] dark:bg-[#2D2E37]" : "hover:bg-[#E5E7E0] dark:hover:bg-[#2D2E37]"}
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-[#EB9D2A]" : "text-[#4D4F46] dark:text-[#9EA096]"}`} />
              <span className={`max-w-full truncate text-[11px] font-medium ${isActive ? "text-[#EB9D2A]" : "text-[#7A7D72] dark:text-[#9EA096]"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
