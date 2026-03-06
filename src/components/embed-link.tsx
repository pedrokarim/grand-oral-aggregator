"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useCallback } from "react";

/**
 * A Link that, when inside an iframe (_embed=1), tells the parent
 * desktop to open a new window instead of navigating in-place.
 */
export function EmbedLink({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("_embed") === "1";

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isEmbed && href.startsWith("/")) {
        e.preventDefault();
        window.parent.postMessage({ type: "open-window", path: href }, "*");
      }
    },
    [isEmbed, href],
  );

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
