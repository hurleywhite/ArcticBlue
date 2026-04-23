import Link from "next/link";

/*
  Top nav. Primary trio — Dashboard · Lab · Learning — is what the
  Practical Labs buyer is here for: this month's session, the archive,
  and the between-session homework. Everything else (Canvas, Analyzer,
  Tools, Use Cases, Resources) is support material and lives behind a
  single "Between sessions" link that goes to an index page.

  A hairline separator between primary and secondary groups makes the
  hierarchy visible without a dropdown.
*/

const PRIMARY: Array<{ label: string; href: string }> = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Lab", href: "/lab" },
  { label: "Learning", href: "/learning" },
];

const SECONDARY: Array<{ label: string; href: string; comingSoon?: boolean }> = [
  { label: "Between sessions", href: "/between-sessions" },
  { label: "News", href: "/news", comingSoon: true },
  { label: "Admin", href: "/admin" },
];

export function TopNav() {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-[15px] font-bold tracking-[0.04em]">ArcticMind</span>
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">by ArcticBlue</span>
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
              className="group relative px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] opacity-80 transition hover:bg-white/10 hover:opacity-100"
            >
              {item.label}
              {item.comingSoon && (
                <span className="ml-1 text-[9px] font-normal opacity-70">· soon</span>
              )}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-white/20" />
          <Link
            href="/sign-in"
            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] opacity-80 hover:bg-white/10 hover:opacity-100"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
