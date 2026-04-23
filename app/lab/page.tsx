import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import {
  formatMonth,
  getCurrentLab,
  getNextScheduledLab,
  getPastLabs,
} from "@/lib/content/labs";
import { LabCurrent } from "./lab-current";

export const metadata = { title: "Practical Labs · ArcticMind" };

export default function LabHubPage() {
  const current = getCurrentLab();
  const past = getPastLabs();
  const next = getNextScheduledLab();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Practical Labs"
        title="The monthly rhythm. This is the product."
        right={
          current?.meeting_url ? (
            <a href={current.meeting_url} className="btn-secondary inline-block bg-white">
              Join session →
            </a>
          ) : null
        }
      />

      {current && (
        <section className="mt-6">
          <h2 className="section-header mb-3">This month — {formatMonth(current.month)}</h2>
          <LabCurrent lab={current} />
        </section>
      )}

      {next && (
        <section className="mt-10">
          <h2 className="section-header mb-3">Next month</h2>
          <Link
            href={`/lab/${next.month.slice(0, 7)}`}
            className="block border border-ink-border bg-bg-card px-5 py-4 transition hover:border-navy hover:bg-ice"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
              {formatMonth(next.month)} · {next.facilitator_name}
            </div>
            <div className="mt-1 text-[16px] font-bold">{next.title}</div>
            <p className="mt-1 text-[12px] text-ink-muted">{next.challenge_brief.slice(0, 200)}…</p>
          </Link>
        </section>
      )}

      <section className="mt-10">
        <h2 className="section-header mb-3">The snowball · past sessions</h2>
        <p className="mb-4 text-[12px] text-ink-muted">
          Each session builds on the one before it. Shared vocabulary, a habit of
          experimenting, the confidence to figure things out on your own.
        </p>
        <div className="border border-ink-border">
          {past.map((lab, idx) => (
            <Link
              key={lab.id}
              href={`/lab/${lab.month.slice(0, 7)}`}
              className={`grid grid-cols-[110px_1fr_auto] items-start transition hover:bg-ice ${
                idx === past.length - 1 ? "" : "border-b border-ink-border"
              }`}
            >
              <div className="bg-navy px-4 py-5 text-center text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
                  {new Date(lab.month).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}
                </div>
                <div className="text-[22px] font-bold leading-none">
                  {new Date(lab.month).toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC" })}
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  {lab.facilitator_name}
                  {lab.attendance && (
                    <> · {lab.attendance.attended} of {lab.attendance.invited} attended</>
                  )}
                </div>
                <div className="mt-0.5 text-[14px] font-bold text-navy">{lab.title}</div>
                <p className="mt-1 text-[13px] leading-[1.55]">{lab.challenge_brief.slice(0, 260)}…</p>
                {lab.artifacts.length > 0 && (
                  <div className="mt-2 text-[11px] text-ink-muted">
                    {lab.artifacts.length} team artifact{lab.artifacts.length === 1 ? "" : "s"} shared
                  </div>
                )}
              </div>
              <div className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
                Open →
              </div>
            </Link>
          ))}
          {past.length === 0 && (
            <div className="px-5 py-6 text-center italic text-ink-muted">
              No past sessions yet. The snowball starts with your first Lab.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10 callout">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
          Between sessions
        </div>
        <p className="mt-1">
          Pre-work modules live in the <Link className="underline" href="/learning">Learning Hub</Link>.
          Try the prompts and templates from the session in <Link className="underline" href="/tools">Tools</Link>.
          Need context on a specific company or opportunity for your Lab? Use the{" "}
          <Link className="underline" href="/analyzer">Company Analyzer</Link> or the{" "}
          <Link className="underline" href="/canvas">Opportunity Canvas</Link>.
        </p>
      </section>
    </div>
  );
}
