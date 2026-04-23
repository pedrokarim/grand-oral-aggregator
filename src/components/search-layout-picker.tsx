"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Check } from "lucide-react";
import { SEARCH_LAYOUTS, type SearchLayout } from "@/lib/settings";

interface SearchLayoutPickerProps {
  current: SearchLayout;
  onChange: (layout: SearchLayout) => void;
}

export function SearchLayoutPicker({ current, onChange }: SearchLayoutPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentMeta = SEARCH_LAYOUTS.find((l) => l.id === current);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-full border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8]/95 dark:bg-[#1E1F23]/95 backdrop-blur text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] transition-colors shadow-lg"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span>{currentMeta?.label ?? "Disposition"}</span>
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 z-30 w-80 rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] shadow-xl p-2">
          <p
            className="px-2 py-1 text-[10px] tracking-[0.2em] uppercase text-[#9EA096]"
            style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
          >
            Choisir une disposition
          </p>
          <ul className="list-none m-0 p-0 space-y-0.5">
            {SEARCH_LAYOUTS.map((l) => {
              const active = l.id === current;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => {
                      onChange(l.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                      active
                        ? "bg-[#EB9D2A]/10"
                        : "hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]"
                    }`}
                  >
                    <Thumbnail layoutId={l.id} active={active} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#23251D] dark:text-[#EAECF6] truncate">
                        {l.label}
                      </p>
                      <p className="text-[11px] text-[#9EA096] truncate">{l.description}</p>
                    </div>
                    {active && <Check className="h-4 w-4 text-[#EB9D2A] shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Tiny SVG sketches conveying each layout's shape. */
function Thumbnail({ layoutId, active }: { layoutId: SearchLayout; active: boolean }) {
  const stroke = active ? "#EB9D2A" : "#9EA096";
  const fill = active ? "rgba(235,157,42,0.15)" : "rgba(158,160,150,0.15)";
  return (
    <svg width="44" height="32" viewBox="0 0 44 32" className="shrink-0 rounded border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#2a2b2f]">
      {layoutId === "centered-minimal" && (
        <>
          <rect x="10" y="4" width="24" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <rect x="6" y="12" width="32" height="3" rx="1" fill={fill} />
          <rect x="6" y="17" width="32" height="3" rx="1" fill={fill} />
          <rect x="6" y="22" width="32" height="3" rx="1" fill={fill} />
        </>
      )}
      {layoutId === "sidebar-list" && (
        <>
          <rect x="3" y="4" width="10" height="24" rx="1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <rect x="16" y="4" width="25" height="6" rx="1" fill={fill} />
          <rect x="16" y="12" width="25" height="6" rx="1" fill={fill} />
          <rect x="16" y="20" width="25" height="6" rx="1" fill={fill} />
        </>
      )}
      {layoutId === "top-grid" && (
        <>
          <rect x="3" y="3" width="38" height="5" rx="1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <rect x="3" y="11" width="11" height="8" rx="1" fill={fill} />
          <rect x="16" y="11" width="11" height="8" rx="1" fill={fill} />
          <rect x="29" y="11" width="12" height="8" rx="1" fill={fill} />
          <rect x="3" y="21" width="11" height="8" rx="1" fill={fill} />
          <rect x="16" y="21" width="11" height="8" rx="1" fill={fill} />
          <rect x="29" y="21" width="12" height="8" rx="1" fill={fill} />
        </>
      )}
      {layoutId === "split-hero" && (
        <>
          <rect x="3" y="4" width="22" height="24" rx="1" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <rect x="28" y="4" width="13" height="5" rx="1" fill={fill} />
          <rect x="28" y="11" width="13" height="5" rx="1" fill={fill} />
          <rect x="28" y="18" width="13" height="5" rx="1" fill={fill} />
          <rect x="28" y="25" width="13" height="3" rx="1" fill={fill} />
        </>
      )}
      {layoutId === "command-palette" && (
        <>
          <rect x="6" y="8" width="32" height="18" rx="2" fill={fill} stroke={stroke} strokeWidth="0.8" />
          <rect x="9" y="11" width="26" height="3" rx="1" fill="#9EA096" opacity="0.3" />
          <rect x="9" y="16" width="20" height="2" rx="1" fill="#9EA096" opacity="0.3" />
          <rect x="9" y="19" width="24" height="2" rx="1" fill="#9EA096" opacity="0.3" />
          <rect x="9" y="22" width="16" height="2" rx="1" fill="#9EA096" opacity="0.3" />
        </>
      )}
      {layoutId === "masonry-editorial" && (
        <>
          <rect x="3" y="3" width="11" height="14" rx="1" fill={fill} />
          <rect x="16" y="3" width="11" height="9" rx="1" fill={fill} />
          <rect x="29" y="3" width="12" height="17" rx="1" fill={fill} />
          <rect x="3" y="19" width="11" height="10" rx="1" fill={fill} />
          <rect x="16" y="14" width="11" height="15" rx="1" fill={fill} />
          <rect x="29" y="22" width="12" height="7" rx="1" fill={fill} />
        </>
      )}
    </svg>
  );
}
