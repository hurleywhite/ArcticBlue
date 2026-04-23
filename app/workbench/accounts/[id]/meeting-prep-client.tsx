"use client";

import { useMemo, useState } from "react";
import { marked } from "marked";

/*
  Live meeting prep. Click "Run prep" → streams a structured brief from
  Claude via /api/workbench/prep. The output can be copied, exported
  to a print window (PDF), or pushed into the clipboard as a raw note.
*/

type AccountPayload = {
  company_name: string;
  domain: string;
  industry: string;
  size: string;
  stage: string;
  poc_name: string;
  poc_title: string;
  notes: string;
  target_opportunity_category?: string;
  relevant_case_slugs?: string[];
  next_meeting?: {
    title: string;
    duration_minutes: number;
    location: string;
    attendees: string[];
  } | null;
};

export function MeetingPrepClient({
  accountId,
  accountName,
  nextMeeting,
  notes,
  pocName,
  pocTitle,
  pocEmail,
  accountPayload,
  onBriefGenerated,
}: {
  accountId: string;
  accountName: string;
  nextMeeting: {
    title: string;
    when: string;
    whenLabel: string;
    duration: number;
    location: string;
    attendees: string[];
  } | null;
  notes: string;
  pocName: string;
  pocTitle: string;
  pocEmail: string;
  accountPayload: AccountPayload;
  onBriefGenerated?: () => void;
}) {
  const [brief, setBrief] = useState("");
  const [running, setRunning] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setBrief("");
    setModel(null);
    try {
      const res = await fetch("/api/workbench/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: accountPayload }),
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
            if (evt.text) setBrief((prev) => prev + evt.text);
          } catch {}
        }
      }
      onBriefGenerated?.();
    } catch (err) {
      setBrief(`_[Error: ${err instanceof Error ? err.message : String(err)}]_`);
    } finally {
      setRunning(false);
    }
  };

  const copy = async () => {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const exportPdf = () => {
    if (!brief || typeof window === "undefined") return;
    const html = marked.parse(brief, { async: false }) as string;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Prep · ${escapeHtml(accountName)}</title>
      <style>
        @page { margin: 0.5in; }
        body { font-family: Arial, Helvetica, sans-serif; max-width: 880px; margin: 0 auto; padding: 28px; color: #1A1A1A; font-size: 13px; line-height: 1.55; }
        .band { background: #1F3A5F; color: #fff; padding: 14px 18px; margin-bottom: 18px; }
        .band .k { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.8; }
        .band h1 { margin: 4px 0 0; font-size: 20px; }
        h1,h2,h3 { color: #1F3A5F; }
        h2 { font-size: 16px; margin-top: 22px; }
        h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; }
        blockquote { background: #D5E8F0; border-left: 3px solid #1F3A5F; padding: 12px 16px; margin: 10px 0; }
        footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #CCC; color: #555; font-size: 11px; display: flex; justify-content: space-between; }
        ol, ul { margin-left: 18px; }
      </style>
    </head><body>
      <div class="band">
        <div class="k">ArcticMind · Meeting prep</div>
        <h1>${escapeHtml(accountName)} · ${escapeHtml(nextMeeting?.title ?? "")}</h1>
      </div>
      ${html}
      <footer>
        <span>Prepped ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        <span>Confidential · ArcticBlue internal</span>
      </footer>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const html = useMemo(
    () => (brief ? (marked.parse(brief, { async: false }) as string) : ""),
    [brief]
  );

  return (
    <>
      {nextMeeting && (
        <div className="border border-navy">
          <div className="flex flex-col gap-3 bg-navy px-6 py-4 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
                {nextMeeting.whenLabel} · {nextMeeting.duration} min · {nextMeeting.location}
              </div>
              <div className="mt-0.5 text-[16px] font-bold leading-[1.2]">
                {nextMeeting.title}
              </div>
            </div>
            <button onClick={run} disabled={running} className="btn-primary bg-white text-navy">
              {running ? "Drafting…" : brief ? "Re-run prep" : "Run prep →"}
            </button>
          </div>

          <div className="bg-white px-6 py-5">
            <h3 className="section-header mb-2">Our notes going in</h3>
            <p className="text-[13px] leading-[1.6]">{notes}</p>
            <div className="mt-3 border-t border-ink-border pt-3 text-[11px] text-ink-muted">
              With: {pocName} ({pocTitle}) · <code>{pocEmail}</code>
            </div>
          </div>
        </div>
      )}

      {(running || brief) && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="section-header mb-0">Prep brief</h2>
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
              {brief && !running && (
                <>
                  <button onClick={copy} className="btn-secondary">
                    {copied ? "Copied" : "Copy markdown"}
                  </button>
                  <button onClick={exportPdf} className="btn-secondary">
                    Export PDF
                  </button>
                </>
              )}
            </div>
          </div>
          <div
            className="card-surface prose-editorial mt-2"
            dangerouslySetInnerHTML={{ __html: html || "<p><em>Drafting…</em></p>" }}
          />
        </div>
      )}

      {!brief && !running && !nextMeeting && (
        <div className="callout mt-6">
          <p>
            No meeting scheduled yet. When one lands on the calendar, the prep flow streams
            a structured brief — who they are, what they care about, five discovery
            questions, cases to cite, follow-up email draft, watch-outs.
          </p>
        </div>
      )}
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
