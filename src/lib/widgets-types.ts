import type { ComponentType } from "react";

export type WidgetStyle = "default" | "glass" | "minimal" | "bold";

export const WIDGET_STYLES: { id: WidgetStyle; label: string; description: string }[] = [
  { id: "default", label: "Default", description: "Carte solide avec bordure" },
  { id: "glass", label: "Glass", description: "Verre dépoli, fond translucide" },
  { id: "minimal", label: "Minimal", description: "Sans bordure, presque invisible" },
  { id: "bold", label: "Bold", description: "Liseré orange marqué, ombre prononcée" },
];

export interface WidgetState {
  enabled: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: WidgetStyle;
}

export type WidgetsState = Record<string, WidgetState>;

export interface WidgetComponentProps {
  state: WidgetState;
  patchState: (patch: Partial<WidgetState>) => void;
  onOpenRoute: (path: string, title: string) => void;
}

export interface WidgetDef {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  Component: ComponentType<WidgetComponentProps>;
}
