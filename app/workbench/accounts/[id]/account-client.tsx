"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  STAGE_LABEL,
  STAGE_ORDER,
  formatMeetingWhen,
  type Account,
  type AccountStage,
} from "@/lib/content/accounts";
import { USE_CASES } from "@/lib/content/use-cases";
import {
  newActivityId,
  resolveAccountById,
  useAccountsStore,
  type ActivityEntry,
} from "@/lib/state/accounts-store";
import { MeetingPrepClient } from "./meeting-prep-client";
import { FollowupDrafter } from "./followup-drafter";
import { Stagger, staggerChild } from "@/components/motion/primitives";

/*
  Account detail — live against the accounts store. Inline edits on
  notes, stage, and POC. Activity log at the bottom captures each
  brief generation, follow-up draft, stage change, and manual note.
*/

export function AccountClient({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [state, setState] = useAccountsStore();
  const account = useMemo(() => resolveAccountById(state, accountId), [state, accountId]);

  const activity = useMemo(
    () => state.activity.filter((a) => a.account_id === accountId).slice(0, 40),
    [state.activity, accountId]
  );

  if (!account) {
    return (
      <div
        className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em]"
        style={{ color: "var(--fg-52)" }}
      >
        Loading account…
      </div>
    );
  }

  const relevantCases = (account.relevant_case_slugs ?? [])
    .map((slug) => USE_CASES.find((u) => u.slug === slug))
    .filter((u): u is (typeof USE_CASES)[number] => !!u);

  const updateAccount = (patch: Partial<Account>, activityEntry?: Omit<ActivityEntry, "id" | "created_at" | "account_id">) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const overlays = { ...prev.overlays };
      const existing = overlays[accountId] ?? {};
      overlays[accountId] = { ...existing, ...patch, updated_at: now };
      const custom = prev.custom.map((c) =>
        c.id === accountId ? { ...c, ...patch, updated_at: now } : c
      );
      const newActivity = activityEntry
        ? [
            {
              id: newActivityId(),
              account_id: accountId,
              created_at: now,
              ...activityEntry,
            },
            ...prev.activity,
          ]
        : prev.activity;
      return { ...prev, overlays, custom, activity: newActivity };
    });
  };

  const deleteAccount = () => {
    if (!confirm(`Delete ${account.company_name}? This cannot be undone.`)) return;
    setState((prev) => {
      const isCustom = prev.custom.some((c) => c.id === accountId);
      return {
        ...prev,
        custom: isCustom ? prev.custom.filter((c) => c.id !== accountId) : prev.custom,
        deleted: isCustom ? prev.deleted : [...prev.deleted, accountId],
        activity: prev.activity.filter((a) => a.account_id !== accountId),
      };
    });
    router.push("/workbench");
  };

  const logBriefGeneration = () =>
    updateAccount({}, { kind: "brief_generated", body: "Meeting brief drafted with Claude." });
  const logFollowupDrafting = () =>
    updateAccount({}, { kind: "followup_drafted", body: "Follow-up email drafted with Claude." });

  return (
    <div className="mt-4">
      {/* Account header — dark band with frost accent rail */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative overflow-hidden"
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--fg-16)",
          borderRadius: 2,
        }}
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-[2px]"
          style={{ background: "var(--frost)" }}
        />
        <div className="flex flex-wrap items-start justify-between gap-3 px-6 py-5 pl-7">
          <div>
            <div className="kicker-sm">
              {account.industry || "No industry"} · {account.size || "size unknown"}
            </div>
            <div
              className="serif-tight mt-2 text-[28px] leading-[1.1]"
              style={{ color: "var(--fg-100)" }}
            >
              {account.company_name}
            </div>
            <div
              className="mt-1 font-mono text-[11px]"
              style={{ color: "var(--fg-52)" }}
            >
              {account.domain}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StagePicker
              stage={account.stage}
              onChange={(next) =>
                updateAccount(
                  { stage: next },
                  {
                    kind: "stage_change",
                    body: `Stage moved from ${STAGE_LABEL[account.stage]} to ${STAGE_LABEL[next]}.`,
                  }
                )
              }
            />
            <button
              onClick={deleteAccount}
              className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] transition-opacity"
              style={{
                padding: "6px 10px",
                background: "transparent",
                border: "1px solid var(--fg-16)",
                color: "var(--fg-72)",
                borderRadius: 2,
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[1fr_280px]">
        <div>
          <MeetingPrepClient
            accountId={account.id}
            accountName={account.company_name}
            nextMeeting={
              account.next_meeting
                ? {
                    title: account.next_meeting.title,
                    when: account.next_meeting.when,
                    whenLabel: formatMeetingWhen(account.next_meeting.when),
                    duration: account.next_meeting.duration_minutes,
                    location: account.next_meeting.location,
                    attendees: account.next_meeting.attendees,
                  }
                : null
            }
            notes={account.notes}
            pocName={account.poc_name}
            pocTitle={account.poc_title}
            pocEmail={account.poc_email}
            accountPayload={{
              company_name: account.company_name,
              domain: account.domain,
              industry: account.industry,
              size: account.size,
              stage: account.stage,
              poc_name: account.poc_name,
              poc_title: account.poc_title,
              notes: account.notes,
              target_opportunity_category: account.target_opportunity_category,
              relevant_case_slugs: account.relevant_case_slugs,
              next_meeting: account.next_meeting
                ? {
                    title: account.next_meeting.title,
                    duration_minutes: account.next_meeting.duration_minutes,
                    location: account.next_meeting.location,
                    attendees: account.next_meeting.attendees,
                  }
                : null,
            }}
            onBriefGenerated={logBriefGeneration}
          />

          <NotesEditor
            initial={account.notes}
            onSave={(notes) =>
              updateAccount({ notes }, { kind: "note", body: "Notes updated." })
            }
          />

          <FollowupDrafter
            accountId={account.id}
            accountName={account.company_name}
            pocName={account.poc_name}
            pocEmail={account.poc_email}
            onDrafted={logFollowupDrafting}
          />

          {relevantCases.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center gap-3">
                <span className="kicker">Cases to cite</span>
                <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
              </div>
              <Stagger
                className="mt-4 grid grid-cols-1 gap-px overflow-hidden"
                style={{ background: "var(--fg-16)" }}
              >
                {relevantCases.map((c) => (
                  <motion.div key={c.id} variants={staggerChild}>
                    <Link
                      href={`/use-cases/${c.slug}`}
                      className="group relative flex items-start gap-5 px-5 py-4 no-underline"
                      style={{
                        background: "var(--ink-raised)",
                        transition: "background 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
                        style={{ boxShadow: "inset 0 0 0 1px var(--frost-glow)" }}
                      />
                      <div
                        className="shrink-0 px-4 py-3"
                        style={{
                          background: "var(--ink-deep)",
                          border: "1px solid var(--fg-16)",
                          minWidth: 140,
                        }}
                      >
                        <div className="kicker-sm">Headline</div>
                        <div
                          className="serif mt-1 text-[18px] leading-[1.15]"
                          style={{ color: "var(--frost)" }}
                        >
                          {c.headline_metric}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="kicker-sm">
                          {c.anonymized_client_label} · {(c.tags.industries ?? []).join(" · ")}
                        </div>
                        <div
                          className="serif mt-1 text-[16px]"
                          style={{ color: "var(--fg-100)" }}
                        >
                          {c.title}
                        </div>
                        <p
                          className="mt-1 text-[12px] leading-[1.55]"
                          style={{ color: "var(--fg-72)" }}
                        >
                          {c.summary.slice(0, 220)}…
                        </p>
                      </div>
                      <span
                        className="self-center font-mono text-[10px] uppercase tracking-[0.16em] opacity-60 transition-opacity group-hover:opacity-100"
                        style={{ color: "var(--frost)" }}
                      >
                        Open →
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </Stagger>
            </section>
          )}

          <ActivityLog activity={activity} />
        </div>

        <aside>
          <div className="flex items-center gap-3">
            <span className="kicker">Point of contact</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <div
            className="mt-3 px-4 py-4"
            style={{
              background: "var(--ink-raised)",
              border: "1px solid var(--fg-16)",
              borderRadius: 2,
            }}
          >
            <div
              className="serif text-[15px] leading-[1.2]"
              style={{ color: "var(--fg-100)" }}
            >
              {account.poc_name || "(none)"}
            </div>
            <div
              className="mt-1 text-[12px]"
              style={{ color: "var(--fg-72)" }}
            >
              {account.poc_title || ""}
            </div>
            <div
              className="mt-3 font-mono text-[11px]"
              style={{ color: "var(--fg-52)" }}
            >
              {account.poc_email}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="kicker">Open in Showcase</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <Stagger className="mt-3 flex flex-col gap-1.5">
            <ShowcaseLink
              href={`/mirror?domain=${encodeURIComponent(account.domain)}`}
              title="Mirror · their opportunity field"
            />
            <ShowcaseLink
              href={`/showcase/analyzer?domain=${encodeURIComponent(account.domain)}`}
              title="Analyzer · live company profile"
            />
            <ShowcaseLink href="/showcase/canvas" title="Canvas · for their role" />
            <ShowcaseLink href="/showcase/cases" title="Case studies deck" />
            <ShowcaseLink href="/showcase/lab" title="Practical Labs explainer" />
          </Stagger>
        </aside>
      </div>
    </div>
  );
}

function ShowcaseLink({ href, title }: { href: string; title: string }) {
  return (
    <motion.div variants={staggerChild}>
      <Link
        href={href}
        className="group relative block px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] no-underline"
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--fg-16)",
          color: "var(--fg-72)",
          borderRadius: 2,
          transition: "color 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 1px var(--frost-glow)" }}
        />
        <span className="relative group-hover:text-[color:var(--frost)]">
          {title}
        </span>
      </Link>
    </motion.div>
  );
}

function StagePicker({
  stage,
  onChange,
}: {
  stage: AccountStage;
  onChange: (next: AccountStage) => void;
}) {
  return (
    <select
      value={stage}
      onChange={(e) => onChange(e.target.value as AccountStage)}
      className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
      style={{
        padding: "6px 10px",
        background: "var(--ink-deep)",
        border: "1px solid var(--fg-16)",
        color: "var(--fg-100)",
        borderRadius: 2,
      }}
    >
      {STAGE_ORDER.map((s) => (
        <option key={s} value={s} style={{ background: "var(--ink-deep)", color: "var(--fg-100)" }}>
          {STAGE_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

function NotesEditor({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (value.trim() === initial.trim()) {
      setEditing(false);
      return;
    }
    onSave(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
    setEditing(false);
  };

  if (!editing) {
    return (
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="kicker">Notes</span>
          <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          <button
            onClick={() => setEditing(true)}
            className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
            style={{ color: "var(--frost)" }}
          >
            Edit
          </button>
        </div>
        <p
          className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.65]"
          style={{ color: "var(--fg-72)" }}
        >
          {initial || (
            <span
              className="italic"
              style={{ color: "var(--fg-52)" }}
            >
              No notes yet.
            </span>
          )}
        </p>
        {saved && (
          <div
            className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: "var(--frost)" }}
          >
            Saved
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="kicker">Notes</span>
        <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
      </div>
      <textarea
        className="textarea mt-3"
        rows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          onClick={() => {
            setValue(initial);
            setEditing(false);
          }}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button onClick={save} className="btn-primary">
          Save notes
        </button>
      </div>
    </section>
  );
}

const ACTIVITY_LABEL: Record<ActivityEntry["kind"], string> = {
  note: "Note",
  meeting: "Meeting",
  email: "Email",
  stage_change: "Stage change",
  brief_generated: "Brief drafted",
  followup_drafted: "Follow-up drafted",
};

function ActivityLog({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex items-center gap-3">
        <span className="kicker">Activity</span>
        <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
      </div>
      <div
        className="mt-4 overflow-hidden"
        style={{ border: "1px solid var(--fg-16)", borderRadius: 2 }}
      >
        {activity.map((a, idx) => (
          <div
            key={a.id}
            className="grid grid-cols-[110px_160px_1fr] items-start"
            style={{
              background: "var(--ink-raised)",
              borderBottom:
                idx === activity.length - 1 ? "none" : "1px solid var(--fg-16)",
            }}
          >
            <div
              className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: "var(--fg-52)" }}
            >
              {new Date(a.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div
              className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: "var(--frost)" }}
            >
              {ACTIVITY_LABEL[a.kind]}
            </div>
            <div
              className="px-4 py-3 text-[13px] leading-[1.55]"
              style={{ color: "var(--fg-72)" }}
            >
              {a.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
