"use client";

import { useMemo, useState } from "react";
import { marked } from "marked";
import type { DeliverableDef, IntakeField } from "@/lib/content/deliverables";

/*
  Deliverable workflow runner. Three steps:
    1. Intake — structured form, field-level help
    2. Draft — streamed from Claude, inline-editable markdown
    3. Export — branded PDF with co-brand toggle + referral CTA

  State persists in component memory; intentionally no localStorage
  round-trip mid-workflow so a partner can't accidentally leave
  half-finished client data around.
*/

type Step = "intake" | "draft" | "export";

export function DeliverableWorkflow({ def }: { def: DeliverableDef }) {
  const [step, setStep] = useState<Step>("intake");
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    def.intake.forEach((f) => (init[f.name] = ""));
    return init;
  });
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [model, setModel] = useState<string | null>(null);

  // Export form
  const [partnerName, setPartnerName] = useState("");
  const [coBrand, setCoBrand] = useState(false);
  const [preparedBy, setPreparedBy] = useState("");
  const [referClient, setReferClient] = useState(false);

  const requiredOk = def.intake.every((f) => !f.required || fields[f.name].trim());

  const runDraft = async () => {
    if (!requiredOk || running) return;
    setStep("draft");
    setDraft("");
    setModel(null);
    setRunning(true);
    try {
      const res = await fetch(`/api/deliverables/${def.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);
      setModel(res.headers.get("X-Arcticmind-Model"));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.text) setDraft((prev) => prev + evt.text);
          } catch {}
        }
      }
    } catch (err) {
      setDraft(
        `_[Error: ${err instanceof Error ? err.message : String(err)}]_`
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <StepIndicator step={step} />

      {step === "intake" && (
        <IntakeStep
          def={def}
          fields={fields}
          setFields={setFields}
          requiredOk={requiredOk}
          onRun={runDraft}
        />
      )}

      {step === "draft" && (
        <DraftStep
          def={def}
          draft={draft}
          setDraft={setDraft}
          running={running}
          model={model}
          onBack={() => setStep("intake")}
          onNext={() => setStep("export")}
          onRerun={runDraft}
        />
      )}

      {step === "export" && (
        <ExportStep
          def={def}
          clientName={fields.client_name || fields.meeting_name || fields.pilot_name || ""}
          draft={draft}
          partnerName={partnerName}
          setPartnerName={setPartnerName}
          coBrand={coBrand}
          setCoBrand={setCoBrand}
          preparedBy={preparedBy}
          setPreparedBy={setPreparedBy}
          referClient={referClient}
          setReferClient={setReferClient}
          onBack={() => setStep("draft")}
        />
      )}
    </>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Array<{ id: Step; label: string; n: string }> = [
    { id: "intake", label: "Intake", n: "01" },
    { id: "draft", label: "Draft", n: "02" },
    { id: "export", label: "Export", n: "03" },
  ];
  const activeIdx = steps.findIndex((s) => s.id === step);
  return (
    <div className="mt-6 flex items-stretch border border-ink-border">
      {steps.map((s, i) => {
        const isActive = i === activeIdx;
        const isPast = i < activeIdx;
        return (
          <div
            key={s.id}
            className={`flex-1 border-r border-ink-border px-4 py-3 last:border-r-0 ${
              isActive ? "bg-navy text-white" : isPast ? "bg-ice" : "bg-white"
            }`}
          >
            <div
              className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                isActive ? "opacity-80" : isPast ? "text-navy" : "text-ink-muted"
              }`}
            >
              {s.n} · {s.label}
            </div>
            <div
              className={`mt-1 text-[12px] ${
                isActive ? "opacity-90" : isPast ? "text-ink" : "text-ink-muted"
              }`}
            >
              {s.id === "intake"
                ? "Structured form"
                : s.id === "draft"
                  ? "Streamed from Claude, editable"
                  : "Branded PDF + referral"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IntakeStep({
  def,
  fields,
  setFields,
  requiredOk,
  onRun,
}: {
  def: DeliverableDef;
  fields: Record<string, string>;
  setFields: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  requiredOk: boolean;
  onRun: () => void;
}) {
  return (
    <>
      <div className="callout mt-6">
        <p>{def.usage_hint}</p>
      </div>

      <h2 className="section-header mt-8 mb-3">Intake</h2>
      <table className="doc-table">
        <tbody>
          {def.intake.map((f) => (
            <IntakeRow
              key={f.name}
              field={f}
              value={fields[f.name] ?? ""}
              onChange={(v) =>
                setFields((prev) => ({ ...prev, [f.name]: v }))
              }
            />
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex items-center justify-between border-t border-ink-border pt-4">
        <div className="text-[12px] text-ink-muted">
          {requiredOk
            ? "All required fields filled. Claude will draft the deliverable on the next step."
            : "Fill the required fields to continue."}
        </div>
        <button
          onClick={onRun}
          disabled={!requiredOk}
          className="btn-primary disabled:cursor-not-allowed"
        >
          Draft the deliverable →
        </button>
      </div>
    </>
  );
}

function IntakeRow({
  field,
  value,
  onChange,
}: {
  field: IntakeField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <tr>
      <td style={{ width: "28%", verticalAlign: "top" }}>
        <strong>
          {field.label}
          {field.required && <span className="ml-1 text-navy">*</span>}
        </strong>
        {field.help && (
          <div className="mt-0.5 text-[11px] text-ink-muted">{field.help}</div>
        )}
      </td>
      <td>
        {field.type === "textarea" || field.type === "multi-line-list" ? (
          <textarea
            className="textarea"
            rows={field.rows ?? 4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ""}
          />
        ) : field.type === "select" ? (
          <select
            className="select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">—</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ""}
          />
        )}
      </td>
    </tr>
  );
}

function DraftStep({
  def,
  draft,
  setDraft,
  running,
  model,
  onBack,
  onNext,
  onRerun,
}: {
  def: DeliverableDef;
  draft: string;
  setDraft: (v: string) => void;
  running: boolean;
  model: string | null;
  onBack: () => void;
  onNext: () => void;
  onRerun: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const html = useMemo(
    () => (draft ? (marked.parse(draft, { async: false }) as string) : ""),
    [draft]
  );

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-header mb-0">
          {def.output_label} · draft
        </h2>
        <div className="flex items-center gap-2">
          {model && (
            <span
              className={
                model === "mock"
                  ? "border border-ink-border bg-bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted"
                  : "border border-navy bg-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
              }
            >
              {model === "mock" ? "MOCK" : model.replace("claude-", "")}
            </span>
          )}
          {!running && draft && (
            <>
              <button
                onClick={() => setEditing((e) => !e)}
                className="btn-secondary"
              >
                {editing ? "Preview" : "Edit markdown"}
              </button>
              <button onClick={onRerun} className="btn-secondary">
                Re-draft
              </button>
            </>
          )}
        </div>
      </div>

      {editing && !running ? (
        <textarea
          className="textarea mt-3"
          rows={28}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <div
          className="card-surface prose-editorial mt-3"
          dangerouslySetInnerHTML={{
            __html: html || `<p><em>${running ? "Drafting…" : "No draft yet."}</em></p>`,
          }}
        />
      )}

      <div className="mt-6 flex items-center justify-between border-t border-ink-border pt-4">
        <button onClick={onBack} className="btn-secondary">
          ← Back to intake
        </button>
        <button
          onClick={onNext}
          disabled={running || !draft}
          className="btn-primary"
        >
          Produce deliverable →
        </button>
      </div>
    </>
  );
}

function ExportStep({
  def,
  clientName,
  draft,
  partnerName,
  setPartnerName,
  coBrand,
  setCoBrand,
  preparedBy,
  setPreparedBy,
  referClient,
  setReferClient,
  onBack,
}: {
  def: DeliverableDef;
  clientName: string;
  draft: string;
  partnerName: string;
  setPartnerName: (v: string) => void;
  coBrand: boolean;
  setCoBrand: (v: boolean) => void;
  preparedBy: string;
  setPreparedBy: (v: string) => void;
  referClient: boolean;
  setReferClient: (v: boolean) => void;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const exportPdf = () => {
    if (!draft || typeof window === "undefined") return;
    const html = marked.parse(draft, { async: false }) as string;
    const brand = coBrand && partnerName.trim()
      ? `${escapeHtml(partnerName)} · Using ArcticBlue methods`
      : "ArcticBlue · Partner deliverable";
    const preparedByLine = preparedBy.trim()
      ? `Prepared by ${escapeHtml(preparedBy)}`
      : "";
    const referralBlock = referClient
      ? `<div class="referral">
          <div class="label">Want to take this further?</div>
          <p>This deliverable uses ArcticBlue's Practical Labs methodology. If your team would benefit from monthly live sessions to build AI fluency on your real work, we can arrange an introduction.</p>
          <p><strong>Contact:</strong> scott@arcticblue.ai · arcticblue.ai</p>
         </div>`
      : "";

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(def.output_label)} · ${escapeHtml(clientName || "Draft")}</title>
      <style>
        @page { margin: 0.5in; }
        body { font-family: Arial, Helvetica, sans-serif; max-width: 880px; margin: 0 auto; padding: 28px; color: #1A1A1A; font-size: 13px; line-height: 1.55; }
        .band { background: #1F3A5F; color: #fff; padding: 16px 20px; margin-bottom: 20px; }
        .band .kicker { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.8; }
        .band h1 { margin: 6px 0 0; font-size: 22px; }
        .band .prep { margin-top: 8px; font-size: 11px; opacity: 0.8; }
        h1,h2,h3 { color: #1F3A5F; }
        h2 { font-size: 16px; margin-top: 22px; border-top: 1px solid #CCC; padding-top: 14px; }
        h3 { font-size: 13px; }
        blockquote { background: #D5E8F0; border-left: 3px solid #1F3A5F; padding: 10px 14px; margin: 10px 0; font-style: normal; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #CCC; margin: 12px 0; }
        th, td { border: 1px solid #CCC; padding: 8px 12px; text-align: left; }
        thead th { background: #1F3A5F; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
        .referral { margin-top: 32px; padding: 14px 18px; background: #D5E8F0; border-left: 3px solid #1F3A5F; }
        .referral .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #1F3A5F; font-weight: 700; }
        footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #CCC; color: #555; font-size: 11px; display: flex; justify-content: space-between; }
      </style>
    </head><body>
      <div class="band">
        <div class="kicker">${escapeHtml(def.output_label)} — for ${escapeHtml(clientName || "Client")}</div>
        <h1>${escapeHtml(def.title)}</h1>
        ${preparedByLine ? `<div class="prep">${preparedByLine} · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>` : ""}
      </div>
      ${html}
      ${referralBlock}
      <footer>
        <span>${brand}</span>
        <span>Confidential — for ${escapeHtml(clientName || "the named client")}</span>
      </footer>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <>
      <h2 className="section-header mt-8 mb-3">Attribution</h2>
      <table className="doc-table">
        <tbody>
          <tr>
            <td style={{ width: "28%", verticalAlign: "top" }}>
              <strong>Prepared by</strong>
              <div className="mt-0.5 text-[11px] text-ink-muted">
                Your name. Appears on the cover.
              </div>
            </td>
            <td>
              <input
                className="input"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="e.g. Alex Tan"
              />
            </td>
          </tr>
          <tr>
            <td style={{ verticalAlign: "top" }}>
              <strong>Co-brand</strong>
              <div className="mt-0.5 text-[11px] text-ink-muted">
                For partners producing deliverables under their own firm.
              </div>
            </td>
            <td>
              <label className="flex items-center gap-2 text-[12px]">
                <input
                  type="checkbox"
                  checked={coBrand}
                  onChange={(e) => setCoBrand(e.target.checked)}
                />
                Co-brand with my firm
              </label>
              {coBrand && (
                <input
                  className="input mt-2"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Firm name (e.g. Acme Advisory)"
                />
              )}
              <div className="mt-1 text-[11px] text-ink-muted">
                Footer will read: &ldquo;{coBrand && partnerName.trim() ? `${partnerName} · Using ArcticBlue methods` : "ArcticBlue · Partner deliverable"}&rdquo;
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ verticalAlign: "top" }}>
              <strong>Include referral block</strong>
              <div className="mt-0.5 text-[11px] text-ink-muted">
                If the client engagement could lead to a Practical Labs intro.
              </div>
            </td>
            <td>
              <label className="flex items-center gap-2 text-[12px]">
                <input
                  type="checkbox"
                  checked={referClient}
                  onChange={(e) => setReferClient(e.target.checked)}
                />
                Include &ldquo;Want to take this further?&rdquo; block with Scott's contact
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-border pt-4">
        <button onClick={onBack} className="btn-secondary">
          ← Back to draft
        </button>
        <div className="flex items-center gap-2">
          <button onClick={copy} className="btn-secondary">
            {copied ? "Copied" : "Copy markdown"}
          </button>
          <button onClick={exportPdf} className="btn-primary">
            Export branded PDF →
          </button>
        </div>
      </div>

      <div className="callout mt-8">
        <p>
          <strong>What just happened:</strong> the deliverable is ready. Export the
          PDF, send to your client, and — if appropriate — use the referral block to
          route them to ArcticBlue for Practical Labs.
        </p>
      </div>
    </>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
