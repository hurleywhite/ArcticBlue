"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/*
  Top nav — ink-deep band, sticky, glass blur.
  Active item carries a frost underline that slides between items
  (Linear-style physics). Hover lifts show a thin paper underline.
*/

const PRIMARY: Array<{ label: string; href: string }> = [
  { label: "Workbench", href: "/workbench" },
  { label: "Deliverables", href: "/deliverables" },
  { label: "Showcase", href: "/showcase" },
  { label: "Facilitators", href: "/facilitators" },
  { label: "Library", href: "/library" },
];

const SECONDARY: Array<{ label: string; href: string }> = [
  { label: "Admin", href: "/admin" },
];

export function TopNav() {
  const pathname = usePathname() ?? "/";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-xl"
      style={{
        background: "rgba(6, 15, 34, 0.72)",
        borderBottomColor: "var(--fg-16)",
      }}
    >
      <div className="shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="flex items-center gap-2">
            <LogoMark />
            <span className="serif-tight text-[20px] leading-none text-[color:var(--fg-100)]">
              ArcticMind
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {PRIMARY.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
          <span
            className="mx-2 h-4 w-px"
            style={{ background: "var(--fg-16)" }}
          />
          {SECONDARY.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActive(item.href)}
              muted
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavItem({
  href,
  label,
  active,
  muted,
}: {
  href: string;
  label: string;
  active: boolean;
  muted?: boolean;
}) {
  return (
    <Link href={href} className="group relative block">
      <span
        className="block px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-200"
        style={{
          color: active
            ? "var(--fg-100)"
            : muted
              ? "var(--fg-52)"
              : "var(--fg-72)",
          transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      >
        {label}
      </span>
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute bottom-0 left-2 right-2 h-[1px]"
          style={{ background: "var(--frost)" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        />
      )}
    </Link>
  );
}

function LogoMark() {
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--frost) 0%, transparent 72%)",
          opacity: 0.4,
        }}
      />
      <span
        className="relative h-2 w-2 rounded-full"
        style={{ background: "var(--frost)" }}
      />
      <span
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: "var(--fg-32)" }}
      />
    </span>
  );
}
