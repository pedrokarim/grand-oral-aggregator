"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Newspaper, BookOpen, Settings,
} from "lucide-react";

const dockItems = [
  { icon: Home, label: "Accueil", href: "/" },
  { icon: BookOpen, label: "Thèmes", href: "/themes/cybersecurite" },
  { icon: Newspaper, label: "Actus", href: "/actualites" },
  { icon: Settings, label: "Config", href: "/settings" },
];

export function MobileDock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-[#EEEFE9] border-t border-[#BFC1B7] rounded-t-md">
        {dockItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-1.5 rounded transition-colors
                ${isActive ? "bg-[#E5E7E0]" : "hover:bg-[#E5E7E0]"}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#EB9D2A]" : "text-[#4D4F46]"}`} />
              <span className={`text-[11px] font-medium ${isActive ? "text-[#EB9D2A]" : "text-[#9EA096]"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
