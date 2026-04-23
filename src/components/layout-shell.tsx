"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { DesktopLayout } from "./desktop-layout";
import { EmbedRouteSync } from "./embed-route-sync";

function LayoutInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("_embed") === "1";

  if (isEmbed) {
    return (
      <div className="bg-[#FDFDF8] dark:bg-[#1E1F23] min-h-screen">
        <EmbedRouteSync />
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
