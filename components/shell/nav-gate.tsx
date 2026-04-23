"use client";

import { usePathname } from "next/navigation";

/*
  Routes that opt out of the editorial top nav + footer because they
  render a full-bleed immersive surface (e.g. the Mirror's starfield).
  Keep this list tight — most of the app should live inside the shell.
*/
const FULL_BLEED_PREFIXES = ["/mirror"];

export function useIsFullBleed(): boolean {
  const pathname = usePathname();
  if (!pathname) return false;
  return FULL_BLEED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export function NavGate({ children }: { children: React.ReactNode }) {
  const hide = useIsFullBleed();
  if (hide) return null;
  return <>{children}</>;
}
