import Link from "next/link";

/*
  Top nav — sales-team framing.

  Three primary surfaces plus admin. Workbench is the daily home:
  pipeline, meeting prep, drafting. Showcase is the in-meeting demo
  surface (present mode lives here). Library is the reference shelf
  the team cites into proposals.
*/

const PRIMARY: Array<{ label: string; href: string }> = [
  { label: "Workbench", href: "/workbench" },
  { label: "Showcase", href: "/showcase" },
  { label: "Library", href: "/library" },
];

const SECONDARY: Array<{ label: string; href: string }> = [
  { label: "Admin", href: "/admin" },
];

export function TopNav() {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-[15px] font-bold tracking-[0.04em]">ArcticMind</span>
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">Sales workbench</span>
        </Link>
        <nav className="flex items-center gap-1">
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-white/20" />
          {SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] opacity-80 transition hover:bg-white/10 hover:opacity-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
