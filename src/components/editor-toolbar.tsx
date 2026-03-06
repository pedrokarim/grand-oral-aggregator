"use client";

import {
  ReloadIcon,
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
} from "@radix-ui/react-icons";
import { Link2, MessageSquare, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

function ToolbarButton({ children, disabled, className }: { children: React.ReactNode; disabled?: boolean; className?: string }) {
  return (
    <button
      className={`inline-flex items-center justify-center size-7 px-[5px] rounded text-sm border border-transparent
        text-[#4D4F46] dark:text-[#9EA096] transition-colors
        ${disabled ? "opacity-30 cursor-default" : "hover:bg-[#D2D3CC]/50 dark:hover:bg-[#444]/50 active:bg-[#D2D3CC] dark:active:bg-[#444] active:border-[#BFC1B7] dark:active:border-[#555] cursor-default"}
        ${className ?? ""}`}
      tabIndex={-1}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-[#BFC1B7] dark:bg-[#3a3b3f] mx-2.5" />;
}

function ToolbarDropdown({ label }: { label: string }) {
  return (
    <button
      className="inline-flex items-center gap-1 h-7 px-2 rounded-[6px] border border-[#BFC1B7] dark:border-[#3a3b3f]
        bg-[#FDFDF8] dark:bg-[#1E1F23] text-[13px] text-[#4D4F46] dark:text-[#9EA096]
        hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] cursor-default"
      tabIndex={-1}
    >
      {label} <span className="text-[10px] text-[#9EA096]">&#9662;</span>
    </button>
  );
}

export function EditorToolbar() {
  return (
    <aside className="p-2 bg-[#E5E7E0] dark:bg-[#2a2b2f] border-b border-[#BFC1B7] dark:border-[#3a3b3f] select-none">
      <div className="flex items-center gap-0.5 rounded-[6px] border border-[#BFC1B7] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] p-1 overflow-x-auto">
        {/* Undo / Redo */}
        <ToolbarButton><ReloadIcon className="w-4 h-4 scale-x-[-1]" /></ToolbarButton>
        <ToolbarButton><ReloadIcon className="w-4 h-4" /></ToolbarButton>

        <ToolbarSeparator />

        {/* Zoom dropdown */}
        <ToolbarDropdown label="Zoom" />

        <ToolbarSeparator />

        {/* Bold / Italic / Strikethrough */}
        <ToolbarButton><FontBoldIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton><FontItalicIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton><StrikethroughIcon className="w-4 h-4" /></ToolbarButton>

        <ToolbarSeparator />

        {/* Font dropdown */}
        <ToolbarDropdown label="Font" />

        <ToolbarSeparator />

        {/* Alignment */}
        <ToolbarButton><TextAlignLeftIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton><TextAlignCenterIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton><TextAlignRightIcon className="w-4 h-4" /></ToolbarButton>

        <ToolbarSeparator />

        {/* Link / Comment (disabled) */}
        <ToolbarButton disabled><Link2 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton disabled><MessageSquare className="w-4 h-4" /></ToolbarButton>

        <div className="flex-1" />

        {/* Right side: search, theme toggle, CTA */}
        <ToolbarButton><Search className="w-4 h-4" /></ToolbarButton>
        <ThemeToggle />
        <button
          className="ml-1 -my-0.5 text-[13px] font-bold text-[#23251D] dark:text-[#23251D] px-2.5 py-1 rounded-[6px] cursor-default
            bg-[#EB9D2A] border-[1.5px] border-[#B17816]
            translate-y-[-2px] hover:translate-y-[-3px] active:translate-y-[-1.5px]
            transition-all select-none"
          tabIndex={-1}
        >
          Préparer l&apos;oral
        </button>
      </div>
    </aside>
  );
}
