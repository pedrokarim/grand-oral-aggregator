"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { DesktopLayout } from "./desktop-layout";
import { SiteLayout } from "./site-layout";
import { MobileLayout } from "./mobile-layout";
import { EmbedRouteSync } from "./embed-route-sync";
import { useSiteMode } from "@/hooks/use-site-mode";
import { useIsMobile } from "@/hooks/use-mobile";

function LayoutInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("_embed") === "1";
  const [mode, , hydrated] = useSiteMode();
  const isMobile = useIsMobile();

  if (isEmbed) {
    return (
      <div className="bg-[#FDFDF8] dark:bg-[#1E1F23] min-h-screen">
        <EmbedRouteSync />
        {children}
      </div>
    );
  }

  if (!hydrated) {
    return (
      <>
        <MobileLayout>{children}</MobileLayout>
        <div className="hidden md:block">
          <DesktopLayout>{children}</DesktopLayout>
        </div>
      </>
    );
  }

  if (hydrated && isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // Before hydration, render desktop layout (server default) to avoid
  // layout flashes; after hydration, honor the user's chosen mode.
  if (mode === "site") {
    return <SiteLayout>{children}</SiteLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <>
          <MobileLayout>{children}</MobileLayout>
          <div className="hidden md:block">
            <DesktopLayout>{children}</DesktopLayout>
          </div>
        </>
      }
    >
      <LayoutInner>{children}</LayoutInner>
    </Suspense>
  );
}
