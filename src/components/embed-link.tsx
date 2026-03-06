"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode } from "react";

/**
 * A Link that, when inside an iframe (_embed=1), navigates in-place
 * within the iframe (preserving _embed=1) so that the desktop layout
 * is not duplicated inside the window.
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

  // In embed mode, rewrite internal hrefs to include _embed=1
  const finalHref =
    isEmbed && href.startsWith("/")
      ? `${href}${href.includes("?") ? "&" : "?"}_embed=1`
      : href;

  return (
    <Link href={finalHref} className={className} {...props}>
      {children}
    </Link>
  );
}
