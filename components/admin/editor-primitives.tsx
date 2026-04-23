"use client";

import { useState } from "react";

/*
  Shared admin editor primitives. Every content editor uses these for
  consistent visual treatment: a table of field rows, a sticky save
  bar with Save draft / Publish, and a callout banner for the post-save
  acknowledgement. Persistence wires to Supabase once keys land.
*/

export function EditorRow({
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
      <td style={{ width: "22%", verticalAlign: "top" }}>
        <strong>{label}</strong>
        {hint && <div className="mt-0.5 text-[11px] text-ink-muted">{hint}</div>}
      </td>
      <td>{children}</td>
    </tr>
  );
}

export function EditorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h2 className="section-header mt-8 mb-3">{title}</h2>
      <table className="doc-table">
        <tbody>{children}</tbody>
      </table>
    </>
  );
}

export function SaveBar({
  slug,
  id,
  onSaveDraft,
  onPublish,
}: {
  slug: string;
  id: string;
  onSaveDraft?: () => void;
  onPublish?: () => void;
}) {
  const [saved, setSaved] = useState<null | "draft" | "publish">(null);
  const handle = (kind: "draft" | "publish") => {
    if (kind === "draft") onSaveDraft?.();
    else onPublish?.();
    setSaved(kind);
    setTimeout(() => setSaved(null), 2000);
  };
  return (
    <>
      {saved && (
        <div className="callout mt-8">
          <p>
            <strong>{saved === "draft" ? "Draft saved" : "Published"}</strong> ·
            persistence wires into Supabase once credentials are in .env.local.
            Form state is preserved on this page.
          </p>
        </div>
      )}
      <div className="sticky bottom-0 mt-8 flex items-center justify-between border-t border-ink-border bg-white px-4 py-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Slug: <code>{slug}</code> · ID: <code>{id}</code>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handle("draft")} className="btn-secondary">
            Save draft
          </button>
          <button onClick={() => handle("publish")} className="btn-primary">
            Publish
          </button>
        </div>
      </div>
    </>
  );
}
