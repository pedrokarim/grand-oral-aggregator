"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { GripVertical, X, Palette, Check } from "lucide-react";
import { Popover } from "radix-ui";
import type { WidgetState, WidgetStyle } from "@/lib/widgets-types";
import { WIDGET_STYLES } from "@/lib/widgets-types";

interface WidgetFrameProps {
  id: string;
  label: string;
  state: WidgetState;
  minSize: { width: number; height: number };
  zIndex: number;
  onFocus: () => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  onStyleChange: (style: WidgetStyle) => void;
  onDisable: () => void;
  children: ReactNode;
}

const HEADER_BG: Record<WidgetStyle, string> = {
  default:
    "bg-[#E5E7E0]/60 dark:bg-[#2a2b2f]/60 border-b border-[#BFC1B7] dark:border-[#3a3b3f]",
  glass:
    "bg-white/30 dark:bg-black/30 border-b border-white/30 dark:border-white/10",
  minimal: "bg-transparent",
  bold: "bg-[#23251D] text-[#FDFDF8] border-b-2 border-[#EB9D2A]",
};

const FRAME: Record<WidgetStyle, string> = {
  default:
    "bg-[#FDFDF8] dark:bg-[#1E1F23] border border-[#BFC1B7] dark:border-[#3a3b3f] shadow-md",
  glass:
    "bg-white/40 dark:bg-black/30 backdrop-blur-xl backdrop-saturate-150 border border-white/40 dark:border-white/10 shadow-xl",
  minimal:
    "bg-[#FDFDF8]/70 dark:bg-[#1E1F23]/70 backdrop-blur-sm",
  bold:
    "bg-[#FDFDF8] dark:bg-[#1E1F23] border-2 border-[#EB9D2A] shadow-[0_8px_30px_rgba(235,157,42,0.25)]",
};

const TITLE: Record<WidgetStyle, string> = {
  default: "text-[#23251D] dark:text-[#EAECF6]",
  glass: "text-[#23251D] dark:text-[#EAECF6]",
  minimal: "text-[#4D4F46] dark:text-[#9EA096]",
  bold: "text-[#FDFDF8]",
};

export function WidgetFrame({
  label,
  state,
  minSize,
  zIndex,
  onFocus,
  onPositionChange,
  onSizeChange,
  onStyleChange,
  onDisable,
  children,
}: WidgetFrameProps) {
  const dragControls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      setDragging(false);
      onPositionChange({
        x: Math.max(0, state.position.x + info.offset.x),
        y: Math.max(0, state.position.y + info.offset.y),
      });
    },
    [state.position, onPositionChange],
  );

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onFocus();

      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: state.size.width,
        startH: state.size.height,
      };

      const onMove = (ev: PointerEvent) => {
        if (!resizeRef.current) return;
        const r = resizeRef.current;
        const dx = ev.clientX - r.startX;
        const dy = ev.clientY - r.startY;
        onSizeChange({
          width: Math.max(minSize.width, r.startW + dx),
          height: Math.max(minSize.height, r.startH + dy),
        });
      };
      const onUp = () => {
        resizeRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [state.size, minSize, onSizeChange, onFocus],
  );

  return (
    <motion.div
      className={`absolute flex flex-col rounded-lg overflow-hidden select-none ${FRAME[state.style]}`}
      style={{ zIndex, x: state.position.x, y: state.position.y }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      onPointerDown={onFocus}
    >
      <div
        style={{ width: state.size.width, height: state.size.height }}
        className="flex flex-col"
      >
        {/* Header — drag handle + style picker + close */}
        <div
          className={`flex items-center h-8 px-1.5 shrink-0 cursor-grab active:cursor-grabbing ${HEADER_BG[state.style]} ${dragging ? "cursor-grabbing" : ""}`}
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className={`w-3.5 h-3.5 mr-1 opacity-60 ${TITLE[state.style]}`} />
          <span className={`text-[12px] font-semibold flex-1 truncate ${TITLE[state.style]}`}>
            {label}
          </span>

          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                className={`p-1 rounded-[5px] border border-transparent hover:border-current/30 ${TITLE[state.style]} opacity-70 hover:opacity-100 transition-opacity cursor-default`}
                aria-label="Changer le style"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={4}
                className="z-[1100] w-56 p-1 rounded-md bg-[#FDFDF8] dark:bg-[#1E1F23] border border-[#BFC1B7] dark:border-[#3a3b3f] shadow-xl"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {WIDGET_STYLES.map((s) => {
                  const active = s.id === state.style;
                  return (
                    <button
                      key={s.id}
                      onClick={() => onStyleChange(s.id)}
                      className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-[5px] text-left transition-colors cursor-default ${
                        active
                          ? "bg-[#E5E7E0] dark:bg-[#2a2b2f]"
                          : "hover:bg-[#E5E7E0]/60 dark:hover:bg-[#2a2b2f]/60"
                      }`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          active ? "text-[#EB9D2A]" : "opacity-0"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[#23251D] dark:text-[#EAECF6]">
                          {s.label}
                        </div>
                        <div className="text-[11px] text-[#9EA096] truncate">
                          {s.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onDisable}
            className={`p-1 rounded-[5px] border border-transparent hover:border-current/30 ${TITLE[state.style]} opacity-70 hover:opacity-100 transition-opacity cursor-default`}
            aria-label="Masquer le widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Resize handle (bottom-right) */}
        <div
          onPointerDown={startResize}
          className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize"
          style={{ zIndex: 2 }}
        />
      </div>
    </motion.div>
  );
}
