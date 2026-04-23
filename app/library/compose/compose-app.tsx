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
          sentence of context, Claude drafts the proposal body. You&apos;ll edit from there.
        </p>
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="kicker">Context</span>
          <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
        </div>
        <div
          className="mt-4 overflow-hidden"
          style={{
            background: "var(--ink-raised)",
            border: "1px solid var(--fg-16)",
            borderRadius: 2,
          }}
        >
          <div
            className="grid grid-cols-1 gap-0 md:grid-cols-[220px_1fr]"
            style={{ borderBottom: "1px solid var(--fg-16)" }}
          >
            <div
              className="px-5 py-4"
              style={{
                background: "var(--ink-deep)",
                borderRight: "1px solid var(--fg-16)",
              }}
            >
              <div className="kicker-sm">Prospect (optional)</div>
            </div>
            <div className="px-5 py-4">
              <input
                className="input"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Glacier Financial"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-0 md:grid-cols-[220px_1fr]">
            <div
              className="px-5 py-4"
              style={{
                background: "var(--ink-deep)",
                borderRight: "1px solid var(--fg-16)",
              }}
            >
              <div className="kicker-sm">Situation note</div>
              <div
                className="mt-1.5 text-[11px] leading-[1.5]"
                style={{ color: "var(--fg-52)" }}
              >
                What&apos;s going on, what they care about.
              </div>
            </div>
            <div className="px-5 py-4">
              <textarea
                className="textarea"
                rows={3}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Advisor-facing AI tools uneven across 14 regional offices. Wants a program that compounds, not a one-off workshop. Budget signaled; legal reviewing MSA."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <span className="kicker">Pick items</span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: "var(--frost)" }}
          >
            {picks.size} selected
            {pickedCases > 0 && ` · ${pickedCases} case${pickedCases === 1 ? "" : "s"}`}
          </span>
          <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
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
            placeholder="Search title or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            style={{ maxWidth: 320, background: "var(--ink-deep)" }}
          />
          <span className="mx-1 h-4 w-px" style={{ background: "var(--fg-16)" }} />
          <button
            className="chip"
            data-active={kindFilter === "all"}
            onClick={() => setKindFilter("all")}
          >
            All
          </button>
          {(["case", "prompt", "template", "resource", "module"] as const).map((k) => (
            <button
              key={k}
              className="chip"
              data-active={kindFilter === k}
              onClick={() => setKindFilter(k)}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>

        <div
          className="mt-4 grid grid-cols-1 gap-px overflow-hidden md:grid-cols-2"
          style={{ background: "var(--fg-16)" }}
        >
          {filtered.map((it) => {
            const picked = picks.has(it.id);
            return (
              <button
                key={it.id}
                onClick={() => togglePick(it.id)}
                className="group relative block w-full text-left"
                style={{
                  background: picked
                    ? "rgba(139, 178, 237, 0.08)"
                    : "var(--ink-raised)",
                  transition: "background 180ms cubic-bezier(0.2, 0.7, 0.2, 1)",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition-opacity duration-250"
                  style={{
                    boxShadow: picked
                      ? "inset 0 0 0 1px var(--frost)"
                      : "inset 0 0 0 1px var(--frost-glow)",
                    opacity: picked ? 1 : 0,
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
                  style={{ boxShadow: "inset 0 0 0 1px var(--frost-glow)" }}
                />
                <div className="relative flex items-start justify-between px-4 py-3">
                  <div className="flex-1">
                    <div className="kicker-sm">
                      {KIND_LABEL[it.kind]} · {it.stat}
                    </div>
                    <div
                      className="serif mt-1.5 text-[14px] leading-[1.25]"
                      style={{ color: "var(--fg-100)" }}
                    >
                      {it.title}
                    </div>
                    <p
                      className="mt-1.5 text-[11.5px] leading-[1.5]"
                      style={{ color: "var(--fg-52)" }}
                    >
                      {it.description.length > 140
                        ? it.description.slice(0, 140) + "…"
                        : it.description}
                    </p>
                  </div>
                  <div
                    className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center font-mono text-[11px]"
                    style={{
                      background: picked ? "var(--frost)" : "transparent",
                      border: `1px solid ${picked ? "var(--frost)" : "var(--fg-32)"}`,
                      color: "var(--ink-deep)",
                      borderRadius: 2,
                    }}
                  >
                    {picked ? "✓" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div
        className="mt-8 flex items-center justify-between border-t pt-5"
        style={{ borderTopColor: "var(--fg-16)" }}
      >
        <div
          className="font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: "var(--fg-52)" }}
        >
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
        <section className="mt-12">
          <div className="flex items-center gap-3">
            <span className="kicker">Draft</span>
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
                  color: model === "mock" ? "var(--fg-52)" : "var(--frost)",
                  borderRadius: 2,
                }}
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
          <div
            className="prose-editorial mt-4 px-6 py-5"
            style={{
              background: "var(--ink-raised)",
              border: "1px solid var(--fg-16)",
              borderRadius: 2,
            }}
            dangerouslySetInnerHTML={{ __html: html || "<p><em>Drafting…</em></p>" }}
          />
        </section>
      )}
    </div>
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
