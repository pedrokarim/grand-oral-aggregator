"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WidgetFrame } from "./widgets/widget-frame";
import { WIDGETS, useWidgets, WIDGETS_STORAGE_KEY } from "@/lib/widgets";

interface WidgetsLayerProps {
  onOpenRoute: (path: string, title: string) => void;
}

// Right icon column width (cf. desktop-layout): 1 column × COL_SPACING (128)
// + a small extra margin so the widget doesn't kiss the icons.
const RIGHT_ICON_COLUMN_RESERVED = 128 + 24;

export function WidgetsLayer({ onOpenRoute }: WidgetsLayerProps) {
  const { state, patchWidget } = useWidgets();
  // Bring-to-front order. Higher = on top.
  const [order, setOrder] = useState<string[]>(() => WIDGETS.map((w) => w.id));

  // First-mount: resolve right-anchored default positions against viewport
  // width. Reads localStorage *directly* (not via the atom) to bypass jotai's
  // hydration timing — otherwise the effect can race the atom hydration,
  // see DEFAULT_STATE, and overwrite the user's saved position. As soon as
  // any entry exists for a widget in localStorage, we leave it alone.
  const initOnceRef = useRef(false);
  useEffect(() => {
    if (initOnceRef.current) return;
    initOnceRef.current = true;
    let raw: Record<string, unknown> = {};
    try {
      const r = localStorage.getItem(WIDGETS_STORAGE_KEY);
      if (r) raw = JSON.parse(r) ?? {};
    } catch {
      raw = {};
    }
    const vw = window.innerWidth;
    for (const def of WIDGETS) {
      if (def.defaultAnchor !== "right") continue;
      if (raw[def.id]) continue;
      const ws = state[def.id];
      if (!ws) continue;
      const rightX = Math.max(20, vw - ws.size.width - RIGHT_ICON_COLUMN_RESERVED);
      patchWidget(def.id, { position: { x: rightX, y: ws.position.y } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
