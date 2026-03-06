"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { DesktopLayout } from "./desktop-layout";

function LayoutInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("_embed") === "1";

  if (isEmbed) {
    // Bare content for iframe windows — no desktop chrome
    return (
      <div className="p-6 bg-[#FDFDF8] dark:bg-[#1E1F23] min-h-screen">
        {children}
      </div>
    );
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DesktopLayout>{children}</DesktopLayout>}>
      <LayoutInner>{children}</LayoutInner>
    </Suspense>
  );
}
