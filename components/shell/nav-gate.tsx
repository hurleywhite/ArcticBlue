"use client";

import { usePathname, useSearchParams } from "next/navigation";

/*
  Routes that opt out of the editorial top nav + footer because they
  render a full-bleed immersive surface.

  Two triggers:
  - Path prefix match (e.g. /mirror is always full-bleed)
  - present=1 query param on any /showcase route (explicit "go present"
    toggle the sales team hits from the gallery)
*/
const FULL_BLEED_PREFIXES = ["/mirror"];

export function useIsFullBleed(): boolean {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (!pathname) return false;
  if (FULL_BLEED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))) {
    return true;
  }
  if (pathname.startsWith("/showcase/") && searchParams?.get("present") === "1") {
    return true;
  }
  return false;
}

export function NavGate({ children }: { children: React.ReactNode }) {
  const hide = useIsFullBleed();
  if (hide) return null;
  return <>{children}</>;
}
