"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, RotateCcw } from "lucide-react";
import { WIDGETS, useWidgets } from "@/lib/widgets";
import { WIDGET_STYLES, type WidgetStyle } from "@/lib/widgets-types";

interface WidgetsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function WidgetsPanel({ open, onClose }: WidgetsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { state, patchWidget, resetPositions } = useWidgets();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const enabledCount = Object.values(state).filter((s) => s?.enabled).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ translateX: "100%" }}
          animate={{ translateX: 0 }}
          exit={{ translateX: "100%" }}
          transition={{ duration: 0.3, type: "tween" }}
          className="fixed top-[calc(32px+1rem)] right-4 h-[calc(100vh-2rem-32px)] w-80 bg-[#FDFDF8] dark:bg-[#1E1F23] border border-[#BFC1B7] dark:border-[#3a3b3f] rounded-lg shadow-xl z-[999] select-none"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#BFC1B7] dark:border-[#3a3b3f]">
              <div className="flex items-baseline gap-2">
                <h2 className="text-base font-semibold text-[#23251D] dark:text-[#EAECF6]">
                  Widgets
                </h2>
                <span className="text-[11px] text-[#9EA096]">
                  {enabledCount}/{WIDGETS.length} actifs
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetPositions}
                  title="Réinitialiser positions et tailles"
                  className="text-[12px] inline-flex items-center gap-1 text-[#4D4F46] dark:text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#FDFDF8] px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#BFC1B7] dark:hover:border-[#3a3b3f] transition-colors cursor-default"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center p-1 rounded-[5px] border border-transparent hover:border-[#BFC1B7] dark:hover:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#FDFDF8] transition-colors cursor-default"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-3">
                {WIDGETS.map((w) => {
                  const ws = state[w.id];
                  if (!ws) return null;
                  return (
                    <div
                      key={w.id}
                      className={`rounded-md border p-3 transition-colors ${
                        ws.enabled
                          ? "border-[#BFC1B7] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23]"
                          : "border-dashed border-[#D2D3CC] dark:border-[#3a3b3f]/60 bg-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#23251D] dark:text-[#EAECF6]">
                            {w.label}
                          </div>
                          <p className="text-[11px] text-[#9EA096] mt-0.5">{w.description}</p>
                        </div>
                        <Toggle
                          checked={ws.enabled}
                          onChange={(v) => patchWidget(w.id, { enabled: v })}
                          label={`Activer ${w.label}`}
                        />
                      </div>

                      {ws.enabled && (
                        <div className="mt-3">
                          <div className="text-[10px] uppercase tracking-wider text-[#9EA096] font-semibold mb-1.5">
                            Style
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {WIDGET_STYLES.map((s) => (
                              <StylePill
                                key={s.id}
                                id={s.id}
                                label={s.label}
                                active={ws.style === s.id}
                                onSelect={() => patchWidget(w.id, { style: s.id })}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-2 border-t border-[#BFC1B7] dark:border-[#3a3b3f] text-[11px] text-[#9EA096] leading-snug">
              Drag par la barre du widget · poignée en bas-à-droite pour redimensionner.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`shrink-0 inline-flex items-center w-9 h-5 rounded-full transition-colors cursor-default ${
        checked ? "bg-[#EB9D2A]" : "bg-[#D2D3CC] dark:bg-[#3a3b3f]"
      }`}
    >
      <span
        className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function StylePill({
  id,
  label,
  active,
  onSelect,
}: {
  id: WidgetStyle;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  // Tiny preview swatch reflecting the style.
  const swatch: Record<WidgetStyle, string> = {
    default: "bg-[#FDFDF8] dark:bg-[#1E1F23] border border-[#BFC1B7] dark:border-[#3a3b3f]",
    glass: "bg-white/60 dark:bg-white/10 backdrop-blur border border-white/40",
    minimal: "bg-[#FDFDF8]/40 dark:bg-[#1E1F23]/40",
    bold: "bg-[#FDFDF8] dark:bg-[#1E1F23] border-2 border-[#EB9D2A]",
  };
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-[5px] border transition-colors cursor-default text-left ${
        active
          ? "border-[#EB9D2A] bg-[#EB9D2A]/10 text-[#23251D] dark:text-[#EAECF6]"
          : "border-[#D2D3CC] dark:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:border-[#BFC1B7] dark:hover:border-[#555]"
      }`}
    >
      <span className={`w-3 h-3 rounded-sm ${swatch[id]}`} />
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  );
}
