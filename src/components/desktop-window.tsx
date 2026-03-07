"use client";

import { type ReactNode, useState, useRef, useCallback } from "react";
import { motion, useDragControls } from "framer-motion";
import { FileText, ChevronDown, Minus, Square, X, Maximize2, Minimize2, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { ContextMenu, Tooltip } from "radix-ui";

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
const HEADER_HEIGHT = 32;

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

  const expandWindow = useCallback(() => {
    if (isMaximized) return;
    setPreMaxState({ position, size });
    const vw = window.innerWidth;
    const vh = window.innerHeight - HEADER_HEIGHT;
    onPositionChange({ x: 0, y: 0 });
    onSizeChange({ width: vw, height: vh });
    setIsMaximized(true);
  }, [isMaximized, position, size, onPositionChange, onSizeChange]);

  const collapseWindow = useCallback(() => {
    if (!isMaximized || !preMaxState) return;
    onPositionChange(preMaxState.position);
    onSizeChange(preMaxState.size);
    setIsMaximized(false);
    setPreMaxState(null);
  }, [isMaximized, preMaxState, onPositionChange, onSizeChange]);

  const handleDoubleClickTitleBar = useCallback(() => {
    if (isMaximized) {
      collapseWindow();
    } else {
      expandWindow();
    }
  }, [isMaximized, collapseWindow, expandWindow]);

  const handleSnapToSide = useCallback(
    (side: "left" | "right") => {
      setPreMaxState({ position, size });
      const vw = window.innerWidth;
      const vh = window.innerHeight - HEADER_HEIGHT;
      const halfW = Math.floor(vw / 2);
      onSizeChange({ width: halfW, height: vh });
      onPositionChange({ x: side === "left" ? 0 : halfW, y: 0 });
      setIsMaximized(true);
    },
    [position, size, onPositionChange, onSizeChange],
  );

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
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none" style={{ top: HEADER_HEIGHT }} />

      <motion.div
        ref={windowRef}
        className={`absolute flex flex-col rounded-lg border border-[#BFC1B7] dark:border-[#3a3b3f] overflow-hidden
          ${isDragging ? "shadow-[0_25px_60px_rgba(0,0,0,0.3)]" : "shadow-2xl"}
          ${!isFocused ? "opacity-95" : ""}
          ${className ?? ""}`}
        style={{
          width: size.width,
          height: size.height,
          zIndex,
          x: position.x,
          y: position.y,
        }}
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
          onExpandWindow={expandWindow}
          onCollapseWindow={collapseWindow}
          onSnapToSide={handleSnapToSide}
          windowWidth={size.width}
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

/* ---- Keyboard shortcut badge ---- */
function KBD({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 rounded border border-[#BFC1B7] dark:border-[#3a3b3f] bg-[#E5E7E0] dark:bg-[#2a2b2f] text-[10px] font-mono text-[#4D4F46] dark:text-[#9EA096]">
      {children}
    </kbd>
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
  onExpandWindow,
  onCollapseWindow,
  onSnapToSide,
  windowWidth,
}: {
  title: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onExpandWindow: () => void;
  onCollapseWindow: () => void;
  onSnapToSide: (side: "left" | "right") => void;
  windowWidth: number;
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const isFullWidth = typeof window !== "undefined" && windowWidth >= window.innerWidth;

  return (
    <div
      className="flex items-center h-9 px-1.5 pr-0.5 bg-[#E5E7E0]/50 backdrop-blur-xl dark:bg-[#2a2b2f]/50 border-b border-[#BFC1B7] dark:border-[#3a3b3f] shrink-0 select-none relative cursor-grab active:cursor-grabbing"
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
        {/* Minimize */}
        <button
          className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] dark:text-[#9EA096] transition-colors cursor-default"
          tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onMinimize}
        >
          <Minus className="w-4 h-4 relative top-[1px]" />
        </button>

        {/* Maximize / Restore — with right-click context menu */}
        <ContextMenu.Root onOpenChange={() => setTooltipVisible(false)}>
          <Tooltip.Provider delayDuration={400}>
            <Tooltip.Root open={tooltipVisible} onOpenChange={setTooltipVisible}>
              <Tooltip.Trigger asChild>
                <ContextMenu.Trigger asChild>
                  <button
                    className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-[5px] border border-transparent hover:border-[#9EA096] data-[state=open]:border-[#9EA096] text-[#4D4F46] dark:text-[#9EA096] transition-colors cursor-default group"
                    tabIndex={-1}
                    onPointerDown={(e) => {
                      if (e.button === 0) {
                        e.stopPropagation();
                        setTooltipVisible(false);
                        if (isFullWidth) {
                          onCollapseWindow();
                        } else {
                          onExpandWindow();
                        }
                      }
                    }}
                  >
                    <Square className="w-[18px] h-[18px] group-hover:hidden" />
                    {isMaximized ? (
                      <Minimize2 className="w-5 h-5 hidden group-hover:block" />
                    ) : (
                      <Maximize2 className="w-5 h-5 hidden group-hover:block" />
                    )}
                  </button>
                </ContextMenu.Trigger>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={6}
                  className="px-2 py-1 rounded bg-[#23251D] text-[#FDFDF8] text-[11px] whitespace-nowrap shadow-lg z-[9999]"
                >
                  Right click for more options
                  <Tooltip.Arrow className="fill-[#23251D]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
          <ContextMenu.Portal>
            <ContextMenu.Content
              className="min-w-[220px] rounded-md bg-white dark:bg-[#1E1F23] p-1 shadow-xl border border-[#BFC1B7] dark:border-[#3a3b3f] z-[9999]"
            >
              <ContextMenu.Label className="px-2.5 text-[13px] leading-[25px] text-[#9EA096]">
                Snap to...
              </ContextMenu.Label>
              <ContextMenu.Item
                className="group relative flex h-[25px] select-none items-center rounded px-2.5 text-sm leading-none text-[#23251D] dark:text-[#EAECF6] outline-none data-[highlighted]:bg-[#E5E7E0] dark:data-[highlighted]:bg-[#2a2b2f] cursor-default"
                onClick={() => onSnapToSide("left")}
              >
                Left half
                <div className="ml-auto pl-5 flex items-center gap-0.5 text-[#9EA096]">
                  <KBD>Shift</KBD>
                  <KBD><ArrowLeft className="w-3 h-3" /></KBD>
                </div>
              </ContextMenu.Item>
              <ContextMenu.Item
                className="group relative flex h-[25px] select-none items-center rounded px-2.5 text-sm leading-none text-[#23251D] dark:text-[#EAECF6] outline-none data-[highlighted]:bg-[#E5E7E0] dark:data-[highlighted]:bg-[#2a2b2f] cursor-default"
                onClick={() => onSnapToSide("right")}
              >
                Right half
                <div className="ml-auto pl-5 flex items-center gap-0.5 text-[#9EA096]">
                  <KBD>Shift</KBD>
                  <KBD><ArrowRight className="w-3 h-3" /></KBD>
                </div>
              </ContextMenu.Item>
              <ContextMenu.Separator className="m-[5px] h-px bg-[#BFC1B7] dark:bg-[#3a3b3f]" />
              <ContextMenu.Label className="px-2.5 text-[13px] leading-[25px] text-[#9EA096]">
                Resize
              </ContextMenu.Label>
              <ContextMenu.Item
                disabled={isFullWidth}
                className="group relative flex h-[25px] select-none items-center rounded px-2.5 text-sm leading-none text-[#23251D] dark:text-[#EAECF6] outline-none data-[highlighted]:bg-[#E5E7E0] dark:data-[highlighted]:bg-[#2a2b2f] data-[disabled]:text-[#9EA096] data-[disabled]:pointer-events-none cursor-default"
                onClick={onExpandWindow}
              >
                Maximize
                <div className="ml-auto pl-5 flex items-center gap-0.5 text-[#9EA096]">
                  <KBD>Shift</KBD>
                  <KBD><ArrowUp className="w-3 h-3" /></KBD>
                </div>
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>

        {/* Close */}
        <button
          className="inline-flex items-center justify-center px-1.5 py-1 rounded-[5px] border border-transparent hover:border-[#9EA096] text-[#4D4F46] dark:text-[#9EA096] transition-colors cursor-default"
          tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
