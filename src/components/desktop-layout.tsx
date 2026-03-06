"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { DesktopWindow } from "./desktop-window";
import { EditorToolbar } from "./editor-toolbar";
import { DesktopIcon } from "./desktop-icon";
import { DesktopWallpaper } from "./desktop-wallpaper";
import { MobileDock } from "./mobile-dock";
import { DesktopContextMenu } from "./desktop-context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { themeStats } from "@/lib/data";
import { iconPositionsAtom, type IconPositions } from "@/lib/atoms";
import { useWindowManager } from "@/lib/use-window-manager";
import { GraduationCap, Search, Bell } from "lucide-react";

/* ---- Theme → PostHog PNG icon mapping ---- */
const themeIconMap: Record<string, string> = {
  "Cybersecurité": "/icons/page.png",
  "SI et environnement": "/icons/handbook.png",
  "Cloud et virtualisation": "/icons/data-warehouse.png",
  "Big Data": "/icons/ai.png",
  "Développement": "/icons/canvas.png",
  "Intelligence artificielle": "/icons/ai.png",
  "Mobilité": "/icons/compass.png",
  "Management et stratégie": "/icons/pricing.png",
  "Blockchain": "/icons/map.png",
  "Optimisation du SI": "/icons/spreadsheet.png",
};

function getThemeIcon(theme: string): string {
  return themeIconMap[theme] ?? "/icons/doc.png";
}

/* ---- All desktop apps ---- */
interface DesktopApp {
  icon: string;
  label: string;
  href: string;
  side: "left" | "right";
}

function getAllApps(): DesktopApp[] {
  const left: DesktopApp[] = [
    { icon: "/icons/doc.png", label: "home.mdx", href: "/", side: "left" },
    { icon: "/icons/folder.png", label: "Product OS", href: "/", side: "left" },
    { icon: "/icons/invite.png", label: "Actualités", href: "/actualites", side: "left" },
    ...themeStats.slice(0, 6).map(({ theme, slug }) => ({
      icon: getThemeIcon(theme),
      label: theme.length > 14 ? theme.slice(0, 13) + "…" : theme,
      href: `/themes/${slug}`,
      side: "left" as const,
    })),
    { icon: "/icons/settings.png", label: "Paramètres", href: "/settings", side: "left" },
  ];

  const right: DesktopApp[] = [
    { icon: "/icons/notebook.png", label: "Docs", href: "/", side: "right" },
    ...themeStats.slice(6).map(({ theme, slug }) => ({
      icon: getThemeIcon(theme),
      label: theme.length > 14 ? theme.slice(0, 13) + "…" : theme,
      href: `/themes/${slug}`,
      side: "right" as const,
    })),
    { icon: "/icons/switch.png", label: "Mode site", href: "/", side: "right" },
  ];

  return [...left, ...right];
}

/* ---- Position calculation ---- */
const ICON_HEIGHT = 75;
const PADDING_H = 4;
const PADDING_V = 20;
const COL_SPACING = 128;
const ICON_WIDTH = 112;

function generatePositions(
  apps: DesktopApp[],
  containerWidth: number,
  containerHeight: number,
): IconPositions {
  const positions: IconPositions = {};
  const leftApps = apps.filter((a) => a.side === "left");
  const rightApps = apps.filter((a) => a.side === "right");
  const maxPerCol = Math.floor((containerHeight - PADDING_V * 2) / ICON_HEIGHT);

  leftApps.forEach((app, i) => {
    const col = Math.floor(i / maxPerCol);
    const row = i % maxPerCol;
    positions[app.label] = {
      x: PADDING_H + col * COL_SPACING,
      y: PADDING_V + row * ICON_HEIGHT,
    };
  });

  const rightStart = containerWidth - PADDING_H - ICON_WIDTH;
  rightApps.forEach((app, i) => {
    const col = Math.floor(i / maxPerCol);
    const row = i % maxPerCol;
    positions[app.label] = {
      x: rightStart - col * COL_SPACING,
      y: PADDING_V + row * ICON_HEIGHT,
    };
  });

  return positions;
}

/* ---- Route titles ---- */
const routeTitles: Record<string, string> = {
  "/": "home.mdx",
  "/actualites": "actualites.mdx",
  "/settings": "settings.mdx",
};

function getWindowTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/themes/")) {
    const slug = pathname.replace("/themes/", "");
    const theme = themeStats.find((t) => t.slug === slug);
    return theme ? `${theme.theme.toLowerCase().replace(/\s+/g, "-")}.mdx` : "theme.mdx";
  }
  return "page.mdx";
}

/* PostHog-style 3D orange button */
function OSButton({ children, href }: { children: ReactNode; href?: string }) {
  const classes = `text-[13px] font-bold text-[#FDFDF8] px-3 py-1 rounded-sm cursor-default
    bg-[#EB9D2A] border-b-[3px] border-[#B17816] shadow-[0_2px_0_#CD8407]
    hover:translate-y-[-1px] hover:shadow-[0_3px_0_#CD8407] active:translate-y-0 active:shadow-none
    transition-all`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }
  return <button className={classes} tabIndex={-1}>{children}</button>;
}

function PngIcon({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="w-10 h-10" draggable={false} />;
}

export function DesktopLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const desktopRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  const allApps = getAllApps();
  const [iconPositions, setIconPositions] = useAtom(iconPositionsAtom);

  const {
    windows,
    focusedWindow,
    openWindow,
    bringToFront,
    closeWindow,
    minimizeWindow,
    updatePosition,
    updateSize,
    resetIcons,
  } = useWindowManager();

  const computePositions = useCallback(() => {
    const w = desktopRef.current?.getBoundingClientRect().width ?? (typeof window !== "undefined" ? window.innerWidth : 1200);
    const h = desktopRef.current?.getBoundingClientRect().height ?? (typeof window !== "undefined" ? window.innerHeight : 800);
    return generatePositions(allApps, w, h);
  }, []);

  useEffect(() => {
    const allExist = allApps.every((a) => iconPositions[a.label]);
    if (!allExist) {
      setIconPositions(computePositions());
    }

    const handleResize = () => setIconPositions(computePositions());
    window.addEventListener("resize", handleResize);
    setTimeout(() => setRendered(true), 300);
    return () => window.removeEventListener("resize", handleResize);
  }, [computePositions]);

  // Auto-open a window for the current route on first load
  useEffect(() => {
    if (windows.length === 0) {
      openWindow(pathname, getWindowTitle(pathname));
    }
  }, []);

  const handlePositionChange = (label: string, pos: { x: number; y: number }) => {
    setIconPositions((prev) => ({ ...prev, [label]: pos }));
  };

  const handleIconOpen = (href: string, label: string) => {
    const title = getWindowTitle(href);
    openWindow(href, title);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DesktopWallpaper />

      {/* ===== Top header bar ===== */}
      <header className="hidden md:flex items-center h-8 px-4 bg-[#23251D] z-50 shrink-0 select-none">
        <Link href="/" className="flex items-center gap-1.5 mr-6">
          <GraduationCap className="w-4 h-4 text-[#FDFDF8]" />
          <span className="text-[13px] font-bold text-[#FDFDF8]">Grand Oral</span>
        </Link>
        <nav className="flex items-center gap-1">
          {[
            { label: "Thèmes", href: "/" },
            { label: "Actualités", href: "/actualites" },
            { label: "Docs", href: "/" },
            { label: "Paramètres", href: "/settings" },
          ].map(({ label, href }) => (
            <button
              key={label}
              onClick={() => handleIconOpen(href, label)}
              className="text-[13px] text-[#9EA096] hover:text-[#FDFDF8] px-2 py-0.5 rounded transition-colors cursor-default"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button className="p-1 text-[#9EA096] hover:text-[#FDFDF8] transition-colors cursor-default" tabIndex={-1}>
            <Search className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 text-[#9EA096] hover:text-[#FDFDF8] transition-colors cursor-default" tabIndex={-1}>
            <Bell className="w-3.5 h-3.5" />
          </button>
          <OSButton>Préparer l&apos;oral</OSButton>
        </div>
      </header>

      {/* ===== Desktop area ===== */}
      <DesktopContextMenu onResetIcons={resetIcons}>
        <div ref={desktopRef} className="flex-1 relative overflow-hidden">

          {/* Icons — absolutely positioned on the desktop */}
          <nav className="hidden md:block absolute inset-0 z-10">
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: rendered ? 1 : 0 }}
              className="list-none m-0 p-0"
            >
              {allApps.map((app) => {
                const pos = iconPositions[app.label] || { x: 0, y: 0 };
                return (
                  <DesktopIcon
                    key={app.label}
                    icon={<PngIcon src={app.icon} alt={app.label} />}
                    label={app.label}
                    href={app.href}
                    constraintsRef={desktopRef}
                    initialPosition={pos}
                    onPositionChange={(p) => handlePositionChange(app.label, p)}
                    onOpen={handleIconOpen}
                  />
                );
              })}
            </motion.ul>
          </nav>

          {/* Windows — each rendered with iframe for independent content */}
          {windows
            .filter((w) => !w.minimized)
            .map((win) => (
              <DesktopWindow
                key={win.id}
                id={win.id}
                title={win.title}
                zIndex={win.zIndex + 20}
                position={win.position}
                size={win.size}
                isFocused={focusedWindow?.id === win.id}
                onFocus={() => bringToFront(win.id)}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onPositionChange={(pos) => updatePosition(win.id, pos)}
                onSizeChange={(size) => updateSize(win.id, size)}
                toolbar={<EditorToolbar />}
              >
                <iframe
                  src={`${win.path}${win.path.includes("?") ? "&" : "?"}_embed=1`}
                  className="w-full h-full border-0"
                  title={win.title}
                />
              </DesktopWindow>
            ))}

          {/* Mobile fallback — single window */}
          <div className="md:hidden absolute inset-0 flex items-stretch py-2 px-2 z-20">
            <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-[#BFC1B7] bg-[#FDFDF8] shadow-2xl overflow-hidden">
              <div className="flex items-center h-9 px-3 bg-[#E5E7E0] border-b border-[#BFC1B7] shrink-0">
                <span className="text-sm font-semibold text-[#23251D]">{getWindowTitle(pathname)}</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6">{children}</div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DesktopContextMenu>

      {/* Mobile dock */}
      <MobileDock />
    </div>
  );
}
