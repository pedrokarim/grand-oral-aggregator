"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DesktopWindow } from "./desktop-window";
import { EditorToolbar } from "./editor-toolbar";
import { DesktopIcon } from "./desktop-icon";
import { DesktopWallpaper } from "./desktop-wallpaper";
import { MobileDock } from "./mobile-dock";
import { DesktopContextMenu } from "./desktop-context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { themeStats } from "@/lib/data";
import { useWindowManager } from "@/lib/use-window-manager";
import { ActiveWindowsPanel } from "./active-windows-panel";
import { GraduationCap, Search, Bell, MessageCircle } from "lucide-react";
import { AuthButton } from "./auth-button";
import { ChatPanel } from "./chat-panel";
import { setSiteMode } from "@/hooks/use-site-mode";

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

/* ---- Video thumbnail icon (like PostHog's demo.mov) ---- */
function VideoThumbIcon() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className="w-14 h-14 -my-1">
      <rect x="2" y="10" width="44" height="28" rx="3" fill="#23251D" />
      <rect x="4" y="12" width="40" height="24" rx="2" fill="#2F3128" />
      <text x="24" y="22" textAnchor="middle" fill="#EB9D2A" fontSize="8" fontWeight="bold" fontFamily="monospace">DEMO</text>
      <rect x="8" y="26" width="32" height="2" rx="1" fill="#4D4F46" />
      <rect x="8" y="26" width="12" height="2" rx="1" fill="#EB9D2A" />
      <path
        d="M20.38 15.9C19.41 15.31 18.17 16.01 18.17 17.15V30.85C18.17 31.99 19.41 32.69 20.38 32.1L31.69 25.25C32.63 24.68 32.63 23.32 31.69 22.75L20.38 15.9Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

/* ---- All desktop apps ---- */
interface DesktopApp {
  icon: string;
  customIcon?: boolean;
  label: string;
  href: string;
  side: "left" | "right";
}

function getAllApps(): DesktopApp[] {
  const left: DesktopApp[] = [
    { icon: "/icons/doc.png", label: "home.mdx", href: "/", side: "left" },
    { icon: "/icons/search.png", label: "Recherche", href: "/recherche", side: "left" },
    { icon: "/icons/invite.png", label: "Actualités", href: "/actualites", side: "left" },
    { icon: "/icons/video.png", label: "demo.mov", href: "/demo", side: "left", customIcon: true },
    ...themeStats.slice(0, 6).map(({ theme, slug }) => ({
      icon: getThemeIcon(theme),
      label: theme.length > 14 ? theme.slice(0, 13) + "…" : theme,
      href: `/themes/${slug}`,
      side: "left" as const,
    })),
    { icon: "/icons/contact.png", label: "Profil", href: "/profile", side: "left" },
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
    { icon: "/icons/switch.png", label: "Mode site", href: "#mode-site", side: "right" },
  ];

  return [...left, ...right];
}

/* ---- Position calculation (like PostHog) ---- */
type IconPositions = Record<string, { x: number; y: number }>;
const STORAGE_KEY = "desktop-icon-positions";
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
  "/profile": "profil",
  "/demo": "Demo - Grand Oral",
  "/recherche": "recherche.mdx",
  "/docs": "docs.mdx",
};

function getWindowTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/themes/")) {
    const slug = pathname.replace("/themes/", "");
    const theme = themeStats.find((t) => t.slug === slug);
    return theme ? `${theme.theme.toLowerCase().replace(/\s+/g, "-")}.mdx` : "theme.mdx";
  }
  if (pathname.startsWith("/actualites/")) {
    const slug = pathname.replace("/actualites/", "");
    return slug ? `${slug}.mdx` : "actualites.mdx";
  }
  if (pathname.startsWith("/sujets/")) {
    const slug = pathname.replace("/sujets/", "");
    return slug ? `${slug}.mdx` : "sujets.mdx";
  }
  const mesSujetsMatch = pathname.match(/^\/themes\/([^/]+)\/mes-sujets$/);
  if (mesSujetsMatch) {
    return `mes-sujets-${mesSujetsMatch[1]}.mdx`;
  }
  return "page.mdx";
}

/* PostHog-style 3D orange button */
function OSButton({ children, href }: { children: ReactNode; href?: string }) {
  const classes = `text-[13px] font-bold text-[#FDFDF8] px-2.5 py-0.5 rounded-sm cursor-default
    bg-[#EB9D2A] border-b-2 border-[#B17816] shadow-[0_1px_0_#CD8407]
    hover:translate-y-[-1px] hover:shadow-[0_2px_0_#CD8407] active:translate-y-0 active:shadow-none
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
  const [iconPositions, setIconPositions] = useState<IconPositions>({});

  const [activeWindowsPanelOpen, setActiveWindowsPanelOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);

  const {
    windows,
    focusedWindow,
    openWindow,
    bringToFront,
    closeWindow,
    closeAllWindows,
    minimizeWindow,
    updatePosition,
    updateSize,
    updateWindowRoute,
  } = useWindowManager();

  const computePositions = useCallback(() => {
    const w = desktopRef.current?.getBoundingClientRect().width ?? (typeof window !== "undefined" ? window.innerWidth : 1200);
    const h = desktopRef.current?.getBoundingClientRect().height ?? (typeof window !== "undefined" ? window.innerHeight : 800);
    return generatePositions(allApps, w, h);
  }, []);

  // Load positions from localStorage on mount (like PostHog)
  useEffect(() => {
    const savedPositions = localStorage.getItem(STORAGE_KEY);
    if (savedPositions) {
      try {
        const parsed = JSON.parse(savedPositions);
        const allExist = allApps.every((a) => parsed[a.label]);
        if (allExist) {
          setIconPositions(parsed);
        } else {
          setIconPositions(generateInitial());
        }
      } catch {
        setIconPositions(generateInitial());
      }
    } else {
      setIconPositions(generateInitial());
    }

    function generateInitial() {
      const pos = computePositions();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
      return pos;
    }

    const handleResize = () => {
      setIconPositions(computePositions());
    };

    setTimeout(() => setRendered(true), 400);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computePositions]);

  // Auto-open/focus a window for the current route on first load.
  // openWindow dedupes by path, so if a restored window matches, it is brought
  // to front; otherwise a new window is created for the current URL. This
  // ensures reloading a deep link (e.g. /actualites/<slug>) always surfaces
  // the right content, even when other windows were persisted in localStorage.
  const hasAutoOpened = useRef(false);
  useEffect(() => {
    if (hasAutoOpened.current) return;
    hasAutoOpened.current = true;
    openWindow(pathname, getWindowTitle(pathname));
  }, []);

  // Refs for stable postMessage handler (avoid re-attaching on every state change)
  const openWindowRef = useRef(openWindow);
  const updateWindowRouteRef = useRef(updateWindowRoute);
  const computePositionsRef = useRef(computePositions);
  openWindowRef.current = openWindow;
  updateWindowRouteRef.current = updateWindowRoute;
  computePositionsRef.current = computePositions;

  // Listen for postMessage from iframes (e.g. reset-icons from settings)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "reset-icons") {
        localStorage.removeItem(STORAGE_KEY);
        const fresh = computePositionsRef.current();
        setIconPositions(fresh);
      }
      if (e.data?.type === "open-window" && e.data.path) {
        const title = getWindowTitle(e.data.path);
        openWindowRef.current(e.data.path, title);
      }
      if (e.data?.type === "update-window-route" && e.data.path) {
        // Find which iframe sent this message using e.source
        const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe[data-window-id]");
        for (const frame of iframes) {
          if (frame.contentWindow === e.source) {
            const windowId = frame.getAttribute("data-window-id");
            if (windowId) {
              const newTitle = getWindowTitle(e.data.path);
              updateWindowRouteRef.current(windowId, e.data.path, newTitle);
            }
            break;
          }
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handlePositionChange = (label: string, pos: { x: number; y: number }) => {
    const next = { ...iconPositions, [label]: pos };
    setIconPositions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetIcons = () => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = computePositions();
    setIconPositions(fresh);
  };

  const handleIconOpen = (href: string, label: string) => {
    if (href === "#mode-site") {
      setSiteMode("site");
      return;
    }
    const title = getWindowTitle(href);
    openWindow(href, title);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DesktopWallpaper />

      {/* ===== Top header bar ===== */}
      <header className="hidden md:flex items-center h-8 pl-1 pr-2 bg-[#23251D] z-50 shrink-0 select-none">
        <Link href="/" className="flex items-center gap-1.5 px-2">
          <GraduationCap className="w-4 h-4 text-[#FDFDF8]" />
          <span className="text-[13px] font-bold text-[#FDFDF8]">Grand Oral</span>
        </Link>
        <nav className="flex items-center">
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
        <div className="flex items-center gap-0.5 py-1">
          <OSButton>Préparer l&apos;oral</OSButton>
          <button className="p-1 text-[#9EA096] hover:text-[#FDFDF8] transition-colors cursor-default" tabIndex={-1}>
            <Search className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 text-[#9EA096] hover:text-[#FDFDF8] transition-colors cursor-default" tabIndex={-1}>
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChatPanelOpen(!chatPanelOpen)}
            className={`p-1 transition-colors cursor-default ${chatPanelOpen ? "text-[#FDFDF8]" : "text-[#9EA096] hover:text-[#FDFDF8]"}`}
            tabIndex={-1}
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveWindowsPanelOpen(!activeWindowsPanelOpen)}
            className={`min-w-6 h-5 px-1.5 ml-0.5 inline-flex justify-center items-center rounded
              border-[1.5px] border-t-4 transition-colors cursor-default
              ${windows.length > 1
                ? "bg-[#2F3128] border-[#4D4F46] text-[#FDFDF8]"
                : "bg-[#23251D] border-[#4D4F46] text-[#9EA096]"}
              hover:bg-[#3a3b33] hover:text-[#FDFDF8]`}
          >
            <span className="text-[13px] font-semibold relative -top-px">{windows.length}</span>
          </button>
          <AuthButton />
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
                    icon={app.customIcon ? <VideoThumbIcon /> : <PngIcon src={app.icon} alt={app.label} />}
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
                toolbar={win.path === "/demo" ? undefined : <EditorToolbar />}
              >
                <iframe
                  data-window-id={win.id}
                  src={`${win.initialPath ?? win.path}${(win.initialPath ?? win.path).includes("?") ? "&" : "?"}_embed=1`}
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
                {children}
              </ScrollArea>
            </div>
          </div>
        </div>
      </DesktopContextMenu>

      {/* Mobile dock */}
      <MobileDock />

      {/* Active windows panel */}
      <ActiveWindowsPanel
        open={activeWindowsPanelOpen}
        onClose={() => setActiveWindowsPanelOpen(false)}
        windows={windows}
        focusedWindowId={focusedWindow?.id ?? null}
        onWindowClick={(id) => bringToFront(id)}
        onWindowClose={(id) => closeWindow(id)}
        onCloseAll={closeAllWindows}
      />

      {/* Chat panel */}
      <ChatPanel
        open={chatPanelOpen}
        onClose={() => setChatPanelOpen(false)}
      />
    </div>
  );
}
