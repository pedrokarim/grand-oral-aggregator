"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Runs inside iframe (_embed=1) pages. When the route changes within
 * the iframe, notifies the parent desktop to update the window's
 * title and path.
 */
export function EmbedRouteSync() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Skip the initial render — the parent already knows the first path
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    // Notify parent to update the window that contains this iframe
    window.parent.postMessage(
      { type: "update-window-route", path: pathname },
      "*"
    );
  }, [pathname]);

  return null;
}
