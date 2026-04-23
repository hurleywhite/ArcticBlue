"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  STAGE_LABEL,
  STAGE_ORDER,
  formatMeetingWhen,
  type Account,
} from "@/lib/content/accounts";
import { resolveAccounts, useAccountsStore } from "@/lib/state/accounts-store";
import { EASE, staggerChild, Stagger } from "@/components/motion/primitives";

/*
  Workbench home client — dark treatment.
  Hero is the next meeting card (breathing frost-tinted accent); pipeline
  groups by stage with hover-reveal border glow on cards. Week-ahead
  strip sits between, with mono timestamp labels and data-pulse dots.
*/

export function WorkbenchHome() {
  const [state] = useAccountsStore();
  const accounts = useMemo(() => resolveAccounts(state), [state]);

  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<
    (typeof STAGE_ORDER)[number] | "all"
  >("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => {
      if (stageFilter !== "all" && a.stage !== stageFilter) return false;
      if (!q) return true;
      const hay =
        `${a.company_name} ${a.industry} ${a.poc_name} ${a.poc_title} ${a.domain}`.toLowerCase();
      return hay.includes(q);
    });
  }, [accounts, query, stageFilter]);

  const nextMeeting = useMemo(() => {
    const upcoming = accounts.filter(
      (a) => a.next_meeting && new Date(a.next_meeting.when).getTime() > Date.now()
    );
    upcoming.sort(
      (a, b) =>
        new Date(a.next_meeting!.when).getTime() -
        new Date(b.next_meeting!.when).getTime()
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
          new Date(a.next_meeting!.when).getTime() -
          new Date(b.next_meeting!.when).getTime()
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
      {nextMeeting && nextMeeting.next_meeting && (
        <NextMeetingCard account={nextMeeting} />
      )}

      {upcomingWeek.length > 1 && (
        <section className="mt-12">
          <SectionRail label={`This week · ${upcomingWeek.length} meetings`} />
          <Stagger
            className="mt-4 grid grid-cols-1 gap-px overflow-hidden md:grid-cols-3"
            style={{ background: "var(--fg-16)" }}
          >
            {upcomingWeek.slice(0, 6).map((a) => (
              <motion.div key={a.id} variants={staggerChild}>
                <Link
                  href={`/workbench/accounts/${a.id}`}
                  className="group relative flex h-full flex-col gap-3 px-5 py-4"
                  style={{
                    background: "var(--ink-raised)",
                    transition:
                      "background 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
                  }}
                >
                  <HoverBorderGlow />
                  <div className="kicker-sm flex items-center gap-2">
                    <span className="data-dot" />
                    {formatMeetingWhen(a.next_meeting!.when)}
                  </div>
                  <div>
                    <div
                      className="serif text-[18px] leading-[1.2]"
                      style={{ color: "var(--fg-100)" }}
                    >
                      {a.company_name}
                    </div>
                    <div
                      className="mt-1 text-[13px] leading-[1.45]"
                      style={{ color: "var(--fg-72)" }}
                    >
                      {a.next_meeting!.title}
                    </div>
                  </div>
                  <div
                    className="mt-auto font-mono text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: "var(--fg-52)" }}
                  >
                    {a.poc_name} · {a.poc_title}
                  </div>
                </Link>
              </motion.div>
            ))}
          </Stagger>
        </section>
      )}

      <section className="mt-16">
        <div className="flex items-end justify-between">
          <SectionRail
            label={`Pipeline · ${accounts.length} account${
              accounts.length === 1 ? "" : "s"
            }`}
          />
          <Link
            href="/workbench/accounts/new"
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--frost)" }}
          >
            + New account
          </Link>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-2 px-4 py-3"
          style={{
            background: "var(--ink-raised)",
            border: "1px solid var(--fg-16)",
            borderRadius: 2,
          }}
        >
          <input
            type="search"
            placeholder="Search company, POC, industry, or domain"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            style={{ maxWidth: 360, background: "var(--ink-deep)" }}
          />
          <span
            className="mx-1 h-4 w-px"
            style={{ background: "var(--fg-16)" }}
          />
          <span className="kicker-sm">Stage</span>
          <StageChip active={stageFilter === "all"} onClick={() => setStageFilter("all")}>
            All
          </StageChip>
          {STAGE_ORDER.map((s) => {
            const count = accounts.filter((a) => a.stage === s).length;
            if (count === 0) return null;
            return (
              <StageChip
                key={s}
                active={stageFilter === s}
                onClick={() => setStageFilter(s)}
              >
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
              className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: "var(--frost)" }}
            >
              Clear
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <div
            className="mt-4 px-5 py-8 text-center"
            style={{
              background: "var(--ink-raised)",
              border: "1px solid var(--fg-16)",
              borderRadius: 2,
              color: "var(--fg-52)",
            }}
          >
            <span className="italic">No accounts match the filters.</span>
          </div>
        )}

        <div className="mt-6 space-y-10">
          {byStage.map(({ stage, accounts: stageAccounts }) => (
            <div key={stage}>
              <div
                className="mb-3 flex items-center gap-3"
                style={{ color: "var(--fg-52)" }}
              >
                <span className="kicker-sm">{STAGE_LABEL[stage]}</span>
                <span style={{ color: "var(--fg-32)" }}>·</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                  {stageAccounts.length}
                </span>
                <span
                  className="ml-1 h-px flex-1"
                  style={{ background: "var(--fg-16)" }}
                />
              </div>
              <Stagger
                className="grid grid-cols-1 gap-px overflow-hidden md:grid-cols-2 lg:grid-cols-3"
                style={{ background: "var(--fg-16)" }}
              >
                {stageAccounts.map((a) => (
                  <AccountCard key={a.id} account={a} />
                ))}
              </Stagger>
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
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-12"
    >
      <div
        className="relative overflow-hidden rounded-[4px]"
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--fg-16)",
        }}
      >
        <span
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, var(--frost) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div className="relative grid grid-cols-1 gap-0 md:grid-cols-[1fr_260px]">
          <div
            className="flex flex-col gap-4 p-8"
            style={{ borderRight: "1px solid var(--fg-16)" }}
          >
            <div className="kicker flex items-center gap-2">
              <span
                className="data-dot"
                style={{ background: "var(--amber)" }}
                aria-hidden
              />
              Next meeting · {formatMeetingWhen(nm.when)}
            </div>
            <h2
              className="serif-tight text-[32px] leading-[1.1] md:text-[36px]"
              style={{ color: "var(--fg-100)" }}
            >
              {nm.title}
            </h2>
            <div
              className="font-mono text-[11px] uppercase tracking-[0.16em]"
              style={{ color: "var(--fg-52)" }}
            >
              {account.company_name} · {account.poc_name} · {account.poc_title}
            </div>
            <div className="mt-2">
              <div className="kicker-sm mb-2">Notes</div>
              <p
                className="text-[14px] leading-[1.65]"
                style={{ color: "var(--fg-72)" }}
              >
                {account.notes}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/workbench/accounts/${account.id}`}
                className="btn-primary"
              >
                Open meeting →
              </Link>
              <span className="kicker-sm">
                {STAGE_LABEL[account.stage]}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="kicker-sm mb-3">Attendees</div>
            <ul className="m-0 list-none space-y-2 p-0">
              {nm.attendees.map((a) => (
                <li
                  key={a}
                  className="border-b pb-2 text-[13px] last:border-b-0"
                  style={{
                    borderBottomColor: "var(--fg-16)",
                    color: "var(--fg-100)",
                  }}
                >
                  {a}
                </li>
              ))}
            </ul>
            <div className="mt-4 kicker-sm">
              {nm.location} · {nm.duration_minutes} min
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function AccountCard({ account }: { account: Account }) {
  return (
    <motion.div variants={staggerChild}>
      <Link
        href={`/workbench/accounts/${account.id}`}
        className="group relative flex h-full flex-col gap-4 px-5 py-5"
        style={{
          background: "var(--ink-raised)",
          transition: "background 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      >
        <HoverBorderGlow />
        <div className="kicker-sm">{account.industry}</div>
        <div>
          <div
            className="serif text-[20px] leading-[1.15]"
            style={{ color: "var(--fg-100)" }}
          >
            {account.company_name}
          </div>
          <div
            className="mt-2 text-[13px]"
            style={{ color: "var(--fg-72)" }}
          >
            {account.poc_name}
            <span style={{ color: "var(--fg-32)" }}> · </span>
            {account.poc_title}
          </div>
        </div>
        {account.next_meeting && (
          <div
            className="mt-auto border-t pt-3"
            style={{ borderTopColor: "var(--fg-16)" }}
          >
            <div className="kicker-sm flex items-center gap-2">
              <span
                className="data-dot"
                style={{ background: "var(--frost)" }}
              />
              {formatMeetingWhen(account.next_meeting.when)}
            </div>
            <div
              className="mt-1 text-[12px]"
              style={{ color: "var(--fg-72)" }}
            >
              {account.next_meeting.title}
            </div>
          </div>
        )}
        <div
          className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "var(--fg-52)" }}
        >
          <span>Updated {relativeTime(account.updated_at)}</span>
          <span
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: "var(--frost)" }}
          >
            →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function SectionRail({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="kicker">{label}</span>
      <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
    </div>
  );
}

function HoverBorderGlow() {
  return (
    <span
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
      style={{
        boxShadow: "inset 0 0 0 1px var(--frost-glow)",
        transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      }}
    />
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
    <button onClick={onClick} className={`chip ${active ? "active" : ""}`}>
      {children}
    </button>
  );
}

function relativeTime(iso: string): string {
  const diffHours =
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
  const days = Math.round(diffHours / 24);
  return `${days}d ago`;
}
