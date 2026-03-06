"use client";

import {
  Undo2, Redo2, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Link2, MessageSquare, Search, Settings,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

function ToolbarButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      className={`flex items-center justify-center h-7 px-1.5 rounded text-[#4D4F46] transition-colors
        ${disabled ? "opacity-30 cursor-default" : "hover:bg-[#E5E7E0] active:bg-[#D2D3CC] cursor-default"}`}
      tabIndex={-1}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-[#D2D3CC] mx-1" />;
}

function ToolbarDropdown({ label }: { label: string }) {
  return (
    <button
      className="flex items-center gap-1 h-7 px-2 rounded border border-[#D2D3CC] bg-[#FDFDF8] text-[13px] text-[#4D4F46] hover:bg-[#E5E7E0] cursor-default"
      tabIndex={-1}
    >
      {label} <span className="text-[10px] text-[#9EA096]">▾</span>
    </button>
  );
}

export function EditorToolbar() {
  return (
    <div className="flex items-center h-9 px-2 gap-0.5 bg-[#E5E7E0] border-b border-[#BFC1B7] overflow-x-auto select-none">
      {/* Undo / Redo */}
      <ToolbarButton><Undo2 className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton><Redo2 className="w-3.5 h-3.5" /></ToolbarButton>

      <ToolbarSeparator />

      {/* Zoom dropdown */}
      <ToolbarDropdown label="Zoom" />

      <ToolbarSeparator />

      {/* Bold / Italic / Underline */}
      <ToolbarButton><Bold className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton><Italic className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton><Underline className="w-3.5 h-3.5" /></ToolbarButton>

      <ToolbarSeparator />

      {/* Font dropdown */}
      <ToolbarDropdown label="Font" />

      <ToolbarSeparator />

      {/* Alignment — PostHog has 3 buttons only */}
      <ToolbarButton><AlignLeft className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton><AlignCenter className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton><AlignRight className="w-3.5 h-3.5" /></ToolbarButton>

      <ToolbarSeparator />

      {/* Link / Comment */}
      <ToolbarButton disabled><Link2 className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton disabled><MessageSquare className="w-3.5 h-3.5" /></ToolbarButton>

      <div className="flex-1" />

      {/* Right side: search, settings, theme toggle, CTA */}
      <ToolbarButton><Search className="w-3.5 h-3.5" /></ToolbarButton>
      <ToolbarButton><Settings className="w-3.5 h-3.5" /></ToolbarButton>
      <ThemeToggle />
      <button
        className="ml-1 text-[13px] font-bold text-[#FDFDF8] px-3 py-1 rounded-sm cursor-default
          bg-[#EB9D2A] border-b-[3px] border-[#B17816] shadow-[0_2px_0_#CD8407]
          hover:translate-y-[-1px] hover:shadow-[0_3px_0_#CD8407] active:translate-y-0 active:shadow-none
          transition-all"
        tabIndex={-1}
      >
        Préparer l&apos;oral
      </button>
    </div>
  );
}
