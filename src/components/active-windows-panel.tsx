"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { AppWindow } from "@/lib/atoms";

interface ActiveWindowsPanelProps {
  open: boolean;
  onClose: () => void;
  windows: AppWindow[];
  focusedWindowId: string | null;
  onWindowClick: (windowId: string) => void;
  onWindowClose: (windowId: string) => void;
  onCloseAll: () => void;
}

export function ActiveWindowsPanel({
  open,
  onClose,
  windows,
  focusedWindowId,
  onWindowClick,
  onWindowClose,
  onCloseAll,
}: ActiveWindowsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Click outside to close (like PostHog SidePanel)
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

  // Escape to close
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
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#BFC1B7] dark:border-[#3a3b3f]">
              <h2 className="text-base font-semibold text-[#23251D] dark:text-[#EAECF6]">
                Active windows
              </h2>
              <div className="flex items-center gap-1">
                {windows.length > 0 && (
                  <button
                    onClick={() => {
                      onCloseAll();
                      onClose();
                    }}
                    className="text-[13px] text-[#4D4F46] dark:text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#FDFDF8] px-2 py-0.5 rounded-[5px] border border-transparent hover:border-[#BFC1B7] dark:hover:border-[#3a3b3f] transition-colors cursor-default"
                  >
                    Close all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center p-1 rounded-[5px] border border-transparent hover:border-[#BFC1B7] dark:hover:border-[#3a3b3f] text-[#4D4F46] dark:text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#FDFDF8] transition-colors cursor-default"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Window list */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="flex flex-col gap-0.5">
                {windows.length === 0 ? (
                  <p className="text-sm text-[#9EA096] text-center py-6">
                    No active windows
                  </p>
                ) : (
                  windows.map((win) => {
                    const isActive = win.id === focusedWindowId;
                    return (
                      <button
                        key={win.id}
                        onClick={() => {
                          onWindowClick(win.id);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-left transition-colors cursor-default group
                          ${
                            isActive
                              ? "bg-[#E5E7E0] dark:bg-[#2a2b2f] text-[#23251D] dark:text-[#EAECF6] font-semibold"
                              : "text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]/50"
                          }`}
                      >
                        <span
                          className={`flex-1 text-sm truncate ${
                            win.minimized ? "italic opacity-60" : ""
                          }`}
                        >
                          {win.title}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onWindowClose(win.id);
                          }}
                          className="text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#FDFDF8] opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none px-1 cursor-default"
                        >
                          &times;
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
