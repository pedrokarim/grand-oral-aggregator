import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import type { WidgetsState, WidgetState, WidgetDef } from "./widgets-types";
import { NewsWidget } from "@/components/widgets/news-widget";
import { ClockWidget } from "@/components/widgets/clock-widget";
import { SubjectsWidget } from "@/components/widgets/subjects-widget";
import { TimerWidget } from "@/components/widgets/timer-widget";
import { CountdownWidget } from "@/components/widgets/countdown-widget";
import { NotesWidget } from "@/components/widgets/notes-widget";
import { WeatherWidget } from "@/components/widgets/weather-widget";
import { PostitsWidget } from "@/components/widgets/postits-widget";

export const WIDGETS: WidgetDef[] = [
  {
    id: "news",
    label: "Dernières actualités",
    description: "Flux des derniers articles scrapés, tous thèmes confondus.",
    icon: "/icons/widgets/news.svg",
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
    icon: "/icons/widgets/clock.svg",
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
    icon: "/icons/widgets/subjects.svg",
    defaultEnabled: false,
    defaultPosition: { x: 0, y: 560 },
    defaultSize: { width: 320, height: 220 },
    minSize: { width: 260, height: 180 },
    defaultAnchor: "right",
    Component: SubjectsWidget,
  },
  {
    id: "timer",
    label: "Minuteur d'entraînement",
    description: "Chronomètre tes prises de parole (exposé, échange) avec alerte de dépassement.",
    icon: "/icons/widgets/timer.svg",
    defaultEnabled: false,
    // x clears the left desktop-icon column (cf. desktop-layout COL_SPACING).
    defaultPosition: { x: 152, y: 20 },
    defaultSize: { width: 260, height: 230 },
    minSize: { width: 220, height: 200 },
    Component: TimerWidget,
  },
  {
    id: "countdown",
    label: "Compte à rebours",
    description: "Décompte jusqu'au jour J du Grand Oral (date modifiable).",
    icon: "/icons/widgets/countdown.svg",
    defaultEnabled: false,
    defaultPosition: { x: 152, y: 270 },
    defaultSize: { width: 300, height: 200 },
    minSize: { width: 260, height: 170 },
    Component: CountdownWidget,
  },
  {
    id: "notes",
    label: "Bloc-notes",
    description: "Notes rapides sauvegardées automatiquement (accroches, plan, mots-clés).",
    icon: "/icons/widgets/notes.svg",
    defaultEnabled: false,
    defaultPosition: { x: 152, y: 490 },
    defaultSize: { width: 300, height: 260 },
    minSize: { width: 240, height: 180 },
    Component: NotesWidget,
  },
  {
    id: "weather",
    label: "Météo",
    description: "Météo locale (géolocalisation) avec prévisions sur 3 jours.",
    icon: "/icons/widgets/weather.svg",
    defaultEnabled: false,
    defaultPosition: { x: 0, y: 790 },
    defaultSize: { width: 260, height: 210 },
    minSize: { width: 220, height: 180 },
    defaultAnchor: "right",
    Component: WeatherWidget,
  },
  {
    id: "postits",
    label: "Post-its colorés",
    description: "Plusieurs notes colorées empilées, sauvegardées automatiquement.",
    icon: "/icons/widgets/postits.svg",
    defaultEnabled: false,
    defaultPosition: { x: 152, y: 760 },
    defaultSize: { width: 300, height: 280 },
    minSize: { width: 260, height: 200 },
    Component: PostitsWidget,
  },
];

// Bump suffix (-v2) when default positions change so existing users get the
// new layout without manual reset. Old keys remain in localStorage but unused.
export const WIDGETS_STORAGE_KEY = "desktop-widgets-v2";
const STORAGE_KEY = WIDGETS_STORAGE_KEY;

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
