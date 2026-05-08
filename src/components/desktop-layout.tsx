"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { DesktopWindow } from "./desktop-window";
import { EditorToolbar } from "./editor-toolbar";
import { DesktopIcon } from "./desktop-icon";
import { DesktopWallpaper } from "./desktop-wallpaper";
import { MobileDock } from "./mobile-dock";
import { DesktopContextMenu } from "./desktop-context-menu";
import { themeStats } from "@/lib/data";
import { useWindowManager } from "@/lib/use-window-manager";
import { ActiveWindowsPanel } from "./active-windows-panel";
import { GraduationCap, Search, Bell, MessageCircle, LayoutGrid } from "lucide-react";
import { AuthButton } from "./auth-button";
import { ChatPanel } from "./chat-panel";
import { WidgetsLayer } from "./widgets-layer";
import { WidgetsPanel } from "./widgets-panel";
import { setSiteMode } from "@/hooks/use-site-mode";
import { useUserRole } from "@/hooks/use-user-role";
import { useSettings } from "@/hooks/use-settings";

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

function getAllApps(isSuperAdmin: boolean): DesktopApp[] {
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
    ...(isSuperAdmin
      ? [{ icon: "/icons/settings.png", label: "Paramètres", href: "/settings", side: "left" as const }]
      : []),
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

/** Snap a free position to the nearest cell in the desktop grid.
 *  Cells are anchored to (PADDING_H, PADDING_V) and stepped by
 *  (COL_SPACING, ICON_HEIGHT) — same anchors generatePositions uses. */
function snapToGrid(
  pos: { x: number; y: number },
  containerWidth: number,
  containerHeight: number,
): { x: number; y: number } {
  const col = Math.round((pos.x - PADDING_H) / COL_SPACING);
  const row = Math.round((pos.y - PADDING_V) / ICON_HEIGHT);
  const maxCol = Math.max(0, Math.floor((containerWidth - PADDING_H - ICON_WIDTH) / COL_SPACING));
  const maxRow = Math.max(0, Math.floor((containerHeight - PADDING_V - ICON_HEIGHT) / ICON_HEIGHT));
  return {
    x: PADDING_H + Math.max(0, Math.min(maxCol, col)) * COL_SPACING,
    y: PADDING_V + Math.max(0, Math.min(maxRow, row)) * ICON_HEIGHT,
  };
}

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
  void children;
  const pathname = usePathname();
  const desktopRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  const { isSuperAdmin } = useUserRole();
  const [settings] = useSettings();
  const desktopLayout = settings.desktopLayout;
  const allApps = useMemo(() => getAllApps(isSuperAdmin), [isSuperAdmin]);
  const [iconPositions, setIconPositions] = useState<IconPositions>({});

  const [activeWindowsPanelOpen, setActiveWindowsPanelOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [widgetsPanelOpen, setWidgetsPanelOpen] = useState(false);

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
  }, [allApps]);

  // Load positions from localStorage on mount (like PostHog)
  useEffect(() => {
    const loadPositions = () => {
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
    };

    function generateInitial() {
      const pos = computePositions();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
      return pos;
    }

    // On resize, never regenerate the grid — that would wipe user-placed
    // icons. Instead, just clamp every icon back inside the new viewport.
    // Icons that are still inside their bounds are left untouched.
    const handleResize = () => {
      const rect = desktopRef.current?.getBoundingClientRect();
      const w = rect?.width ?? window.innerWidth;
      const h = rect?.height ?? window.innerHeight;
      const maxX = Math.max(0, w - ICON_WIDTH);
      const maxY = Math.max(0, h - ICON_HEIGHT);
      setIconPositions((prev) => {
        let changed = false;
        const out: IconPositions = {};
        for (const [label, pos] of Object.entries(prev)) {
          const nx = Math.max(0, Math.min(maxX, pos.x));
          const ny = Math.max(0, Math.min(maxY, pos.y));
          if (nx !== pos.x || ny !== pos.y) changed = true;
          out[label] = { x: nx, y: ny };
        }
        if (!changed) return prev;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
        return out;
      });
    };

    const loadTimer = setTimeout(loadPositions, 0);
    const renderTimer = setTimeout(() => setRendered(true), 400);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(renderTimer);
      window.removeEventListener("resize", handleResize);
    };
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

  useEffect(() => {
    openWindowRef.current = openWindow;
    updateWindowRouteRef.current = updateWindowRoute;
    computePositionsRef.current = computePositions;
  }, [openWindow, updateWindowRoute, computePositions]);

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

  // ===== Marquee selection state =====
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  // Visual icon footprint for hit-testing. ICON_WIDTH is the rendered card
  // width; using ICON_HEIGHT (the grid cell height) keeps the hit area in
  // line with what the user sees on the desktop.
  const ICON_HIT_W = ICON_WIDTH;
  const ICON_HIT_H = ICON_HEIGHT;

  const handlePositionChange = (label: string, pos: { x: number; y: number }) => {
    const rect = desktopRef.current?.getBoundingClientRect();
    const w = rect?.width ?? window.innerWidth;
    const h = rect?.height ?? window.innerHeight;
    const maxX = Math.max(0, w - ICON_WIDTH);
    const maxY = Math.max(0, h - ICON_HEIGHT);

    setIconPositions((prev) => {
      const oldPos = prev[label];
      let final = pos;
      if (desktopLayout === "grid") final = snapToGrid(pos, w, h);
      const next: IconPositions = { ...prev, [label]: final };

      // Group drag: if the dragged icon belongs to a multi-selection,
      // shift every other selected icon by the same delta so they all move
      // together. Computed at drop time (no live preview, by design — keeps
      // the implementation simple and avoids fighting framer-motion drag).
      if (oldPos && selected.has(label) && selected.size > 1) {
        const dx = final.x - oldPos.x;
        const dy = final.y - oldPos.y;
        if (dx !== 0 || dy !== 0) {
          for (const other of selected) {
            if (other === label) continue;
            const o = prev[other];
            if (!o) continue;
            const moved = {
              x: Math.max(0, Math.min(maxX, o.x + dx)),
              y: Math.max(0, Math.min(maxY, o.y + dy)),
            };
            next[other] = desktopLayout === "grid" ? snapToGrid(moved, w, h) : moved;
          }
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Clear selection on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selected.size > 0) setSelected(new Set());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected.size]);

  // Marquee: pointer-down on the empty desktop background starts a drag-to-
  // select rectangle. We attach pointermove/up to window so the marquee keeps
  // updating even if the cursor wanders over a window or the title bar.
  const handleNavPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    // Only start when the pointerdown landed on the empty bg, not on an icon.
    // Icon <li> elements stop propagation in their own handler, so this guard
    // mostly catches the motion.ul vs nav distinction.
    const t = e.target as HTMLElement;
    if (t.closest("[data-desktop-icon]")) return;

    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    setMarquee({ startX, startY, endX: startX, endY: startY });

    const onMove = (ev: PointerEvent) => {
      setMarquee((m) =>
        m
          ? { ...m, endX: ev.clientX - rect.left, endY: ev.clientY - rect.top }
          : m,
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setMarquee((m) => {
        if (!m) return null;
        const minX = Math.min(m.startX, m.endX);
        const maxX = Math.max(m.startX, m.endX);
        const minY = Math.min(m.startY, m.endY);
        const maxY = Math.max(m.startY, m.endY);
        // Tiny movement = treated as a plain click on the bg → clear selection
        if (maxX - minX < 4 && maxY - minY < 4) {
          setSelected(new Set());
          return null;
        }
        const hits = new Set<string>();
        for (const [label, pos] of Object.entries(iconPositions)) {
          const ix1 = pos.x;
          const iy1 = pos.y;
          const ix2 = pos.x + ICON_HIT_W;
          const iy2 = pos.y + ICON_HIT_H;
          if (ix2 < minX || ix1 > maxX || iy2 < minY || iy1 > maxY) continue;
          hits.add(label);
        }
        setSelected(hits);
        return null;
      });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // When the user switches to grid mode, snap every existing icon to its
  // nearest grid cell. Switching back to free leaves icons where they are.
  const lastLayoutRef = useRef(desktopLayout);
  useEffect(() => {
    if (lastLayoutRef.current === desktopLayout) return;
    lastLayoutRef.current = desktopLayout;
    if (desktopLayout !== "grid") return;
    const rect = desktopRef.current?.getBoundingClientRect();
    const w = rect?.width ?? window.innerWidth;
    const h = rect?.height ?? window.innerHeight;
    setIconPositions((prev) => {
      const out: IconPositions = {};
      let changed = false;
      for (const [label, pos] of Object.entries(prev)) {
        const snapped = snapToGrid(pos, w, h);
        if (snapped.x !== pos.x || snapped.y !== pos.y) changed = true;
        out[label] = snapped;
      }
      if (!changed) return prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
      return out;
    });
  }, [desktopLayout]);

  const resetIcons = () => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = computePositions();
    setIconPositions(fresh);
  };

  const handleIconOpen = (href: string, label: string) => {
    void label;
    if (selected.size > 0) setSelected(new Set());
    if (href === "#mode-site") {
      setSiteMode("site");
      return;
    }
    const title = getWindowTitle(href);
    openWindow(href, title);
  };

  return (
    <div className="hidden h-screen flex-col overflow-hidden md:flex">
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
            ...(isSuperAdmin ? [{ label: "Paramètres", href: "/settings" }] : []),
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
            onClick={() => setWidgetsPanelOpen(!widgetsPanelOpen)}
            className={`p-1 transition-colors cursor-default ${widgetsPanelOpen ? "text-[#FDFDF8]" : "text-[#9EA096] hover:text-[#FDFDF8]"}`}
            tabIndex={-1}
            aria-label="Gérer les widgets"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
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
          <nav
            className="hidden md:block absolute inset-0 z-10"
            onPointerDown={handleNavPointerDown}
          >
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
                    selected={selected.has(app.label)}
                    onPositionChange={(p) => handlePositionChange(app.label, p)}
                    onOpen={handleIconOpen}
                  />
                );
              })}
            </motion.ul>

            {/* Marquee rectangle (only visible while drag-selecting) */}
            {marquee && (
              <div
                className="absolute pointer-events-none rounded-[2px] border border-[#EB9D2A]/80 bg-[#EB9D2A]/15"
                style={{
                  left: Math.min(marquee.startX, marquee.endX),
                  top: Math.min(marquee.startY, marquee.endY),
                  width: Math.abs(marquee.endX - marquee.startX),
                  height: Math.abs(marquee.endY - marquee.startY),
                  zIndex: 11,
                }}
              />
            )}
          </nav>

          {/* Widgets layer — between icons (z-10) and windows (z-20+) */}
          <div className="hidden md:block">
            <WidgetsLayer
              onOpenRoute={(path, title) => openWindow(path, title)}
            />
          </div>

          {/* Windows — each rendered with iframe for independent content */}
          <div className="hidden md:block">
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

      {/* Widgets panel */}
      <WidgetsPanel
        open={widgetsPanelOpen}
        onClose={() => setWidgetsPanelOpen(false)}
      />
    </div>
  );
}
