"use client";

import { useState } from "react";
import type { AnalyzerResult } from "@/lib/analyzer/types";
import { CATEGORY_LABELS, EMPTY_TECH_STACK } from "@/lib/analyzer/types";

/*
  Company Analyzer front-end. Editorial re-skin of the tech-stack-
  analyzer UI: navy band, table-based layout for the tech stack,
  callouts for the actionable insights, hairline borders everywhere.
*/

const CONFIDENCE_TONE: Record<string, string> = {
  high: "border-navy bg-ice text-navy",
  medium: "border-ink-border bg-bg-card text-ink",
  low: "border-ink-border bg-white text-ink-muted",
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
          Enter a company domain (e.g. <code>snowflake.com</code>). The analyzer
          queries Google Jobs via SerpAPI for active listings, then uses Claude
          Sonnet to extract named technologies. Claude also runs a web-search
          enrichment pass for products, competitors, and recent AI signals —
          ready to feed into company profiles and Canvas scoping.
        </p>
      </div>

      <form
        onSubmit={analyze}
        className="mt-6 flex flex-col items-stretch gap-3 border border-ink-border bg-bg-card px-4 py-3 md:flex-row md:items-center"
      >
        <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy md:w-40">
          Company URL
        </label>
        <input
          className="input flex-1"
          placeholder="snowflake.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary shrink-0" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze →"}
        </button>
      </form>

      {loading && (
        <div className="mt-6 border border-ink-border bg-white px-5 py-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
            Working
          </div>
          <ol className="mt-2 list-decimal pl-5 text-[13px] leading-[1.6]">
            <li>Querying SerpAPI for public job listings…</li>
            <li>Extracting named technologies with Claude Sonnet 4.6…</li>
            <li>Running web-search enrichment for products, competitors, news…</li>
            <li>Merging sources and returning result…</li>
          </ol>
          <div className="mt-3 text-[11px] italic text-ink-muted">
            Expect 20–90 seconds on a fresh domain.
          </div>
        </div>
      )}

      {error && (
        <div className="callout mt-6" style={{ background: "#F6E1DE", borderLeftColor: "#8B1F1F" }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            Couldn't analyze
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {result && <ResultView result={result} copyJson={copyJson} copied={copied} showJson={showJson} setShowJson={setShowJson} />}
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

  return (
    <>
      {/* Header band */}
      <div className="mt-8 bg-navy px-6 py-4 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
              {result.domain}
              {result.industry && <> · {result.industry}</>}
              {result.headquarters && <> · {result.headquarters}</>}
            </div>
            <h2 className="mt-1 text-[22px] font-bold leading-[1.15]">
              {result.company}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                CONFIDENCE_TONE[result.confidence] ?? CONFIDENCE_TONE.low
              }`}
              style={{ background: "#fff" }}
              title={`${result.jobs_analyzed} job listings · ${result.enrichment_source}`}
            >
              Confidence · {result.confidence}
            </span>
            <span className="border border-white/40 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              {result.jobs_analyzed} jobs
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-[1.55]">{result.summary}</p>

      <div className="mt-5 grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-4">
        <Stat label="Industry" value={result.industry || "—"} />
        <Stat label="Size" value={result.employee_count_estimate || "unknown"} />
        <Stat label="Founded" value={result.founded_year ?? "—"} />
        <Stat label="HQ" value={result.headquarters ?? "—"} last />
      </div>

      {/* AI adoption + actionable insights callouts */}
      {result.ai_adoption && (
        <div className="callout mt-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            AI adoption signals
          </div>
          <p className="mt-1">{result.ai_adoption}</p>
        </div>
      )}

      {result.actionable_insights && result.actionable_insights.length > 0 && (
        <>
          <h3 className="section-header mt-8 mb-2">What this tells you</h3>
          <ul className="m-0 list-disc pl-6 text-[13px] leading-[1.6]">
            {result.actionable_insights.map((ins, i) => (
              <li key={i}>{ins}</li>
            ))}
          </ul>
        </>
      )}

      {/* Products / Services / Competitors */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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

      {/* Tech stack table */}
      <h3 className="section-header mt-10 mb-3">Tech stack</h3>
      {nonEmptyCats.length === 0 ? (
        <div className="card-surface text-[13px] italic text-ink-muted">
          No named technologies extracted. Try a company with active public job listings.
        </div>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th style={{ width: "24%" }}>Category</th>
              <th>Technologies</th>
            </tr>
          </thead>
          <tbody>
            {nonEmptyCats.map((cat) => (
              <tr key={cat}>
                <td>
                  <strong>{CATEGORY_LABELS[cat]}</strong>
                  <div className="mt-0.5 text-[11px] text-ink-muted">
                    {(stack[cat] ?? []).length} items
                  </div>
                </td>
                <td>
                  <Chips items={stack[cat] ?? []} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Recent news */}
      {result.recent_news.length > 0 && (
        <>
          <h3 className="section-header mt-10 mb-3">Recent signals</h3>
          <ul className="m-0 list-disc pl-6 text-[13px] leading-[1.6]">
            {result.recent_news.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </>
      )}

      {/* Footer actions */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-border pt-5">
        <div className="text-[11px] text-ink-muted">
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
        <pre className="mt-4 max-h-[480px] overflow-auto border border-ink-border bg-bg-card p-4 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[11px] leading-[1.55]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </>
  );
}

function Stat({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div className={`bg-bg-card px-5 py-4 ${last ? "" : "md:border-r md:border-ink-border"} border-b border-ink-border md:border-b-0`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">{label}</div>
      <div className="mt-1 text-[13px] font-bold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-ink-border bg-white px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="border border-ink-border bg-white px-2 py-0.5 text-[11px]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
