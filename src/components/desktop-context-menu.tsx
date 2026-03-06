"use client";

import { type ReactNode } from "react";
import { ContextMenu } from "radix-ui";
import Link from "next/link";

interface DesktopContextMenuProps {
  children: ReactNode;
  onResetIcons: () => void;
}

export function DesktopContextMenu({ children, onResetIcons }: DesktopContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[180px] bg-[#FDFDF8] dark:bg-[#1E1F23] rounded-lg border border-[#BFC1B7] dark:border-[#3a3b3f] shadow-xl py-1 z-[9999] select-none"
        >
          <ContextMenu.Item asChild>
            <Link
              href="/"
              className="flex items-center px-3 py-1.5 text-[13px] text-[#23251D] dark:text-[#EAECF6] hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] outline-none cursor-default rounded-sm mx-1"
            >
              A propos du Grand Oral
            </Link>
          </ContextMenu.Item>

          <ContextMenu.Item asChild>
            <Link
              href="/settings"
              className="flex items-center px-3 py-1.5 text-[13px] text-[#23251D] dark:text-[#EAECF6] hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] outline-none cursor-default rounded-sm mx-1"
            >
              Paramètres
            </Link>
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-[#D2D3CC] dark:bg-[#3a3b3f] my-1" />

          <ContextMenu.Item
            className="flex items-center px-3 py-1.5 text-[13px] text-[#23251D] dark:text-[#EAECF6] hover:bg-[#E5E7E0] dark:hover:bg-[#2a2b2f] outline-none cursor-default rounded-sm mx-1"
            onSelect={onResetIcons}
          >
            Réinitialiser les icônes
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
