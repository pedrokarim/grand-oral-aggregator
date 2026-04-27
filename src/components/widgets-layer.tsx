"use client";

import { useCallback, useState } from "react";
import { WidgetFrame } from "./widgets/widget-frame";
import { WIDGETS, useWidgets } from "@/lib/widgets";

interface WidgetsLayerProps {
  onOpenRoute: (path: string, title: string) => void;
}

export function WidgetsLayer({ onOpenRoute }: WidgetsLayerProps) {
  const { state, patchWidget } = useWidgets();
  // Bring-to-front order. Higher = on top.
  const [order, setOrder] = useState<string[]>(() => WIDGETS.map((w) => w.id));

  const focus = useCallback((id: string) => {
    setOrder((prev) => [...prev.filter((x) => x !== id), id]);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {WIDGETS.map((def) => {
        const ws = state[def.id];
        if (!ws?.enabled) return null;
        const z = 15 + order.indexOf(def.id);
        const Component = def.Component;
        return (
          <div key={def.id} className="pointer-events-auto">
            <WidgetFrame
              id={def.id}
              label={def.label}
              state={ws}
              minSize={def.minSize}
              zIndex={z}
              onFocus={() => focus(def.id)}
              onPositionChange={(p) => patchWidget(def.id, { position: p })}
              onSizeChange={(s) => patchWidget(def.id, { size: s })}
              onStyleChange={(style) => patchWidget(def.id, { style })}
              onDisable={() => patchWidget(def.id, { enabled: false })}
            >
              <Component
                state={ws}
                patchState={(patch) => patchWidget(def.id, patch)}
                onOpenRoute={onOpenRoute}
              />
            </WidgetFrame>
          </div>
        );
      })}
    </div>
  );
}
