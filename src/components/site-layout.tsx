"use client";

import { type ReactNode } from "react";
import { Monitor } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./app-sidebar";
import { AppBreadcrumbs } from "./breadcrumbs";
import { AuthButton } from "./auth-button";
import { ThemeToggle } from "./theme-toggle";
import { setSiteMode } from "@/hooks/use-site-mode";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#FDFDF8] dark:bg-[#1E1F23]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#D2D3CC] dark:border-[#3a3b3f] px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AppBreadcrumbs />
          <div className="flex-1" />
          <button
            onClick={() => setSiteMode("desktop")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-medium rounded-md
              border border-[#D2D3CC] dark:border-[#3a3b3f]
              text-[#4D4F46] dark:text-[#9EA096]
              hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f]
              hover:text-[#23251D] dark:hover:text-[#EAECF6]
              transition-colors"
            title="Revenir au mode bureau"
          >
            <Monitor className="h-3.5 w-3.5" />
            Mode bureau
          </button>
          <ThemeToggle />
          <AuthButton />
        </header>
        <main className="flex-1 min-h-0 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
