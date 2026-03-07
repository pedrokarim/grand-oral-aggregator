"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { LogIn, LogOut, User, Settings } from "lucide-react";

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  invisible: "bg-gray-400",
};

export function AuthButton() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  if (isPending) {
    return (
      <div className="w-5 h-5 rounded-full bg-[#3a3b3f] animate-pulse" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn.social({ provider: "discord" })}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] font-medium text-[#9EA096] hover:text-[#FDFDF8] transition-colors cursor-default"
      >
        <LogIn className="w-3 h-3" />
        Connexion
      </button>
    );
  }

  const user = session.user;
  const status = (user as Record<string, unknown>).status as string ?? "online";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-0.5 cursor-default"
      >
        {user.image ? (
          <img
            src={user.image}
            alt=""
            className="w-5 h-5 rounded-full"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#4D4F46] flex items-center justify-center">
            <User className="w-3 h-3 text-[#FDFDF8]" />
          </div>
        )}
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#23251D] ${statusColors[status] ?? statusColors.online}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-[5px] border border-[#BFC1B7] dark:border-[#3a3b3f] bg-[#FDFDF8] dark:bg-[#1E1F23] shadow-xl z-[9999] overflow-hidden">
          <div className="px-3 py-2 border-b border-[#E5E7E0] dark:border-[#2a2b2f]">
            <p className="text-[13px] font-semibold text-[#23251D] dark:text-[#EAECF6] truncate">
              {(user as Record<string, unknown>).displayName as string || user.name}
            </p>
            <p className="text-[12px] text-[#9EA096] truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                // Open settings window via postMessage
                window.postMessage({ type: "open-window", path: "/settings", title: "Paramètres" }, "*");
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] transition-colors cursor-default"
            >
              <Settings className="w-3.5 h-3.5" />
              Paramètres
            </button>
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#4D4F46] dark:text-[#9EA096] hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] transition-colors cursor-default"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
