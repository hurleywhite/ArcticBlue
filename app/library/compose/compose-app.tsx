"use client";

import { useMemo, useState } from "react";
import { marked } from "marked";

/*
  Proposal composer. Pick library items, add a situation note, stream
  a proposal draft from Claude. Copy markdown or print to PDF.
*/

type Item = {
  id: string;
  kind: "prompt" | "template" | "case" | "resource" | "module";
  title: string;
  description: string;
  stat: string;
  topics: string[];
};

const KIND_LABEL: Record<Item["kind"], string> = {
  prompt: "Prompt",
  template: "Template",
  case: "Case",
  resource: "Resource",
  module: "Module",
};

export function ComposeApp({ items }: { items: Item[] }) {
  const [accountName, setAccountName] = useState("");
  const [situation, setSituation] = useState("");
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<Item["kind"] | "all">("all");
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (kindFilter !== "all" && i.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.topics.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, query, kindFilter]);

  const togglePick = (id: string) => {
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const run = async () => {
    if (running || !situation.trim() || picks.size === 0) return;
    setRunning(true);
    setDraft("");
    setModel(null);
    try {
      const pickedItems = items
        .filter((i) => picks.has(i.id))
        .map((i) => ({
          kind: i.kind,
          title: i.title,
          description: i.description,
          stat: i.stat,
        }));
      const res = await fetch("/api/library/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName: accountName.trim() || undefined,
          situationNote: situation,
          picks: pickedItems,
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

  const exportPdf = () => {
    if (!draft || typeof window === "undefined") return;
    const html = marked.parse(draft, { async: false }) as string;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Proposal · ${escapeHtml(accountName || "Draft")}</title>
      <style>
        @page { margin: 0.5in; }
        body { font-family: Arial, Helvetica, sans-serif; max-width: 880px; margin: 0 auto; padding: 28px; color: #1A1A1A; font-size: 13px; line-height: 1.55; }
        .band { background: #1F3A5F; color: #fff; padding: 14px 18px; margin-bottom: 18px; }
        .band h1 { margin: 4px 0 0; font-size: 20px; }
        h1,h2,h3 { color: #1F3A5F; }
        h2 { font-size: 16px; margin-top: 22px; }
        blockquote { background: #D5E8F0; border-left: 3px solid #1F3A5F; padding: 12px 16px; margin: 10px 0; }
        footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #CCC; color: #555; font-size: 11px; }
      </style>
    </head><body>
      <div class="band"><h1>Proposal · ${escapeHtml(accountName || "Draft")}</h1></div>
      ${html}
      <footer>Drafted ${new Date().toLocaleDateString()} · ArcticBlue · Confidential</footer>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const html = useMemo(
    () => (draft ? (marked.parse(draft, { async: false }) as string) : ""),
    [draft]
  );

  const pickedCases = items.filter((i) => picks.has(i.id) && i.kind === "case").length;
  const pickedOther = picks.size - pickedCases;

  return (
    <div className="mt-6">
      <div className="callout">
        <p>
          Pick 3–5 library items (usually 2–4 cases plus a prompt or template), add one
          sentence of context, Claude drafts the proposal body. You'll edit from there.
        </p>
      </div>

      <h2 className="section-header mt-8 mb-3">Context</h2>
      <table className="doc-table">
        <tbody>
          <tr>
            <td style={{ width: "24%", verticalAlign: "top" }}>
              <strong>Prospect (optional)</strong>
            </td>
            <td>
              <input
                className="input"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Glacier Financial"
              />
            </td>
          </tr>
          <tr>
            <td style={{ width: "24%", verticalAlign: "top" }}>
              <strong>Situation note</strong>
              <div className="mt-0.5 text-[11px] text-ink-muted">
                What's going on, what they care about.
              </div>
            </td>
            <td>
              <textarea
                className="textarea"
                rows={3}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Advisor-facing AI tools uneven across 14 regional offices. Wants a program that compounds, not a one-off workshop. Budget signaled; legal reviewing MSA."
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="section-header mt-8 mb-3">
        Pick items ·{" "}
        <span className="font-normal text-ink">
          {picks.size} selected
          {pickedCases > 0 && ` (${pickedCases} case${pickedCases === 1 ? "" : "s"})`}
        </span>
      </h2>

      <div className="flex flex-wrap items-center gap-2 border border-ink-border bg-bg-card px-4 py-3">
        <input
          type="search"
          placeholder="Search title or description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
          style={{ maxWidth: 320 }}
        />
        <span className="mx-2 h-4 w-px bg-ink-border" />
        <KindChip active={kindFilter === "all"} onClick={() => setKindFilter("all")}>
          All
        </KindChip>
        {(["case", "prompt", "template", "resource", "module"] as const).map((k) => (
          <KindChip key={k} active={kindFilter === k} onClick={() => setKindFilter(k)}>
            {KIND_LABEL[k]}
          </KindChip>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        {filtered.map((it) => {
          const picked = picks.has(it.id);
          return (
            <button
              key={it.id}
              onClick={() => togglePick(it.id)}
              className={`block w-full border text-left transition ${
                picked ? "border-navy bg-ice" : "border-ink-border bg-white hover:border-navy"
              }`}
            >
              <div className="flex items-start justify-between px-3 py-2">
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    {KIND_LABEL[it.kind]} · {it.stat}
                  </div>
                  <div className="mt-0.5 text-[12px] font-bold leading-[1.3] text-navy">
                    {it.title}
                  </div>
                  <p className="mt-1 text-[11px] leading-[1.45] text-ink-muted line-clamp-2">
                    {it.description}
                  </p>
                </div>
                <div
                  className={
                    picked
                      ? "ml-3 h-5 w-5 shrink-0 border border-navy bg-navy text-center text-[11px] font-bold text-white"
                      : "ml-3 h-5 w-5 shrink-0 border border-ink-border bg-white"
                  }
                >
                  {picked ? "✓" : ""}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-ink-border pt-4">
        <div className="text-[11px] text-ink-muted">
          {picks.size} selected · {pickedOther} prompts/templates · {pickedCases} cases
        </div>
        <button
          onClick={run}
          disabled={running || !situation.trim() || picks.size === 0}
          className="btn-primary"
        >
          {running ? "Drafting…" : draft ? "Re-draft" : "Draft proposal →"}
        </button>
      </div>

      {(running || draft) && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="section-header mb-0">Draft</h2>
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
    </div>
  );
}

function KindChip({
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
