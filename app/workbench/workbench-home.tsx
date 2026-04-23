"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STAGE_LABEL, STAGE_ORDER, formatMeetingWhen, type Account } from "@/lib/content/accounts";
import { resolveAccounts, useAccountsStore } from "@/lib/state/accounts-store";

/*
  Workbench home client. Reads accounts from the live store (seed +
  overlays + custom − deleted), offers search + filter, renders a
  hero next-meeting, an upcoming-this-week strip, and the pipeline
  by stage.
*/

export function WorkbenchHome() {
  const [state] = useAccountsStore();
  const accounts = useMemo(() => resolveAccounts(state), [state]);

  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<typeof STAGE_ORDER[number] | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => {
      if (stageFilter !== "all" && a.stage !== stageFilter) return false;
      if (!q) return true;
      const hay = `${a.company_name} ${a.industry} ${a.poc_name} ${a.poc_title} ${a.domain}`.toLowerCase();
      return hay.includes(q);
    });
  }, [accounts, query, stageFilter]);

  const nextMeeting = useMemo(() => {
    const upcoming = accounts.filter(
      (a) => a.next_meeting && new Date(a.next_meeting.when).getTime() > Date.now()
    );
    upcoming.sort(
      (a, b) =>
        new Date(a.next_meeting!.when).getTime() - new Date(b.next_meeting!.when).getTime()
    );
    return upcoming[0];
  }, [accounts]);

  const upcomingWeek = useMemo(() => {
    const weekFromNow = Date.now() + 1000 * 60 * 60 * 24 * 7;
    return accounts
      .filter(
        (a) =>
          a.next_meeting &&
          new Date(a.next_meeting.when).getTime() > Date.now() &&
          new Date(a.next_meeting.when).getTime() < weekFromNow
      )
      .sort(
        (a, b) =>
          new Date(a.next_meeting!.when).getTime() - new Date(b.next_meeting!.when).getTime()
      );
  }, [accounts]);

  const byStage = useMemo(() => {
    return STAGE_ORDER.map((stage) => ({
      stage,
      accounts: filtered.filter((a) => a.stage === stage),
    })).filter((g) => g.accounts.length > 0);
  }, [filtered]);

  return (
    <>
      {nextMeeting && nextMeeting.next_meeting && <NextMeetingCard account={nextMeeting} />}

      {upcomingWeek.length > 1 && (
        <section className="mt-6">
          <h2 className="section-header mb-3">This week · {upcomingWeek.length} meetings</h2>
          <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-3">
            {upcomingWeek.slice(0, 6).map((a, idx, arr) => (
              <Link
                key={a.id}
                href={`/workbench/accounts/${a.id}`}
                className={`group block bg-white transition hover:bg-bg-card ${
                  idx === arr.length - 1 ? "" : "md:border-r md:border-ink-border"
                } border-b border-ink-border md:border-b-0`}
              >
                <div className="px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    {formatMeetingWhen(a.next_meeting!.when)}
                  </div>
                  <div className="mt-0.5 text-[13px] font-bold text-navy">
                    {a.company_name}
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink">{a.next_meeting!.title}</div>
                  <div className="mt-1 text-[11px] text-ink-muted">
                    {a.poc_name} · {a.poc_title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-header mb-0">
            Pipeline · {accounts.length} account{accounts.length === 1 ? "" : "s"}
          </h2>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border border-ink-border bg-bg-card px-4 py-3">
          <input
            type="search"
            placeholder="Search by company, POC, industry, or domain"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            style={{ maxWidth: 360 }}
          />
          <span className="mx-2 h-4 w-px bg-ink-border" />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Stage
          </span>
          <StageChip active={stageFilter === "all"} onClick={() => setStageFilter("all")}>
            All
          </StageChip>
          {STAGE_ORDER.map((s) => {
            const count = accounts.filter((a) => a.stage === s).length;
            if (count === 0) return null;
            return (
              <StageChip key={s} active={stageFilter === s} onClick={() => setStageFilter(s)}>
                {STAGE_LABEL[s]} · {count}
              </StageChip>
            );
          })}
          {(query || stageFilter !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setStageFilter("all");
              }}
              className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="mt-3 border border-ink-border bg-white px-5 py-6 text-center italic text-ink-muted">
            No accounts match the filters.
          </div>
        )}

        <div className="mt-4 space-y-6">
          {byStage.map(({ stage, accounts: stageAccounts }) => (
            <div key={stage}>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
                {STAGE_LABEL[stage]} · {stageAccounts.length}
              </div>
              <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-2 lg:grid-cols-3">
                {stageAccounts.map((a, idx) => (
                  <AccountCard key={a.id} account={a} idx={idx} total={stageAccounts.length} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function NextMeetingCard({ account }: { account: Account }) {
  const nm = account.next_meeting!;
  return (
    <section className="mt-6">
      <div className="border border-navy">
        <div className="flex flex-col gap-3 bg-navy px-6 py-4 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
              Next meeting · {formatMeetingWhen(nm.when)}
            </div>
            <div className="mt-0.5 text-[18px] font-bold leading-[1.15]">{nm.title}</div>
            <div className="mt-0.5 text-[12px] opacity-80">
              {account.company_name} · {account.poc_name} ({account.poc_title})
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="border border-white/40 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              {STAGE_LABEL[account.stage]}
            </span>
            <Link
              href={`/workbench/accounts/${account.id}`}
              className="border border-white bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:bg-ice"
            >
              Open meeting →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-0 bg-white md:grid-cols-[1fr_240px]">
          <div className="border-b border-ink-border px-6 py-5 md:border-b-0 md:border-r">
            <h3 className="section-header mb-2">Notes</h3>
            <p className="text-[13px] leading-[1.6]">{account.notes}</p>
          </div>
          <div className="px-5 py-4">
            <h3 className="section-header mb-2">Attendees</h3>
            <ul className="m-0 list-none space-y-1 p-0 text-[12px]">
              {nm.attendees.map((a) => (
                <li key={a} className="border-b border-ink-border pb-1 last:border-b-0">
                  {a}
                </li>
              ))}
            </ul>
            <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {nm.location} · {nm.duration_minutes} min
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountCard({ account, idx, total }: { account: Account; idx: number; total: number }) {
  const lastItem = idx === total - 1;
  return (
    <Link
      href={`/workbench/accounts/${account.id}`}
      className={`group block bg-white transition hover:bg-bg-card ${
        lastItem ? "" : "md:border-r md:border-ink-border"
      } border-b border-ink-border lg:border-b-0`}
    >
      <div className="px-5 py-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
          {account.company_name}
        </div>
        <div className="mt-0.5 text-[10px] text-ink-muted">{account.industry}</div>
        <div className="mt-3 text-[13px] font-bold text-navy">{account.poc_name}</div>
        <div className="text-[11px] text-ink-muted">{account.poc_title}</div>
        {account.next_meeting && (
          <div className="mt-3 border-t border-ink-border pt-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
              {formatMeetingWhen(account.next_meeting.when)}
            </div>
            <div className="mt-0.5 text-[11px] text-ink">{account.next_meeting.title}</div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-ink-border pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Updated {relativeTime(account.updated_at)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}

function StageChip({
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

function relativeTime(iso: string): string {
  const diffHours = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
  const days = Math.round(diffHours / 24);
  return `${days}d ago`;
}
