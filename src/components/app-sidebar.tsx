"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { themeStats, themeIcons } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import {
  Leaf,
  Shield,
  Cloud,
  Database,
  Code,
  Smartphone,
  Briefcase,
  Link as LinkIcon,
  Brain,
  Settings,
  Home,
  Newspaper,
  GraduationCap,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link: LinkIcon, Brain, Settings,
};

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1.5">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Grand Oral</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/actualites"}>
                  <Link href="/actualites">
                    <Newspaper className="h-4 w-4" />
                    <span>Actualités</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Thèmes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {themeStats.map(({ theme, slug, count }) => {
                const Icon = iconMap[themeIcons[theme]] ?? Settings;
                const color = getThemeColor(theme);
                const isActive = pathname === `/themes/${slug}`;
                return (
                  <SidebarMenuItem key={slug}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={`/themes/${slug}`}>
                        <span className={`h-2 w-2 rounded-full ${color.dot} shrink-0`} />
                        <Icon className={`h-4 w-4 ${isActive ? color.text : ""}`} />
                        <span className="truncate">{theme}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{count}</SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/settings"}>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="text-xs text-muted-foreground px-3 pb-2">
          {themeStats.reduce((acc, t) => acc + t.count, 0)} sujets · {themeStats.length} thèmes
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
