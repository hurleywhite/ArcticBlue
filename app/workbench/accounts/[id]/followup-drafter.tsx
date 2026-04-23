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
    <div className="mt-12">
      <div className="flex items-center gap-3">
        <span className="kicker">Follow-up drafter</span>
        <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
        <button
          onClick={() => setOpen(!open)}
          className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
          style={{ color: "var(--frost)" }}
        >
          {open ? "Collapse" : draft ? "Open · has draft" : "Open"}
        </button>
      </div>

      {open && (
        <div
          className="mt-4 overflow-hidden"
          style={{
            background: "var(--ink-raised)",
            border: "1px solid var(--fg-16)",
            borderRadius: 2,
          }}
        >
          <div
            className="px-6 py-3 text-[12px]"
            style={{
              background: "var(--ink-deep)",
              borderBottom: "1px solid var(--fg-16)",
              color: "var(--fg-72)",
            }}
          >
            After a call: capture what happened + next steps. Claude drafts the email and a
            proposal outline.
          </div>
          <div className="px-6 py-5">
            <div className="mb-4">
              <div className="kicker-sm mb-1.5">
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
            <div className="mb-4">
              <div className="kicker-sm mb-1.5">
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="kicker-sm">Tone</span>
              {(["direct", "warm", "executive"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  disabled={running}
                  className="chip"
                  data-active={tone === t}
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
            <div
              className="border-t px-6 py-5"
              style={{ borderTopColor: "var(--fg-16)" }}
            >
              <div className="flex items-center gap-3">
                <span className="kicker-sm">Draft</span>
                <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
                {model && (
                  <span
                    className="font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
                    style={{
                      padding: "3px 8px",
                      background:
                        model === "mock" ? "transparent" : "var(--ink-deep)",
                      border:
                        model === "mock"
                          ? "1px solid var(--fg-16)"
                          : "1px solid var(--frost)",
                      color:
                        model === "mock" ? "var(--fg-52)" : "var(--frost)",
                      borderRadius: 2,
                    }}
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
              <div
                className="prose-editorial mt-3 px-5 py-4"
                style={{
                  background: "var(--ink-deep)",
                  border: "1px solid var(--fg-16)",
                  borderRadius: 2,
                }}
                dangerouslySetInnerHTML={{ __html: html || "<p><em>Drafting…</em></p>" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
