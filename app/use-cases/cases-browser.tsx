"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { UseCase } from "@/lib/content/types";

/*
  Case studies with live filtering. A big featured hero at the top,
  filterable grid of the rest below. Filters are chips for industry
  and opportunity category — same tag vocabulary the rest of the app
  uses.

  Keeps the editorial design (navy + ice, Arial, hairlines) but leans
  on hero metric numbers and short narrative pulls to feel more like
  a portfolio than a spreadsheet.
*/

export function CasesBrowser({ hero, rest }: { hero: UseCase; rest: UseCase[] }) {
  const [industry, setIndustry] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const industries = useMemo(() => {
    const s = new Set<string>();
    [hero, ...rest].forEach((c) => (c.tags.industries ?? []).forEach((i) => s.add(i)));
    return Array.from(s).sort();
  }, [hero, rest]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    [hero, ...rest].forEach((c) => (c.tags.categories ?? []).forEach((i) => s.add(i)));
    return Array.from(s).sort();
  }, [hero, rest]);

  const filtered = useMemo(() => {
    return [hero, ...rest].filter((c) => {
      if (industry && !(c.tags.industries ?? []).includes(industry)) return false;
      if (category && !(c.tags.categories ?? []).includes(category)) return false;
      return true;
    });
  }, [hero, rest, industry, category]);

  const isFiltering = !!(industry || category);

  return (
    <>
      {/* Hero featured case — only shown when nothing's filtered */}
      {!isFiltering && <CaseHero c={hero} />}

      {/* Filter chips */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border border-ink-border bg-bg-card px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Industry
        </span>
        {industries.map((i) => (
          <Chip key={i} active={industry === i} onClick={() => setIndustry(industry === i ? null : i)}>
            {i}
          </Chip>
        ))}
        <span className="mx-2 h-4 w-px bg-ink-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Category
        </span>
        {categories.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
            {c}
          </Chip>
        ))}
        {isFiltering && (
          <button
            onClick={() => {
              setIndustry(null);
              setCategory(null);
            }}
            className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid of cases */}
      <h2 className="section-header mt-10 mb-3">
        {isFiltering ? `${filtered.length} case${filtered.length === 1 ? "" : "s"}` : "The full library"}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(isFiltering ? filtered : rest).map((c) => (
          <CaseCard key={c.id} c={c} />
        ))}
        {isFiltering && filtered.length === 0 && (
          <div className="col-span-full border border-ink-border bg-bg-card px-5 py-8 text-center italic text-ink-muted">
            No cases match those filters.
          </div>
        )}
      </div>
    </>
  );
}

function CaseHero({ c }: { c: UseCase }) {
  const firstOutcomePara =
    c.outcome_markdown
      .split(/\n\n/)
      .map((s) => s.trim())
      .find((s) => s && !s.startsWith("#")) ?? "";
  return (
    <Link
      href={`/use-cases/${c.slug}`}
      className="group mt-8 grid grid-cols-1 gap-0 border border-ink-border transition hover:border-navy md:grid-cols-[360px_1fr]"
    >
      <div className="flex flex-col justify-between bg-navy p-7 text-white" style={{ minHeight: 280 }}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
            Featured case
          </div>
          <div className="mt-1 text-[13px] uppercase tracking-[0.12em] opacity-80">
            {c.anonymized_client_label}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(c.tags.industries ?? []).map((i) => (
              <span
                key={i}
                className="border border-white/30 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
            Headline metric
          </div>
          <div className="mt-1 text-[38px] font-bold leading-[1.02]">{c.headline_metric}</div>
        </div>
      </div>
      <div className="bg-white px-7 py-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Use case
        </div>
        <h2 className="mt-1 text-[22px] font-bold leading-[1.2] text-navy">{c.title}</h2>
        <p className="mt-3 text-[14px] leading-[1.6] text-ink">{c.summary}</p>
        <div className="callout mt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            What happened
          </div>
          <p className="mt-1 text-[13px] leading-[1.55]">
            {firstOutcomePara.replace(/^\*\*|\*\*$/g, "").slice(0, 260)}
            {firstOutcomePara.length > 260 ? "…" : ""}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink-border pt-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            {c.one_pager_available ? "Story · PDF" : "Story"}
            {c.slides_available ? " · Slides" : ""}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
            Read case →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CaseCard({ c }: { c: UseCase }) {
  return (
    <Link
      href={`/use-cases/${c.slug}`}
      className="group flex flex-col border border-ink-border bg-white transition hover:border-navy"
    >
      <div className="flex items-start justify-between bg-navy px-4 py-3 text-white">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
            {c.anonymized_client_label}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] opacity-65">
            {(c.tags.industries ?? [])[0]}
          </div>
        </div>
        <span className="border border-white/30 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]">
          Case
        </span>
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="border-b border-ink-border pb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Headline metric
          </div>
          <div className="mt-1 text-[22px] font-bold leading-[1.1] text-navy">
            {c.headline_metric}
          </div>
        </div>
        <div className="text-[13px] font-bold leading-[1.3] text-navy">{c.title}</div>
        <p className="text-[12px] leading-[1.5] text-ink-muted">{c.summary.slice(0, 160)}…</p>
        <div className="flex flex-wrap gap-1">
          {(c.tags.categories ?? []).map((t) => (
            <span
              key={t}
              className="border border-ice bg-ice px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-navy"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-ink-border bg-bg-card px-4 py-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          {c.one_pager_available ? "Story · PDF" : "Story"}
          {c.slides_available ? " · Slides" : ""}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
          Read →
        </span>
      </div>
    </Link>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "border border-navy bg-navy px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
          : "border border-ink-border bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
      }
    >
      {children}
    </button>
  );
}
