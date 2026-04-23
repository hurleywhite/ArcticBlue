"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AnalyzerResult } from "@/lib/analyzer/types";
import { CATEGORY_LABELS, EMPTY_TECH_STACK } from "@/lib/analyzer/types";

const CONFIDENCE_STYLE: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  high: {
    bg: "var(--ink-deep)",
    border: "var(--frost)",
    color: "var(--frost)",
  },
  medium: {
    bg: "var(--ink-raised)",
    border: "var(--fg-32)",
    color: "var(--fg-100)",
  },
  low: {
    bg: "transparent",
    border: "var(--fg-16)",
    color: "var(--fg-52)",
  },
};

export function AnalyzerApp() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyzer/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyUrl: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed: ${res.status}`);
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <>
      <div className="callout mt-6">
        <p>
          Enter a company domain (e.g. <code>snowflake.com</code>). Apollo firmographics,
          Exa neural search for recent content, and Claude synthesis — returns a full
          profile ready to feed into company scoping.
        </p>
      </div>

      <form
        onSubmit={analyze}
        className="mt-8 flex flex-col items-stretch gap-3 px-4 py-3 md:flex-row md:items-center"
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--fg-16)",
          borderRadius: 2,
        }}
      >
        <label className="kicker md:w-40">Company URL</label>
        <input
          className="input flex-1"
          placeholder="snowflake.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          style={{ background: "var(--ink-deep)" }}
        />
        <button type="submit" className="btn-primary shrink-0" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze →"}
        </button>
      </form>

      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          className="mt-8 px-6 py-5"
          style={{
            background: "var(--ink-raised)",
            border: "1px solid var(--fg-16)",
            borderRadius: 2,
          }}
        >
          <div className="kicker-sm flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--amber)",
                animation: "data-pulse 2.4s ease-in-out infinite",
              }}
            />
            Working
          </div>
          <ol
            className="mt-3 list-decimal pl-5 text-[13px] leading-[1.75]"
            style={{ color: "var(--fg-72)" }}
          >
            <li>Querying Apollo for firmographics…</li>
            <li>Exa neural search across recent signals…</li>
            <li>Claude Sonnet synthesis of tech stack + AI posture…</li>
            <li>Merging and returning result…</li>
          </ol>
          <div
            className="mt-3 font-mono text-[11px] italic"
            style={{ color: "var(--fg-52)" }}
          >
            Expect 20–90 seconds on a fresh domain.
          </div>
        </motion.div>
      )}

      {error && (
        <div
          className="callout mt-6"
          style={{ borderLeftColor: "var(--rose)" }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: "var(--rose)" }}
          >
            Couldn&apos;t analyze
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {result && (
        <ResultView
          result={result}
          copyJson={copyJson}
          copied={copied}
          showJson={showJson}
          setShowJson={setShowJson}
        />
      )}
    </>
  );
}

function ResultView({
  result,
  copyJson,
  copied,
  showJson,
  setShowJson,
}: {
  result: AnalyzerResult;
  copyJson: () => void;
  copied: boolean;
  showJson: boolean;
  setShowJson: (v: boolean) => void;
}) {
  const stack = { ...EMPTY_TECH_STACK, ...result.tech_stack };
  const nonEmptyCats = (Object.keys(stack) as Array<keyof typeof stack>).filter(
    (c) => (stack[c] ?? []).length > 0
  );
  const confStyle =
    CONFIDENCE_STYLE[result.confidence] ?? CONFIDENCE_STYLE.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {/* Header band — dark with frost accent rail */}
      <div
        className="relative mt-10 overflow-hidden"
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
        <div className="flex flex-wrap items-start justify-between gap-3 px-7 py-5">
          <div>
            <div className="kicker-sm">
              {result.domain}
              {result.industry && <> · {result.industry}</>}
              {result.headquarters && <> · {result.headquarters}</>}
            </div>
            <h2
              className="serif-tight mt-2 text-[28px] leading-[1.1]"
              style={{ color: "var(--fg-100)" }}
            >
              {result.company}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
              style={{
                padding: "4px 8px",
                background: confStyle.bg,
                border: `1px solid ${confStyle.border}`,
                color: confStyle.color,
                borderRadius: 2,
              }}
              title={`${result.jobs_analyzed} job listings · ${result.enrichment_source}`}
            >
              Confidence · {result.confidence}
            </span>
            <span
              className="font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
              style={{
                padding: "4px 8px",
                background: "transparent",
                border: "1px solid var(--fg-16)",
                color: "var(--fg-72)",
                borderRadius: 2,
              }}
            >
              {result.jobs_analyzed} jobs
            </span>
          </div>
        </div>
      </div>

      <p
        className="mt-6 text-[15px] leading-[1.65]"
        style={{ color: "var(--fg-72)" }}
      >
        {result.summary}
      </p>

      <div
        className="mt-6 grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4"
        style={{ background: "var(--fg-16)" }}
      >
        <Stat label="Industry" value={result.industry || "—"} />
        <Stat label="Size" value={result.employee_count_estimate || "unknown"} />
        <Stat label="Founded" value={result.founded_year ?? "—"} />
        <Stat label="HQ" value={result.headquarters ?? "—"} />
      </div>

      {result.ai_adoption && (
        <div className="callout mt-8">
          <div className="kicker-frost">AI adoption signals</div>
          <p className="mt-2">{result.ai_adoption}</p>
        </div>
      )}

      {result.actionable_insights && result.actionable_insights.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-3">
            <span className="kicker">What this tells you</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <ul
            className="m-0 mt-4 list-none p-0"
            style={{ color: "var(--fg-72)" }}
          >
            {result.actionable_insights.map((ins, i) => (
              <li
                key={i}
                className="flex gap-4 py-2.5 text-[14px] leading-[1.6]"
                style={{
                  borderBottom:
                    i === result.actionable_insights.length - 1
                      ? "none"
                      : "1px solid var(--fg-16)",
                }}
              >
                <span
                  className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: "var(--frost)", minWidth: 24 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden md:grid-cols-3"
        style={{ background: "var(--fg-16)" }}
      >
        {result.products.length > 0 && (
          <Panel title="Products">
            <Chips items={result.products} />
          </Panel>
        )}
        {result.services.length > 0 && (
          <Panel title="Services">
            <Chips items={result.services} />
          </Panel>
        )}
        {result.competitors.length > 0 && (
          <Panel title="Competitors">
            <Chips items={result.competitors} />
          </Panel>
        )}
      </div>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <span className="kicker">Tech stack</span>
          <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
        </div>
        {nonEmptyCats.length === 0 ? (
          <div
            className="mt-4 px-5 py-6 text-center text-[13px] italic"
            style={{
              background: "var(--ink-raised)",
              border: "1px solid var(--fg-16)",
              color: "var(--fg-52)",
              borderRadius: 2,
            }}
          >
            No named technologies extracted. Try a company with active public job listings.
          </div>
        ) : (
          <div
            className="mt-4 overflow-hidden"
            style={{ border: "1px solid var(--fg-16)", borderRadius: 2 }}
          >
            {nonEmptyCats.map((cat, idx) => (
              <div
                key={cat}
                className="grid grid-cols-1 gap-0 md:grid-cols-[220px_1fr]"
                style={{
                  background: "var(--ink-raised)",
                  borderBottom:
                    idx === nonEmptyCats.length - 1
                      ? "none"
                      : "1px solid var(--fg-16)",
                }}
              >
                <div
                  className="px-5 py-4"
                  style={{
                    background: "var(--ink-deep)",
                    borderRight: "1px solid var(--fg-16)",
                  }}
                >
                  <div className="kicker-sm">{CATEGORY_LABELS[cat]}</div>
                  <div
                    className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: "var(--frost)" }}
                  >
                    {(stack[cat] ?? []).length} items
                  </div>
                </div>
                <div className="px-5 py-4">
                  <Chips items={stack[cat] ?? []} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {result.recent_news.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3">
            <span className="kicker">Recent signals</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <ul className="m-0 mt-4 list-none p-0">
            {result.recent_news.map((n, i) => (
              <li
                key={i}
                className="flex gap-4 py-2.5 text-[13px] leading-[1.6]"
                style={{
                  color: "var(--fg-72)",
                  borderBottom:
                    i === result.recent_news.length - 1
                      ? "none"
                      : "1px solid var(--fg-16)",
                }}
              >
                <span
                  aria-hidden
                  className="shrink-0 h-1.5 w-1.5 rounded-full self-center"
                  style={{ background: "var(--frost-deep)" }}
                />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div
        className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
        style={{ borderTopColor: "var(--fg-16)" }}
      >
        <div
          className="font-mono text-[11px]"
          style={{ color: "var(--fg-52)" }}
        >
          Analyzed {new Date(result.last_analyzed).toLocaleString()} · source:{" "}
          {result.enrichment_source.replace("_", " + ")}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowJson(!showJson)} className="btn-secondary">
            {showJson ? "Hide JSON" : "Show JSON"}
          </button>
          <button onClick={copyJson} className="btn-secondary">
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </div>

      {showJson && (
        <pre
          className="mt-4 max-h-[480px] overflow-auto px-4 py-4 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[11px] leading-[1.55]"
          style={{
            background: "var(--ink-deep)",
            border: "1px solid var(--fg-16)",
            color: "var(--fg-100)",
            borderRadius: 2,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="px-5 py-4"
      style={{ background: "var(--ink-raised)" }}
    >
      <div className="kicker-sm">{label}</div>
      <div
        className="serif mt-2 text-[16px] leading-[1.2]"
        style={{ color: "var(--fg-100)" }}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="px-5 py-4"
      style={{ background: "var(--ink-raised)" }}
    >
      <div className="kicker-sm">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="font-mono text-[11px]"
          style={{
            padding: "3px 8px",
            background: "var(--ink-deep)",
            border: "1px solid var(--fg-16)",
            color: "var(--fg-100)",
            borderRadius: 2,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
