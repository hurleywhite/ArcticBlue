"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
    // Could be a freshly-hydrated client; give it one paint before redirecting.
    return <div className="mt-10 text-[12px] text-ink-muted">Loading account…</div>;
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
      // If this is a custom account, also patch the custom array
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
      // If it's custom, remove from custom; otherwise add to deleted set.
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
      {/* Account header */}
      <div className="bg-navy px-6 py-4 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
              {account.industry || "No industry"} · {account.size || "size unknown"}
            </div>
            <div className="mt-0.5 text-[22px] font-bold leading-[1.15]">
              {account.company_name}
            </div>
            <div className="mt-1 text-[12px] opacity-80">
              <code>{account.domain}</code>
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
              className="border border-white/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-white/10"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
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
            <>
              <h2 className="section-header mt-10 mb-3">Cases to cite</h2>
              <div className="border border-ink-border">
                {relevantCases.map((c, idx) => (
                  <div
                    key={c.id}
                    className={`grid grid-cols-[140px_1fr_120px] items-start ${
                      idx === relevantCases.length - 1 ? "" : "border-b border-ink-border"
                    }`}
                  >
                    <div className="bg-navy px-4 py-4 text-white">
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
                        Headline
                      </div>
                      <div className="mt-1 text-[16px] font-bold leading-[1.15]">
                        {c.headline_metric}
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                        {c.anonymized_client_label} · {(c.tags.industries ?? []).join(" · ")}
                      </div>
                      <div className="mt-0.5 text-[14px] font-bold text-navy">{c.title}</div>
                      <p className="mt-1 text-[12px] leading-[1.5] text-ink">
                        {c.summary.slice(0, 220)}…
                      </p>
                    </div>
                    <div className="flex items-center justify-end px-4 py-4">
                      <Link
                        href={`/use-cases/${c.slug}`}
                        className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                      >
                        Open →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <ActivityLog activity={activity} />
        </div>

        <aside>
          <h3 className="section-header mb-2">Point of contact</h3>
          <div className="card-surface">
            <div className="text-[14px] font-bold text-navy">
              {account.poc_name || "(none)"}
            </div>
            <div className="mt-0.5 text-[12px] text-ink-muted">
              {account.poc_title || ""}
            </div>
            <div className="mt-2 text-[11px] text-ink">
              <code>{account.poc_email}</code>
            </div>
          </div>

          <h3 className="section-header mt-6 mb-2">Open in Showcase</h3>
          <ul className="m-0 list-none space-y-2 p-0">
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
          </ul>
        </aside>
      </div>
    </div>
  );
}

function ShowcaseLink({ href, title }: { href: string; title: string }) {
  return (
    <li>
      <Link
        href={href}
        className="block border border-ink-border bg-white px-3 py-2 text-[11px] font-bold text-navy transition hover:border-navy hover:bg-ice"
      >
        {title}
      </Link>
    </li>
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
      className="border border-white/40 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
    >
      {STAGE_ORDER.map((s) => (
        <option key={s} value={s} className="text-navy">
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
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="section-header mb-0">Notes</h2>
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
          >
            Edit
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-[1.6] text-ink whitespace-pre-wrap">
          {initial || <span className="italic text-ink-muted">No notes yet.</span>}
        </p>
        {saved && (
          <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            Saved
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="section-header mb-0">Notes</h2>
      </div>
      <textarea
        className="textarea mt-2"
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
    </div>
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
    <>
      <h2 className="section-header mt-10 mb-3">Activity</h2>
      <div className="border border-ink-border">
        {activity.map((a, idx) => (
          <div
            key={a.id}
            className={`grid grid-cols-[120px_160px_1fr] items-start ${
              idx === activity.length - 1 ? "" : "border-b border-ink-border"
            } bg-white`}
          >
            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
              {new Date(a.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {ACTIVITY_LABEL[a.kind]}
            </div>
            <div className="px-4 py-3 text-[12px]">{a.body}</div>
          </div>
        ))}
      </div>
    </>
  );
}
