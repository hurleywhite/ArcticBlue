import Link from "next/link";
import { MODULES } from "@/lib/content/modules";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";
import { COLLECTIONS } from "@/lib/content/collections";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

/*
  Landing page. Editorial one-pager treatment that doubles as a home
  dashboard: navy title band, ice-blue callout, four product surfaces
  (Canvas, Learning, Use Cases, Tools) presented as a workflow, a
  library index, and a direct CTA into the Canvas.

  This is the product itself — not a marketing page. No pricing, no
  engagement tiers. Those belong on arcticblue.ai.
*/

export default function HomePage() {
  const canvasCount = Object.keys(DEMO_DATA).length;

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
            Canvas · Learning · Use Cases · Tools
          </div>
        </div>
      </section>

      {/* Callout */}
      <section className="callout mt-6">
        <p>
          Four integrated surfaces, one spine. Start with the Canvas — map where
          AI moves the needle for your role — then the rest of the platform
          personalizes: learning modules, case studies, practice prompts, and
          templates all tailored to what you starred.
        </p>
      </section>

      {/* Primary CTA — directly into the product */}
      <section className="mt-6 flex flex-col items-start justify-between gap-4 border border-ink-border bg-bg-card px-6 py-5 md:flex-row md:items-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
            Start here
          </div>
          <div className="mt-1 text-[16px] font-bold">
            Build your Opportunity Canvas in under three minutes.
          </div>
          <div className="mt-1 text-[12px] text-ink-muted">
            Eight role- and industry-specific opportunities, three strategic
            lenses. Star what matters. Everything downstream personalizes.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-secondary">
            Your dashboard
          </Link>
          <Link href="/canvas" className="btn-primary">
            Open the Canvas →
          </Link>
        </div>
      </section>

      {/* What the platform does — workflow, not marketing */}
      <h2 className="section-header mt-10 mb-3">The platform</h2>
      <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-4">
        <SurfaceCell
          kicker="01 · Canvas"
          title="Map the opportunity"
          body="Pick a role and industry. ArcticMind plots eight specific opportunities across three strategic lenses."
          stat={`${canvasCount} templates`}
          href="/canvas"
        />
        <SurfaceCell
          kicker="02 · Learning"
          title="Build the skills"
          body="A curated library of reading, video, exercises, and workshops — filtered to what you starred."
          stat={`${MODULES.length} modules · ${COLLECTIONS.length} collections`}
          href="/learning"
        />
        <SurfaceCell
          kicker="03 · Use Cases"
          title="See it done before"
          body="Anonymized proof points from ArcticBlue engagements — story, one-pager, slides."
          stat={`${USE_CASES.length} cases`}
          href="/use-cases"
        />
        <SurfaceCell
          kicker="04 · Tools"
          title="Practice before you ship"
          body="Seeded chat sandbox, curated prompts, structured templates. Text only; every session has context."
          stat={`${PROMPTS.length} prompts · ${TEMPLATES.length} templates`}
          href="/tools"
          last
        />
      </div>

      {/* How the spine works — numbered rows */}
      <h2 className="section-header mt-10 mb-3">How it works</h2>
      <div className="border border-ink-border">
        <HowRow
          n="01"
          title="Start on the Canvas"
          body="Pick your role and industry. In under three minutes you'll have a working map of opportunities calibrated to the work you actually do."
        />
        <HowRow
          n="02"
          title="Star what matters"
          body="Your stars become the spine. Every other surface — Learning, Use Cases, Tools — personalizes around them."
        />
        <HowRow
          n="03"
          title="Learn against your stars"
          body="Shortest path to being good at your specific opportunity. No maze of generic AI courses."
        />
        <HowRow
          n="04"
          title="Practice in a sandbox"
          body="Try AI on a bounded version of the real work before using it on a real deliverable."
          last
        />
      </div>

      {/* Direct entry points to each surface */}
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/canvas"
          className="border border-ink-border bg-white px-6 py-5 transition hover:border-navy"
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
            Begin → Canvas
          </div>
          <div className="mt-1 text-[16px] font-bold text-ink">
            Generate your Opportunity Canvas
          </div>
          <p className="mt-1 text-[12px] text-ink-muted">
            A 2×2 grid of opportunities, three lenses. Stars drive personalization.
          </p>
        </Link>
        <Link
          href="/dashboard"
          className="border border-ink-border bg-white px-6 py-5 transition hover:border-navy"
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
            Returning → Dashboard
          </div>
          <div className="mt-1 text-[16px] font-bold text-ink">
            Pick up where you left off
          </div>
          <p className="mt-1 text-[12px] text-ink-muted">
            Recommended content, in-progress learning, recent practice sessions.
          </p>
        </Link>
      </div>
    </div>
  );
}

function SurfaceCell({
  kicker,
  title,
  body,
  stat,
  href,
  last,
}: {
  kicker: string;
  title: string;
  body: string;
  stat: string;
  href: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block bg-bg-card px-5 py-4 transition hover:bg-ice ${
        last ? "" : "md:border-r md:border-ink-border"
      } border-b border-ink-border md:border-b-0`}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
        {kicker}
      </div>
      <div className="mt-1 text-[14px] font-bold text-ink">{title}</div>
      <p className="mt-2 text-[12px] leading-[1.55] text-ink">{body}</p>
      <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        <span>Open →</span>
        <span className="text-ink-muted">{stat}</span>
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
