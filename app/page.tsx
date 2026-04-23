import Link from "next/link";
import { ACCOUNTS, formatMeetingWhen, getNextMeetingAccount } from "@/lib/content/accounts";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";
import { RESOURCES } from "@/lib/content/resources";
import { MODULES } from "@/lib/content/modules";

/*
  Landing page for ArcticBlue's sales team.

  Three primary CTAs (Workbench · Showcase · Library) and a next-meeting
  strip pulled from the pipeline. No product-marketing for Lab buyers on
  this page — this is the sales team's home screen.
*/

export default function HomePage() {
  const next = getNextMeetingAccount();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <section className="bg-navy text-white">
        <div className="grid grid-cols-1 gap-4 px-8 py-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
              ArcticMind
            </div>
            <h1 className="mt-1 text-[28px] font-bold leading-[1.15]">
              Sales workbench for ArcticBlue.
            </h1>
          </div>
          <div className="text-[11px] uppercase tracking-[0.12em] opacity-80">
            Workbench · Showcase · Library
          </div>
        </div>
      </section>

      {next && next.next_meeting && (
        <section className="mt-6">
          <div className="flex flex-col gap-3 border border-ink-border bg-bg-card px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                Next up · {formatMeetingWhen(next.next_meeting.when)}
              </div>
              <div className="mt-1 text-[16px] font-bold text-ink">
                {next.next_meeting.title} — {next.company_name}
              </div>
              <div className="mt-1 text-[12px] text-ink-muted">
                {next.poc_name} ({next.poc_title}) · {next.next_meeting.attendees.length} attendees
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/workbench" className="btn-secondary">
                Pipeline
              </Link>
              <Link href={`/workbench/accounts/${next.id}`} className="btn-primary">
                Open meeting →
              </Link>
            </div>
          </div>
        </section>
      )}

      <h2 className="section-header mt-10 mb-3">Sections</h2>
      <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-2">
        <SurfaceCell
          kicker="Deliverables"
          title="Run ArcticBlue's methods on client work"
          body="Multi-step workflows that produce branded, client-ready deliverables — interview synthesis, meeting recap, pilot scoping — with optional partner co-brand and referral block."
          stat="3 workflows"
          href="/deliverables"
        />
        <SurfaceCell
          kicker="Facilitators"
          title="The global facilitator pool"
          body="External consultants + trainers available for engagements. Filter by focus, experience, region. Pull into proposals or match to a client Lab."
          stat="12 facilitators"
          href="/facilitators"
          last
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-3">
        <SurfaceCell
          kicker="Workbench"
          title="Pipeline + meeting prep"
          body={`${ACCOUNTS.length} accounts. Claude drafts the pre-meeting brief and post-meeting follow-up. Edit notes, log activity, move stages.`}
          stat={`${ACCOUNTS.length} accounts`}
          href="/workbench"
        />
        <SurfaceCell
          kicker="Showcase"
          title="Demos for screen share"
          body="Six demos with present mode: Mirror, Canvas, Analyzer, Practice, case-study deck, Lab explainer."
          stat="6 demos"
          href="/showcase"
        />
        <SurfaceCell
          kicker="Library"
          title="Reference material"
          body={`${PROMPTS.length + TEMPLATES.length + USE_CASES.length + RESOURCES.length + MODULES.length} items. Filter, cite, or compose a proposal.`}
          stat={`${PROMPTS.length + TEMPLATES.length + USE_CASES.length + RESOURCES.length + MODULES.length} items`}
          href="/library"
          last
        />
      </div>

      <h2 className="section-header mt-10 mb-3">Shortcuts</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ShortcutTile href="/deliverables/interview-synthesis" title="Interview synthesis" sub="Branded deliverable" />
        <ShortcutTile href="/facilitators" title="Facilitators" sub="Pool of 12" />
        <ShortcutTile href="/mirror" title="Mirror" sub="Opportunity field" />
        <ShortcutTile href="/showcase/cases" title="Case studies" sub="Click-through deck" />
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
      className={`group block bg-bg-card px-6 py-5 transition hover:bg-ice ${
        last ? "" : "md:border-r md:border-ink-border"
      } border-b border-ink-border md:border-b-0`}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
        {kicker}
      </div>
      <div className="mt-1 text-[16px] font-bold text-ink">{title}</div>
      <p className="mt-2 text-[12px] leading-[1.55] text-ink">{body}</p>
      <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        <span>Open →</span>
        <span className="text-ink-muted">{stat}</span>
      </div>
    </Link>
  );
}

function ShortcutTile({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link
      href={href}
      className="group border border-ink-border bg-white px-4 py-3 transition hover:border-navy"
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">{title}</div>
      <div className="mt-0.5 text-[11px] text-ink">{sub}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
        Open →
      </div>
    </Link>
  );
}
