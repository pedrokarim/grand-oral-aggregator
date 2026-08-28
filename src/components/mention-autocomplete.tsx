"use client";

import { useEffect, useMemo, useState, useRef } from "react";

interface MentionUser {
  id: string;
  name: string;
  displayName: string | null;
  image: string | null;
}

interface MentionAutocompleteProps {
  fetchUrl: string;
  query: string; // text after "@"
  visible: boolean;
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function MentionAutocomplete({
  fetchUrl,
  query,
  visible,
  onSelect,
  onClose,
}: MentionAutocompleteProps) {
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [selection, setSelection] = useState({ query: "", index: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    fetch(fetchUrl)
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setUsers([]));
  }, [fetchUrl, visible]);

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const name = (user.displayName || user.name).toLowerCase();
        return name.includes(query.toLowerCase());
      }),
    [query, users],
  );
  const selectedIndex = selection.query === query ? selection.index : 0;

  useEffect(() => {
    if (!visible) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelection({
          query,
          index: Math.min(selectedIndex + 1, filtered.length - 1),
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelection({ query, index: Math.max(selectedIndex - 1, 0) });
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filtered[selectedIndex]) onSelect(filtered[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, filtered, query, selectedIndex, onSelect, onClose]);

  if (!visible || filtered.length === 0) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-1 w-56 max-h-48 overflow-y-auto rounded-[5px] border border-[#BFC1B7] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] shadow-xl z-[9999]"
    >
      {filtered.slice(0, 10).map((user, i) => (
        <button
          key={user.id}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(user);
          }}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-left cursor-default transition-colors
            ${i === selectedIndex ? "bg-[#E5E7E0] dark:bg-[#2a2b2f]" : "hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]/50"}`}
        >
          {user.image ? (
            <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#4D4F46]" />
          )}
          <span className="text-[13px] text-[#23251D] dark:text-[#EAECF6] truncate">
            {user.displayName || user.name}
          </span>
        </button>
      ))}
    </div>
  );
}

export type { MentionUser };
