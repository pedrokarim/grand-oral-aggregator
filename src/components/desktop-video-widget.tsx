"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";

const STORAGE_KEY = "desktop-video-position";

interface DesktopVideoWidgetProps {
  constraintsRef: RefObject<HTMLElement | null>;
  containerWidth: number;
  containerHeight: number;
}

export function DesktopVideoWidget({
  constraintsRef,
  containerWidth,
  containerHeight,
}: DesktopVideoWidgetProps) {
  const controls = useDragControls();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const WIDTH = 280;
  const HEIGHT = 180;

  const defaultPos = {
    x: containerWidth - WIDTH - 32,
    y: containerHeight - HEIGHT - 32,
  };

  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") return defaultPos;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultPos;
  });

  // Update default position when container resizes (only if no saved position)
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setPosition({
        x: containerWidth - WIDTH - 32,
        y: containerHeight - HEIGHT - 32,
      });
    }
  }, [containerWidth, containerHeight]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    setIsDragging(false);
    if (!constraintsRef?.current) return;

    const bounds = constraintsRef.current.getBoundingClientRect();
    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;

    const constrained = {
      x: Math.max(0, Math.min(bounds.width - WIDTH, newX)),
      y: Math.max(0, Math.min(bounds.height - HEIGHT, newY)),
    };

    setPosition(constrained);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(constrained));
    setTimeout(() => setHasDragged(false), 100);
  };

  const togglePlayPause = () => {
    if (hasDragged) return;
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      className={`absolute select-none ${isDragging ? "z-50" : "z-10"}`}
      style={{ width: WIDTH }}
      animate={{ x: position.x, y: position.y }}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={constraintsRef}
      onDragStart={() => { setIsDragging(true); setHasDragged(false); }}
      onDrag={(_, info) => {
        if (!isDragging) setIsDragging(true);
        if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
          setHasDragged(true);
        }
      }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.04, rotate: 1 }}
      initial={{ x: position.x, y: position.y, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        controls.start(e);
      }}
    >
      {/* PostHog-style window chrome */}
      <div className="rounded-lg overflow-hidden border border-[#BFC1B7] shadow-lg bg-[#23251D]">
        {/* Title bar */}
        <div className="flex items-center h-7 px-2.5 bg-[#2F3128] border-b border-[#3a3b33] gap-1.5 cursor-move">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <span className="flex-1 text-center text-[11px] text-[#9EA096] font-medium truncate">
            video.mp4
          </span>
        </div>
        {/* Video */}
        <div className="relative cursor-pointer" onClick={togglePlayPause}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            loop
            className="w-full block"
            style={{ height: HEIGHT - 28 }}
            preload="auto"
          >
            <source src="/video/demo.mp4" type="video/mp4" />
          </video>
          {/* Play/pause overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <svg className="w-10 h-10 text-white/90" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
