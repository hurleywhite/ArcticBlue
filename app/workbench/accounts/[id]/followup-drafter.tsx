"use client";

import { useMemo, useState } from "react";
import { marked } from "marked";

/*
  Post-meeting follow-up drafter. Capture what happened + next steps,
  Claude drafts the email + proposal outline. Copy or export PDF.
*/

export function FollowupDrafter({
  accountId,
  accountName,
  pocName,
  pocEmail,
  onDrafted,
}: {
  accountId: string;
  accountName: string;
  pocName: string;
  pocEmail: string;
  onDrafted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [tone, setTone] = useState<"direct" | "warm" | "executive">("direct");
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (running || !summary.trim()) return;
    setRunning(true);
    setDraft("");
    setModel(null);
    try {
      const res = await fetch("/api/workbench/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName,
          pocName,
          pocEmail,
          meetingSummary: summary,
          nextSteps,
          tone,
        }),
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
      onDrafted?.();
    } catch (err) {
      setDraft(`_[Error: ${err instanceof Error ? err.message : String(err)}]_`);
    } finally {
      setRunning(false);
    }
  };

  const copy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const html = useMemo(
    () => (draft ? (marked.parse(draft, { async: false }) as string) : ""),
    [draft]
  );

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="section-header mb-0">Follow-up drafter</h2>
        <button
          onClick={() => setOpen(!open)}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
        >
          {open ? "Collapse" : draft ? "Open · has draft" : "Open"}
        </button>
      </div>

      {open && (
        <div className="mt-3 border border-ink-border bg-white">
          <div className="border-b border-ink-border bg-bg-card px-5 py-3 text-[12px] text-ink-muted">
            After a call: capture what happened + next steps. Claude drafts the email and a
            proposal outline.
          </div>
          <div className="px-5 py-4">
            <div className="mb-3">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                What happened in the meeting
              </div>
              <textarea
                className="textarea"
                rows={5}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Decisions made, questions asked, concerns raised, who pushed on what."
                disabled={running}
              />
            </div>
            <div className="mb-3">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                Next steps (if agreed)
              </div>
              <textarea
                className="textarea"
                rows={2}
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="e.g. Send pilot-scope draft by Friday. Loop in Legal before negotiation."
                disabled={running}
              />
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                Tone
              </span>
              {(["direct", "warm", "executive"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  disabled={running}
                  className={
                    tone === t
                      ? "border border-navy bg-navy px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                      : "border border-ink-border bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
                  }
                >
                  {t}
                </button>
              ))}
              <button
                onClick={run}
                disabled={running || !summary.trim()}
                className="btn-primary ml-auto"
              >
                {running ? "Drafting…" : draft ? "Re-draft" : "Draft email + outline →"}
              </button>
            </div>
          </div>
          {(running || draft) && (
            <div className="border-t border-ink-border px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  Draft
                </div>
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
                  {draft && !running && (
                    <button onClick={copy} className="btn-secondary">
                      {copied ? "Copied" : "Copy markdown"}
                    </button>
                  )}
                </div>
              </div>
              <div
                className="prose-editorial card-surface mt-2"
                dangerouslySetInnerHTML={{ __html: html || "<p><em>Drafting…</em></p>" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
