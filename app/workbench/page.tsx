import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import {
  ACCOUNTS,
  STAGE_LABEL,
  STAGE_ORDER,
  formatMeetingWhen,
  getNextMeetingAccount,
} from "@/lib/content/accounts";

export const metadata = { title: "Workbench · ArcticMind" };

/*
  Workbench — the sales team's daily home.

  Hero card is the next meeting. Below it, the pipeline as a grouped
  board by stage. Each pipeline item opens a per-account page with
  the live prep flow, draft follow-up, and case-cite shortlist.
*/

export default function WorkbenchPage() {
  const nextMeeting = getNextMeetingAccount();
  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    accounts: ACCOUNTS.filter((a) => a.stage === stage),
  })).filter((g) => g.accounts.length > 0);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Workbench"
        title="Your next meeting, drafted in real time."
        right={
          <Link href="/workbench/accounts/new" className="btn-secondary inline-block bg-white">
            + New account
          </Link>
        }
      />

      {nextMeeting && nextMeeting.next_meeting && (
        <section className="mt-6">
          <div className="border border-navy">
            <div className="flex flex-col gap-3 bg-navy px-6 py-4 text-white md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
                  Next meeting · {formatMeetingWhen(nextMeeting.next_meeting.when)}
                </div>
                <div className="mt-0.5 text-[18px] font-bold leading-[1.15]">
                  {nextMeeting.next_meeting.title}
                </div>
                <div className="mt-0.5 text-[12px] opacity-80">
                  {nextMeeting.company_name} · {nextMeeting.poc_name} ({nextMeeting.poc_title})
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-white/40 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
                  {STAGE_LABEL[nextMeeting.stage]}
                </span>
                <Link
                  href={`/workbench/accounts/${nextMeeting.id}`}
                  className="border border-white bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:bg-ice"
                >
                  Prep this meeting →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-0 bg-white md:grid-cols-[1fr_240px]">
              <div className="border-b border-ink-border px-6 py-5 md:border-b-0 md:border-r">
                <h3 className="section-header mb-2">Our read</h3>
                <p className="text-[13px] leading-[1.6]">{nextMeeting.notes}</p>
              </div>
              <div className="px-5 py-4">
                <h3 className="section-header mb-2">Attendees</h3>
                <ul className="m-0 list-none space-y-1 p-0 text-[12px]">
                  {nextMeeting.next_meeting.attendees.map((a) => (
                    <li key={a} className="border-b border-ink-border pb-1 last:border-b-0">
                      {a}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                  {nextMeeting.next_meeting.location} · {nextMeeting.next_meeting.duration_minutes} min
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="section-header mb-0">Pipeline · {ACCOUNTS.length} accounts</h2>
          <div className="text-[11px] text-ink-muted">Seeded data — wire to your CRM when ready.</div>
        </div>

        <div className="mt-4 space-y-6">
          {byStage.map(({ stage, accounts }) => (
            <div key={stage}>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
                {STAGE_LABEL[stage]} · {accounts.length}
              </div>
              <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((a, idx) => {
                  const totalCols = typeof window === "undefined" ? 3 : 3;
                  const lastInRow = (idx + 1) % totalCols === 0;
                  const lastItem = idx === accounts.length - 1;
                  return (
                    <Link
                      key={a.id}
                      href={`/workbench/accounts/${a.id}`}
                      className={`group block bg-white transition hover:bg-bg-card ${
                        lastInRow || lastItem ? "" : "md:border-r md:border-ink-border"
                      } border-b border-ink-border lg:border-b-0`}
                    >
                      <div className="px-5 py-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                          {a.company_name}
                        </div>
                        <div className="mt-0.5 text-[10px] text-ink-muted">{a.industry}</div>
                        <div className="mt-3 text-[13px] font-bold text-navy">
                          {a.poc_name}
                        </div>
                        <div className="text-[11px] text-ink-muted">{a.poc_title}</div>
                        {a.next_meeting && (
                          <div className="mt-3 border-t border-ink-border pt-2">
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                              {formatMeetingWhen(a.next_meeting.when)}
                            </div>
                            <div className="mt-0.5 text-[11px] text-ink">
                              {a.next_meeting.title}
                            </div>
                          </div>
                        )}
                        <div className="mt-3 flex items-center justify-between border-t border-ink-border pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                            Updated {relativeTime(a.updated_at)}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
                            Open →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diffHours = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
  const days = Math.round(diffHours / 24);
  return `${days}d ago`;
}
