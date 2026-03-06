"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, type RefObject, useState } from "react";
import { motion, useDragControls } from "framer-motion";

interface DesktopIconProps {
  icon: ReactNode;
  label: string;
  href: string;
  constraintsRef?: RefObject<HTMLElement | null>;
  initialPosition: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onOpen: (href: string, label: string) => void;
}

export function DesktopIcon({
  icon,
  label,
  href,
  constraintsRef,
  initialPosition,
  onPositionChange,
  onOpen,
}: DesktopIconProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [position, setPosition] = useState(initialPosition);

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    setIsDragging(false);
    if (!constraintsRef?.current) return;

    const bounds = constraintsRef.current.getBoundingClientRect();
    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;

    const iconWidth = 112;
    const iconHeight = 90;
    const maxX = bounds.width - iconWidth;
    const maxY = bounds.height - iconHeight;

    const constrained = {
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY)),
    };

    setPosition(constrained);
    onPositionChange?.(constrained);
    setTimeout(() => { setHasDragged(false); }, 100);
  };

  const handleClick = () => {
    if (hasDragged) return;
    onOpen(href, label);
  };

  return (
    <motion.li
      className={`absolute w-28 flex justify-center items-center list-none
        ${isDragging ? "z-50" : "z-10"}`}
      animate={{ x: position.x, y: position.y, scale: 1, opacity: 1 }}
      drag={!!constraintsRef}
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
      whileDrag={{ scale: 1.1, rotate: 2 }}
      initial={{ x: initialPosition.x, y: initialPosition.y }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        controls.start(e);
      }}
    >
      <div className="relative cursor-move">
        <button
          onClick={handleClick}
          className="flex flex-col items-center gap-0.5 group"
          draggable={false}
        >
          <span className="relative">{icon}</span>
          <figcaption className="text-[13px] font-medium text-center leading-tight">
            <span className="inline-block leading-snug">
              <span
                className={`rounded-[2px] px-0.5 py-0 transition-colors
                  ${isActive
                    ? "bg-[rgba(238,239,233,1)] text-[#23251D] dark:bg-[rgba(30,31,35,1)] dark:text-[#EAECF6]"
                    : "bg-[rgba(238,239,233,0.75)] text-[#4D4F46] dark:bg-[rgba(1,1,1,0.75)] dark:text-[#EAECF6] group-hover:bg-[rgba(238,239,233,1)]"
                  }`}
              >
                {label}
              </span>
            </span>
          </figcaption>
        </button>
      </div>
    </motion.li>
  );
}
