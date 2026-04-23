import Link from "next/link";

/*
  Top nav: navy header band with white type.
  The ArcticBrief doc opens with a navy 2-column table header band —
  we use the same pattern: wordmark left, nav right, single navy row.
*/

const NAV_ITEMS: Array<{ label: string; href: string; comingSoon?: boolean }> = [
  { label: "Canvas", href: "/canvas" },
  { label: "Learning", href: "/learning" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Tools", href: "/tools" },
  { label: "News", href: "/news", comingSoon: true },
];

export function TopNav() {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-[15px] font-bold tracking-[0.04em]">
            ArcticMind
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">
            by ArcticBlue
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition hover:bg-white/10"
            >
              {item.label}
              {item.comingSoon && (
                <span className="ml-1 text-[9px] font-normal opacity-60">
                  · soon
                </span>
              )}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-white/20" />
          <Link
            href="/sign-in"
            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-white/10"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
