import Link from "next/link";

/*
  Home page — editorial one-pager treatment.
  Mirrors the ArcticBrief layout: navy header band (from TopNav), big
  headline in Arial, callout in ice blue, "what we do" 3-column table,
  "how it works" numbered rows, tier table.
*/

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {/* Title band */}
      <section className="bg-navy text-white">
        <div className="grid grid-cols-1 gap-4 px-8 py-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
              ArcticMind
            </div>
            <h1 className="mt-1 text-[28px] font-bold leading-[1.15]">
              Continuous AI enablement for enterprise teams.
            </h1>
          </div>
          <div className="text-[11px] uppercase tracking-[0.12em] opacity-80">
            Strategy · Testing · Implementation
          </div>
        </div>
      </section>

      {/* Callout */}
      <section className="callout mt-6">
        <p className="text-[14px]">
          Most enterprises have bought AI. Very few have adopted it. ArcticBlue
          trains the pilots — the executives and leaders setting strategy.
          ArcticMind trains the crew — the workforce who has to actually use it.
        </p>
      </section>

      {/* What we do — 3 columns */}
      <h2 className="section-header mt-10 mb-3">What ArcticMind does</h2>
      <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-3">
        <WhatCell
          kicker="01 · Canvas"
          title="Map the opportunity"
          body="An interactive, role- and industry-specific canvas of where AI actually moves the needle — eight opportunities per canvas, three lenses to re-frame priority, a starred shortlist you can turn into a roadmap."
          href="/canvas"
        />
        <WhatCell
          kicker="02 · Learning"
          title="Build the skills"
          body="A curated library of modules — video, reading, exercises, workshops — maintained by ArcticBlue facilitators and matched to the opportunities you starred on the Canvas."
          href="/learning"
        />
        <WhatCell
          kicker="03 · Use Cases + Tools"
          title="Practice before you ship"
          body="Anonymized case studies from ArcticBlue's real engagements, a reusable prompt library, and a seeded chat sandbox — so learners try the work before doing it on real deliverables."
          href="/tools"
        />
      </div>

      {/* How it works — numbered rows */}
      <h2 className="section-header mt-12 mb-3">How it works</h2>
      <div className="border border-ink-border">
        <HowRow
          n="01"
          title="Diagnose the gap — by role and industry"
          body="Pick a role and an industry. ArcticMind plots eight specific opportunities across three strategic lenses. This is the entry point and the spine of the product."
        />
        <HowRow
          n="02"
          title="Star what matters"
          body="Save the opportunities worth pursuing. Your stars drive everything else — modules, case studies, and prompts the product surfaces from here on."
        />
        <HowRow
          n="03"
          title="Learn against the stars"
          body="The Learning Hub filters to exactly the modules relevant to what you starred. No maze of generic AI courses — the shortest path to being good at your specific opportunity."
        />
        <HowRow
          n="04"
          title="Practice in a sandbox"
          body="Tools seeds a practice session with your Canvas context — so you try AI on a real version of the work before trusting it on a real deliverable."
          last
        />
      </div>

      {/* Tiers — a simple 3-column reference to ArcticBlue's engagement ladder */}
      <h2 className="section-header mt-12 mb-3">Engagement context</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "15%" }}>Tier</th>
            <th>Description</th>
            <th style={{ width: "18%" }}>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>T1</strong> · Executive AI Mindset
            </td>
            <td>Half-day executive workshop — set the strategic frame and expectations for AI in the business.</td>
            <td>$10K</td>
          </tr>
          <tr>
            <td>
              <strong>T2</strong> · Functional Manager Deep Dive
            </td>
            <td>Tool inventory, AI-readiness diagnosis, and three workshops over six months for functional leaders.</td>
            <td>$10K</td>
          </tr>
          <tr>
            <td>
              <strong>AM</strong> · AI Practical Labs
            </td>
            <td>Monthly 90-minute live sessions for up to 20 — new challenge, current tools, real work.</td>
            <td>$30K / mo</td>
          </tr>
          <tr>
            <td>
              <strong>T3</strong> · Continuous AI Enablement
            </td>
            <td>Living platform that monitors tools, teaches usage, and generates org-wide content. Two-year minimum.</td>
            <td>$10K / yr</td>
          </tr>
          <tr>
            <td>
              <strong>T4</strong> · AI Agent Hub
            </td>
            <td>A software hub and management layer for your org's AI agents — built to your stack.</td>
            <td>Custom</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-12 flex items-center justify-between border-t border-ink-border pt-6">
        <div className="text-[12px] text-ink-muted">
          Ready to see where AI moves the needle for your role?
        </div>
        <Link href="/canvas" className="btn-primary inline-block">
          Open the Canvas →
        </Link>
      </div>
    </div>
  );
}

function WhatCell({
  kicker,
  title,
  body,
  href,
}: {
  kicker: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block border-ink-border bg-bg-card px-6 py-5 transition hover:bg-ice md:border-r md:last:border-r-0"
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
        {kicker}
      </div>
      <div className="mt-1 text-[14px] font-bold text-ink">{title}</div>
      <p className="mt-2 text-[13px] leading-[1.55] text-ink">{body}</p>
      <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
        Open →
      </div>
    </Link>
  );
}

function HowRow({
  n,
  title,
  body,
  last,
}: {
  n: string;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[72px_1fr] items-start ${
        last ? "" : "border-b border-ink-border"
      }`}
    >
      <div className="bg-navy px-4 py-4 text-center text-[18px] font-bold text-white">
        {n}
      </div>
      <div className="px-5 py-4">
        <div className="text-[14px] font-bold text-navy">{title}</div>
        <p className="mt-1 text-[13px] leading-[1.55] text-ink">{body}</p>
      </div>
    </div>
  );
}
