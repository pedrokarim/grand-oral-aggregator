import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/* ---- Window manager ---- */
export interface AppWindow {
  id: string;
  path: string;
  /** The path used for the iframe src — never changes after creation */
  initialPath: string;
  title: string;
  zIndex: number;
  minimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export const windowsAtom = atomWithStorage<AppWindow[]>("desktop-windows", []);

/** Derive the focused window (highest zIndex, not minimized) */
export const focusedWindowAtom = atom<AppWindow | null>((get) => {
  const windows = get(windowsAtom);
  const visible = windows.filter((w) => !w.minimized);
  if (visible.length === 0) return null;
  return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
});
