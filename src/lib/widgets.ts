import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import type { WidgetsState, WidgetState, WidgetDef } from "./widgets-types";
import { NewsWidget } from "@/components/widgets/news-widget";
import { ClockWidget } from "@/components/widgets/clock-widget";
import { SubjectsWidget } from "@/components/widgets/subjects-widget";

export const WIDGETS: WidgetDef[] = [
  {
    id: "news",
    label: "Dernières actualités",
    description: "Flux des derniers articles scrapés, tous thèmes confondus.",
    defaultEnabled: true,
    defaultPosition: { x: 0, y: 20 },
    defaultSize: { width: 285, height: 360 },
    minSize: { width: 260, height: 220 },
    defaultAnchor: "right",
    Component: NewsWidget,
  },
  {
    id: "clock",
    label: "Horloge",
    description: "Heure et date du jour, format minimal.",
    defaultEnabled: false,
    defaultPosition: { x: 0, y: 400 },
    defaultSize: { width: 240, height: 140 },
    minSize: { width: 200, height: 110 },
    defaultAnchor: "right",
    Component: ClockWidget,
  },
  {
    id: "subjects",
    label: "Sujet aléatoire",
    description: "Tire un sujet de préparation au hasard pour t'inspirer.",
    defaultEnabled: false,
    defaultPosition: { x: 0, y: 560 },
    defaultSize: { width: 320, height: 220 },
    minSize: { width: 260, height: 180 },
    defaultAnchor: "right",
    Component: SubjectsWidget,
  },
];

// Bump suffix (-v2) when default positions change so existing users get the
// new layout without manual reset. Old keys remain in localStorage but unused.
const STORAGE_KEY = "desktop-widgets-v2";

const DEFAULT_STATE: WidgetsState = Object.fromEntries(
  WIDGETS.map((w) => [
    w.id,
    {
      enabled: w.defaultEnabled,
      position: w.defaultPosition,
      size: w.defaultSize,
      style: "default" as const,
    } satisfies WidgetState,
  ]),
);

export const widgetsAtom = atomWithStorage<WidgetsState>(STORAGE_KEY, DEFAULT_STATE);

export function useWidgets() {
  const [stored, setStored] = useAtom(widgetsAtom);

  // Merge with defaults so newly added widgets in code appear in state.
  const state = useMemo<WidgetsState>(() => {
    const out: WidgetsState = { ...stored };
    for (const w of WIDGETS) {
      if (!out[w.id]) {
        out[w.id] = {
          enabled: w.defaultEnabled,
          position: w.defaultPosition,
          size: w.defaultSize,
          style: "default",
        };
      }
    }
    return out;
  }, [stored]);

  const patchWidget = useCallback(
    (id: string, patch: Partial<WidgetState>) => {
      setStored((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? state[id]), ...patch },
      }));
    },
    [setStored, state],
  );

  const resetPositions = useCallback(() => {
    setStored((prev) => {
      const out: WidgetsState = { ...prev };
      for (const w of WIDGETS) {
        out[w.id] = {
          ...(out[w.id] ?? {
            enabled: w.defaultEnabled,
            style: "default",
            position: w.defaultPosition,
            size: w.defaultSize,
          }),
          position: w.defaultPosition,
          size: w.defaultSize,
        };
      }
      return out;
    });
  }, [setStored]);

  return { state, patchWidget, resetPositions };
}
