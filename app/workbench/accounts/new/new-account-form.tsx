"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STAGE_LABEL, STAGE_ORDER, type Account } from "@/lib/content/accounts";
import {
  emptyAccountDraft,
  newActivityId,
  useAccountsStore,
} from "@/lib/state/accounts-store";

/*
  New account form. Writes to the localStorage-backed accounts store
  (state.custom[]). Redirects to the new account's detail page.
*/

export function NewAccountForm() {
  const router = useRouter();
  const [, setState] = useAccountsStore();
  const [draft, setDraft] = useState<Account>(() => emptyAccountDraft());
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Account>(k: K, v: Account[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.company_name.trim() || saving) return;
    setSaving(true);
    const now = new Date().toISOString();
    const account: Account = {
      ...draft,
      company_name: draft.company_name.trim(),
      domain: draft.domain.trim() || guessDomain(draft.company_name),
      updated_at: now,
      last_touch: now,
    };
    setState((prev) => ({
      ...prev,
      custom: [...prev.custom, account],
      activity: [
        {
          id: newActivityId(),
          account_id: account.id,
          kind: "note",
          body: "Account created.",
          created_at: now,
        },
        ...prev.activity,
      ],
    }));
    router.push(`/workbench/accounts/${account.id}`);
  };

  return (
    <form onSubmit={save} className="mt-6">
      <div className="callout">
        <p>
          Accounts persist in this browser (localStorage). Wire to your CRM when ready.
        </p>
      </div>

      <h2 className="section-header mt-8 mb-3">Company</h2>
      <table className="doc-table">
        <tbody>
          <Row label="Company name *">
            <input
              autoFocus
              className="input"
              value={draft.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              placeholder="Glacier Financial"
            />
          </Row>
          <Row label="Domain" hint="Leave blank to auto-derive from company name.">
            <input
              className="input"
              value={draft.domain}
              onChange={(e) => set("domain", e.target.value)}
              placeholder="glacierfinancial.example"
            />
          </Row>
          <Row label="Industry">
            <input
              className="input"
              value={draft.industry}
              onChange={(e) => set("industry", e.target.value)}
              placeholder="Financial Services · Wealth Management"
            />
          </Row>
          <Row label="Size">
            <input
              className="input"
              value={draft.size}
              onChange={(e) => set("size", e.target.value)}
              placeholder="2,400 employees"
            />
          </Row>
          <Row label="Stage">
            <select
              className="select"
              value={draft.stage}
              onChange={(e) => set("stage", e.target.value as Account["stage"])}
            >
              {STAGE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          </Row>
        </tbody>
      </table>

      <h2 className="section-header mt-8 mb-3">Point of contact</h2>
      <table className="doc-table">
        <tbody>
          <Row label="Name">
            <input
              className="input"
              value={draft.poc_name}
              onChange={(e) => set("poc_name", e.target.value)}
              placeholder="Maya Okonkwo"
            />
          </Row>
          <Row label="Title">
            <input
              className="input"
              value={draft.poc_title}
              onChange={(e) => set("poc_title", e.target.value)}
              placeholder="Chief Operating Officer"
            />
          </Row>
          <Row label="Email">
            <input
              type="email"
              className="input"
              value={draft.poc_email}
              onChange={(e) => set("poc_email", e.target.value)}
              placeholder="maya.okonkwo@glacierfinancial.example"
            />
          </Row>
        </tbody>
      </table>

      <h2 className="section-header mt-8 mb-3">Notes</h2>
      <textarea
        className="textarea"
        rows={4}
        value={draft.notes}
        onChange={(e) => set("notes", e.target.value)}
        placeholder="Context from the inbound, last conversation, or referral source. What do we know?"
      />

      <div className="mt-6 flex items-center justify-between border-t border-ink-border pt-5">
        <div className="text-[11px] text-ink-muted">
          You can add the next meeting from the account page once saved.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => history.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={!draft.company_name.trim() || saving}
          >
            {saving ? "Saving…" : "Save account →"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td style={{ width: "24%", verticalAlign: "top" }}>
        <strong>{label}</strong>
        {hint && <div className="mt-0.5 text-[11px] text-ink-muted">{hint}</div>}
      </td>
      <td>{children}</td>
    </tr>
  );
}

function guessDomain(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .concat(".example");
}
