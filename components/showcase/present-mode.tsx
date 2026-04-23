"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/*
  Present mode wrapper.

  A showcase surface enters present mode by appending ?present=1 to
  its URL. The wrapper:
  - Hides the app's editorial top nav (via the NavGate mechanism — we
    also list present-mode paths in components/shell/nav-gate.tsx)
  - Renders a subtle floating "Exit present mode" pill
  - Listens for ESC to exit
  - Prevents the browser context menu and resets any hover overlays

  Surfaces decide what to render differently in present mode by reading
  the same ?present=1 query themselves. The wrapper doesn't transform
  children — it's just chrome removal + an escape hatch.
*/

export function PresentModeFrame({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isPresenting = searchParams?.get("present") === "1";
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  useEffect(() => {
    if (!isPresenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(pathname);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresenting, pathname, router]);

  return (
    <div className={isPresenting ? "present-mode" : ""}>
      {children}
      {isPresenting && (
        <Link
          href={pathname}
          className="fixed bottom-4 right-4 z-[100] border border-white/40 bg-navy/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white hover:bg-navy"
          title="Exit present mode (Esc)"
        >
          Exit · Esc
        </Link>
      )}
    </div>
  );
}

export function isPresentMode(searchParams: URLSearchParams | null | undefined): boolean {
  return searchParams?.get("present") === "1";
}
