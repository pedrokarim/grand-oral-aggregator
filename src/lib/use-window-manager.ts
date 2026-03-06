"use client";

import { useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { windowsAtom, focusedWindowAtom, type AppWindow } from "./atoms";

let nextId = 1;

export function useWindowManager() {
  const [windows, setWindows] = useAtom(windowsAtom);
  const focusedWindow = useAtomValue(focusedWindowAtom);
  const router = useRouter();

  /** Open a new window or bring existing one to front */
  const openWindow = useCallback(
    (path: string, title: string) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.path === path);
        if (existing) {
          // Bring to front
          const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
          return prev.map((w) =>
            w.id === existing.id
              ? { ...w, zIndex: maxZ + 1, minimized: false }
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
          id: `win-${nextId++}`,
          path,
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
  };
}
