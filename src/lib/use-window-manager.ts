"use client";

import { useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { windowsAtom, focusedWindowAtom, type AppWindow } from "./atoms";

function genId() {
  return `win-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useWindowManager() {
  const [windows, setWindows] = useAtom(windowsAtom);
  const focusedWindow = useAtomValue(focusedWindowAtom);
  const router = useRouter();

  // Deduplicate windows once on mount (fixes corrupt localStorage state)
  useEffect(() => {
    setWindows((prev) => {
      const seen = new Set<string>();
      const hasDupes = prev.some((w) => {
        if (seen.has(w.id)) return true;
        seen.add(w.id);
        return false;
      });
      if (!hasDupes) return prev;
      const unique = new Map<string, AppWindow>();
      for (const w of prev) unique.set(w.id, w);
      return [...unique.values()];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Open a new window or bring existing one to front */
  const openWindow = useCallback(
    (path: string, title: string) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.path === path || w.initialPath === path);
        if (existing) {
          // Bring to front. Also re-pin initialPath to the current path so that
          // the iframe src reflects the active URL on next mount (page reload
          // restores windows with a stale initialPath otherwise).
          const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
          return prev.map((w) =>
            w.id === existing.id
              ? {
                  ...w,
                  zIndex: maxZ + 1,
                  minimized: false,
                  path,
                  initialPath: path,
                  title,
                }
              : w,
          );
        }

        // Create new window
        const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const w = Math.max(500, vw * 0.55);
        const h = Math.max(400, vh * 0.7);

        // Cascade: offset from last window
        const offset = (prev.length % 6) * 30;

        const newWindow: AppWindow = {
          id: genId(),
          path,
          initialPath: path,
          title,
          zIndex: maxZ + 1,
          minimized: false,
          position: {
            x: Math.min(vw - w - 20, 120 + offset),
            y: Math.min(vh - h - 60, 20 + offset),
          },
          size: { width: w, height: h },
        };

        return [...prev, newWindow];
      });

      // Navigate to the new/focused window's path
      router.push(path);
    },
    [setWindows, router],
  );

  /** Bring a window to front */
  const bringToFront = useCallback(
    (windowId: string) => {
      setWindows((prev) => {
        const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
        const target = prev.find((w) => w.id === windowId);
        if (!target) return prev;

        const updated = prev.map((w) =>
          w.id === windowId
            ? { ...w, zIndex: maxZ + 1, minimized: false }
            : w,
        );

        // Navigate to the focused window's path
        if (target.path) {
          router.push(target.path);
        }

        return updated;
      });
    },
    [setWindows, router],
  );

  /** Close a window */
  const closeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) => {
        const remaining = prev.filter((w) => w.id !== windowId);

        // Navigate to the next highest window
        if (remaining.length > 0) {
          const visible = remaining.filter((w) => !w.minimized);
          if (visible.length > 0) {
            const next = visible.reduce((a, b) =>
              a.zIndex > b.zIndex ? a : b,
            );
            router.push(next.path);
          }
        }

        return remaining;
      });
    },
    [setWindows, router],
  );

  /** Minimize a window */
  const minimizeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) => {
        const updated = prev.map((w) =>
          w.id === windowId ? { ...w, minimized: true } : w,
        );

        // Focus next visible window
        const visible = updated.filter((w) => !w.minimized);
        if (visible.length > 0) {
          const next = visible.reduce((a, b) =>
            a.zIndex > b.zIndex ? a : b,
          );
          router.push(next.path);
        }

        return updated;
      });
    },
    [setWindows, router],
  );

  /** Update window position */
  const updatePosition = useCallback(
    (windowId: string, position: { x: number; y: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, position } : w)),
      );
    },
    [setWindows],
  );

  /** Update window size */
  const updateSize = useCallback(
    (windowId: string, size: { width: number; height: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, size } : w)),
      );
    },
    [setWindows],
  );

  /** Update a window's path and title (when iframe navigates internally) */
  const updateWindowRoute = useCallback(
    (windowId: string, path: string, title: string) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, path, title } : w)),
      );
      router.push(path);
    },
    [setWindows, router],
  );

  /** Close all windows */
  const closeAllWindows = useCallback(() => {
    setWindows([]);
  }, [setWindows]);

  return {
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
  };
}
