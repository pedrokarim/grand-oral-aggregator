"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { DesktopLayout } from "./desktop-layout";
import { SiteLayout } from "./site-layout";
import { EmbedRouteSync } from "./embed-route-sync";
import { useSiteMode } from "@/hooks/use-site-mode";

function LayoutInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("_embed") === "1";
  const [mode, , hydrated] = useSiteMode();

  if (isEmbed) {
    return (
      <div className="bg-[#FDFDF8] dark:bg-[#1E1F23] min-h-screen">
        <EmbedRouteSync />
        {children}
      </div>
    );
  }

  // Before hydration, render desktop layout (server default) to avoid
  // layout flashes; after hydration, honor the user's chosen mode.
  if (hydrated && mode === "site") {
    return <SiteLayout>{children}</SiteLayout>;
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
