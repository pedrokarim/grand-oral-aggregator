"use client";

import { type ReactNode, useState, useRef, useCallback } from "react";
import { motion, useDragControls } from "framer-motion";
import { FileText, ChevronDown, Minus, Square, X, Maximize2, Minimize2 } from "lucide-react";

interface DesktopWindowProps {
  id: string;
  title: string;
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isFocused: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
}

const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

export function DesktopWindow({
  title,
  children,
  toolbar,
  className,
  zIndex,
  position,
  size,
  isFocused,
  onFocus,
  onClose,
  onMinimize,
  onPositionChange,
  onSizeChange,
}: DesktopWindowProps) {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxState, setPreMaxState] = useState<{
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);

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
    if (isMaximized && preMaxState) {
      // Restore
      onPositionChange(preMaxState.position);
      onSizeChange(preMaxState.size);
      setIsMaximized(false);
      setPreMaxState(null);
    } else {
      // Maximize
      setPreMaxState({ position, size });
      onPositionChange({ x: 0, y: 0 });
      const vw = window.innerWidth;
      const vh = window.innerHeight - 32; // header height
      onSizeChange({ width: vw, height: vh });
      setIsMaximized(true);
    }
  }, [isMaximized, preMaxState, position, size, onPositionChange, onSizeChange]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      setIsDragging(false);
      if (isMaximized) return;
      onPositionChange({
        x: position.x + info.offset.x,
        y: position.y + info.offset.y,
      });
    },
    [isMaximized, position, onPositionChange],
  );

  const startResize = useCallback(
    (e: React.PointerEvent, edge: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMaximized) return;

      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: size.width,
        startH: size.height,
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

        onSizeChange({ width: newW, height: newH });
        onPositionChange({ x: newX, y: newY });
      };

      const onUp = () => {
        resizeRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [isMaximized, position, size, onPositionChange, onSizeChange],
  );

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none" style={{ top: 32 }} />

      <motion.div
        ref={windowRef}
        className={`absolute flex flex-col rounded-lg border border-[#BFC1B7] bg-[#FDFDF8] dark:bg-[#1E1F23] dark:border-[#3a3b3f] overflow-hidden
          ${isDragging ? "shadow-[0_25px_60px_rgba(0,0,0,0.3)]" : "shadow-2xl"}
          ${!isFocused ? "opacity-95" : ""}
          ${className ?? ""}`}
        style={{
          width: size.width,
          height: size.height,
          zIndex,
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
        onPointerDown={onFocus}
      >
        <WindowTitleBar
          title={title}
          onPointerDown={(e) => dragControls.start(e)}
          onDoubleClick={handleDoubleClickTitleBar}
          isMaximized={isMaximized}
          onClose={onClose}
          onMinimize={onMinimize}
        />
        {toolbar && <div className="shrink-0">{toolbar}</div>}
        <div className="flex-1 overflow-y-auto bg-[#FDFDF8] dark:bg-[#1E1F23]">{children}</div>

        {/* Resize handles */}
        {!isMaximized && (
          <>
            <div className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize" onPointerDown={(e) => startResize(e, "e")} />
            <div className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize" onPointerDown={(e) => startResize(e, "w")} />
            <div className="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize" onPointerDown={(e) => startResize(e, "s")} />
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onPointerDown={(e) => startResize(e, "se")} />
            <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" onPointerDown={(e) => startResize(e, "sw")} />
          </>
        )}
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
  onClose,
  onMinimize,
}: {
  title: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
}) {
  return (
    <div
      className="flex items-center h-9 px-1.5 pr-0.5 bg-[#E5E7E0] dark:bg-[#2a2b2f] border-b border-[#BFC1B7] dark:border-[#3a3b3f] shrink-0 select-none relative cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Left: document icon + chevron */}
      <div className="flex items-center z-10">
        <button className="flex items-center px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] dark:text-[#9EA096] transition-colors cursor-default" tabIndex={-1} onPointerDown={(e) => e.stopPropagation()}>
          <FileText className="w-5 h-5" />
          <ChevronDown className="w-4 h-4 -mx-0.5 text-[#9EA096]" />
        </button>
      </div>
      {/* Center: title + chevron */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm font-semibold text-[#23251D] dark:text-[#EAECF6]">{title}</span>
        <ChevronDown className="w-4 h-4 -ml-0.5 text-[#9EA096]" />
      </div>
      <div className="flex-1" />
      {/* Right: window controls */}
      <div className="flex items-center z-10">
        <button
          className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] dark:text-[#9EA096] transition-colors cursor-default"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
        >
          <Minus className="w-4 h-4 relative top-[1px]" />
        </button>
        <button
          className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] dark:text-[#9EA096] transition-colors cursor-default group"
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
          className="inline-flex items-center justify-center px-1.5 py-1 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] dark:text-[#9EA096] transition-colors cursor-default"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
