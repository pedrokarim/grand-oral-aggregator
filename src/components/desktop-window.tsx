"use client";

import { type ReactNode, useState, useRef, useCallback } from "react";
import { motion, useDragControls } from "framer-motion";
import { FileText, ChevronDown, Minus, Square, X, Maximize2, Minimize2 } from "lucide-react";

interface DesktopWindowProps {
  title: string;
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

interface Size {
  width: number;
  height: number;
}

const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

export function DesktopWindow({ title, children, toolbar, className }: DesktopWindowProps) {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<Size | null>(null); // null = auto (flex)
  const [isMaximized, setIsMaximized] = useState(true); // starts maximized in layout
  const [isDragging, setIsDragging] = useState(false);

  // Resize state
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startPosX: number;
    startPosY: number;
    edge: string;
  } | null>(null);

  const handleDoubleClickTitleBar = useCallback(() => {
    if (isMaximized) {
      // Un-maximize: shrink to 80% of viewport, center
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.max(MIN_WIDTH, vw * 0.7);
      const h = Math.max(MIN_HEIGHT, vh * 0.7);
      setSize({ width: w, height: h });
      setPosition({ x: (vw - w) / 2 - 112, y: (vh - h) / 2 - 40 });
      setIsMaximized(false);
    } else {
      // Maximize: reset to flex fill
      setSize(null);
      setPosition({ x: 0, y: 0 });
      setIsMaximized(true);
    }
  }, [isMaximized]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      setIsDragging(false);
      if (isMaximized) return;
      setPosition((prev) => ({
        x: prev.x + info.offset.x,
        y: prev.y + info.offset.y,
      }));
    },
    [isMaximized]
  );

  // Resize via edge handles
  const startResize = useCallback(
    (e: React.PointerEvent, edge: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMaximized || !windowRef.current) return;

      const rect = windowRef.current.getBoundingClientRect();
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: rect.width,
        startH: rect.height,
        startPosX: position.x,
        startPosY: position.y,
        edge,
      };

      const onMove = (ev: PointerEvent) => {
        if (!resizeRef.current) return;
        const r = resizeRef.current;
        const dx = ev.clientX - r.startX;
        const dy = ev.clientY - r.startY;

        let newW = r.startW;
        let newH = r.startH;
        let newX = r.startPosX;
        let newY = r.startPosY;

        if (r.edge.includes("e")) newW = Math.max(MIN_WIDTH, r.startW + dx);
        if (r.edge.includes("w")) {
          newW = Math.max(MIN_WIDTH, r.startW - dx);
          newX = r.startPosX + (r.startW - newW);
        }
        if (r.edge.includes("s")) newH = Math.max(MIN_HEIGHT, r.startH + dy);
        if (r.edge.includes("n")) {
          newH = Math.max(MIN_HEIGHT, r.startH - dy);
          newY = r.startPosY + (r.startH - newH);
        }

        setSize({ width: newW, height: newH });
        setPosition({ x: newX, y: newY });
      };

      const onUp = () => {
        resizeRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [isMaximized, position]
  );

  // When maximized, render as a simple flex child (no absolute positioning)
  if (isMaximized) {
    return (
      <div
        ref={windowRef}
        className={`flex flex-col rounded-lg border border-[#BFC1B7] bg-[#FDFDF8] shadow-2xl overflow-hidden ${className ?? ""}`}
      >
        <WindowTitleBar
          title={title}
          onPointerDown={(e) => {
            // Un-maximize on drag start
            if (isMaximized) {
              handleDoubleClickTitleBar();
              return;
            }
            dragControls.start(e);
          }}
          onDoubleClick={handleDoubleClickTitleBar}
          isMaximized={isMaximized}
        />
        {toolbar && <div className="shrink-0">{toolbar}</div>}
        <div className="flex-1 overflow-y-auto bg-[#FDFDF8]">{children}</div>
      </div>
    );
  }

  // When not maximized, render as draggable absolute-positioned window
  return (
    <>
      {/* Constraints container (full desktop area) */}
      <div ref={constraintsRef} className="absolute inset-0 pointer-events-none" />

      <motion.div
        ref={windowRef}
        className={`absolute flex flex-col rounded-lg border border-[#BFC1B7] bg-[#FDFDF8] overflow-hidden
          ${isDragging ? "shadow-[0_25px_60px_rgba(0,0,0,0.3)]" : "shadow-2xl"}
          ${className ?? ""}`}
        style={{
          width: size?.width,
          height: size?.height,
          zIndex: 20,
        }}
        animate={{ x: position.x, y: position.y }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={constraintsRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        <WindowTitleBar
          title={title}
          onPointerDown={(e) => dragControls.start(e)}
          onDoubleClick={handleDoubleClickTitleBar}
          isMaximized={isMaximized}
        />
        {toolbar && <div className="shrink-0">{toolbar}</div>}
        <div className="flex-1 overflow-y-auto bg-[#FDFDF8]">{children}</div>

        {/* Resize handles */}
        <div className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize" onPointerDown={(e) => startResize(e, "e")} />
        <div className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize" onPointerDown={(e) => startResize(e, "w")} />
        <div className="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize" onPointerDown={(e) => startResize(e, "s")} />
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onPointerDown={(e) => startResize(e, "se")} />
        <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" onPointerDown={(e) => startResize(e, "sw")} />
      </motion.div>
    </>
  );
}

/* ---- Sub-components ---- */

function WindowTitleBar({
  title,
  onPointerDown,
  onDoubleClick,
  isMaximized,
}: {
  title: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
  isMaximized: boolean;
}) {
  return (
    <div
      className="flex items-center h-9 px-1.5 pr-0.5 bg-[#E5E7E0] border-b border-[#BFC1B7] shrink-0 select-none relative cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Left: document icon + chevron */}
      <div className="flex items-center z-10">
        <button className="flex items-center px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] transition-colors cursor-default" tabIndex={-1} onPointerDown={(e) => e.stopPropagation()}>
          <FileText className="w-5 h-5" />
          <ChevronDown className="w-4 h-4 -mx-0.5 text-[#9EA096]" />
        </button>
      </div>
      {/* Center: title + chevron */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm font-semibold text-[#23251D]">{title}</span>
        <ChevronDown className="w-4 h-4 -ml-0.5 text-[#9EA096]" />
      </div>
      <div className="flex-1" />
      {/* Right: window controls (OSButton style) */}
      <div className="flex items-center z-10">
        <button
          className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] transition-colors cursor-default"
          tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Minus className="w-4 h-4 relative top-[1px]" />
        </button>
        <button
          className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] transition-colors cursor-default group"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.stopPropagation();
            onDoubleClick();
          }}
        >
          <Square className="w-[18px] h-[18px] group-hover:hidden" />
          {isMaximized ? (
            <Minimize2 className="w-5 h-5 hidden group-hover:block" />
          ) : (
            <Maximize2 className="w-5 h-5 hidden group-hover:block" />
          )}
        </button>
        <button
          className="inline-flex items-center justify-center px-1.5 py-1 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] transition-colors cursor-default"
          tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

