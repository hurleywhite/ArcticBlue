"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { marked } from "marked";
import { PARTNER_PRESETS, findPreset } from "@/lib/event-sourcer/partner-presets";

/*
  Event sourcer client.

  Required: partner name, focus, audience, themes, start date, end date.
  Optional: industry, regional scope, event-count range, halo cap,
  seed events.

  Submit → POST /api/event-sourcer → SSE stream of tokens. Output
  renders as markdown with editorial styling on top.
*/

type Inputs = {
  partnerName: string;
  partnerHomeBase: string;
  partnerFocus: string;
  audienceTargets: string;
  themeTargets: string;
  windowStart: string;
  windowEnd: string;
  regionalScope: string;
  industry: string;
  eventCountMin: string;
  eventCountMax: string;
  haloCapPercent: string;
  seedEvents: string;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const addMonthsISO = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

const INITIAL: Inputs = {
  partnerName: "",
  partnerHomeBase: "",
  partnerFocus: "",
  audienceTargets: "",
  themeTargets: "",
  windowStart: todayISO(),
  windowEnd: addMonthsISO(5),
  regionalScope: "Global",
  industry: "",
  eventCountMin: "",
  eventCountMax: "",
  haloCapPercent: "",
  seedEvents: "",
};

const STORAGE_KEY = "arcticmind:event-sourcer:last-inputs";

export function EventSourcerApp() {
  const [inputs, setInputs] = useState<Inputs>(INITIAL);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [presetId, setPresetId] = useState<string>("");
  const outputRef = useRef<HTMLDivElement | null>(null);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Inputs>;
        setInputs((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist any change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {}
  }, [inputs, hydrated]);

  // Auto-scroll the output container as new tokens stream in.
  useEffect(() => {
    if (!running || !outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output, running]);

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = findPreset(id);
    if (!p) return;
    setInputs((prev) => ({
      ...prev,
      partnerName: p.label,
      partnerHomeBase: p.homeBase,
      partnerFocus: p.focus,
      audienceTargets: p.audienceTargets,
      themeTargets: p.themeTargets,
      regionalScope: p.regionalScope ?? prev.regionalScope,
      haloCapPercent:
        typeof p.haloCapPercent === "number"
          ? String(p.haloCapPercent)
          : prev.haloCapPercent,
    }));
  };

  const resetForm = () => {
    setPresetId("");
    setInputs(INITIAL);
    setOutput("");
    setSource(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const downloadMarkdown = () => {
    if (!output) return;
    const filename = `events-${(inputs.partnerName || "partner")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${inputs.windowStart}-to-${inputs.windowEnd}.md`;
    const header = `# Event list — ${inputs.partnerName || "(unnamed partner)"}\n\n`;
    const meta = `_Window: ${inputs.windowStart} → ${inputs.windowEnd} · Region: ${
      inputs.regionalScope || "Global"
    }${inputs.industry ? ` · Industry: ${inputs.industry}` : ""}_\n\n---\n\n`;
    const blob = new Blob([header + meta + output], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const requiredOk =
    inputs.partnerName.trim() &&
    inputs.partnerFocus.trim() &&
    inputs.audienceTargets.trim() &&
    inputs.themeTargets.trim() &&
    inputs.windowStart &&
    inputs.windowEnd &&
    inputs.windowStart <= inputs.windowEnd;

  const run = async () => {
    if (running || !requiredOk) return;
    setRunning(true);
    setOutput("");
    setSource(null);
    try {
      const res = await fetch("/api/event-sourcer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: {
            partnerName: inputs.partnerName.trim(),
            partnerHomeBase: inputs.partnerHomeBase.trim(),
            partnerFocus: inputs.partnerFocus.trim(),
            audienceTargets: inputs.audienceTargets.trim(),
            themeTargets: inputs.themeTargets.trim(),
            windowStart: inputs.windowStart,
            windowEnd: inputs.windowEnd,
            regionalScope: inputs.regionalScope.trim() || "Global",
            industry: inputs.industry.trim() || undefined,
            seedEvents: inputs.seedEvents.trim() || undefined,
            eventCountMin: inputs.eventCountMin
              ? Number(inputs.eventCountMin)
              : undefined,
            eventCountMax: inputs.eventCountMax
              ? Number(inputs.eventCountMax)
              : undefined,
            haloCapPercent: inputs.haloCapPercent
              ? Number(inputs.haloCapPercent)
              : undefined,
          },
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => "");
        throw new Error(err || `Request failed: ${res.status}`);
      }
      setSource(res.headers.get("X-Arcticmind-Source"));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (typeof evt.text === "string") {
              setOutput((prev) => prev + evt.text);
            }
          } catch {}
        }
      }
    } catch (err) {
      setOutput(
        (prev) =>
          prev +
          `\n\n_[Error: ${err instanceof Error ? err.message : String(err)}]_`
      );
    } finally {
      setRunning(false);
    }
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const html = useMemo(
    () => (output ? (marked.parse(output, { async: false }) as string) : ""),
    [output]
  );

  return (
    <div>
      <div className="callout">
        <p>
          Partner inputs below augment the base system prompt. Required
          fields have a frost accent; everything else refines the run.
          Google Calendar and tracker-doc lookups are stubbed out until
          those integrations land.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,520px)_1fr]">
        {/* Left: form */}
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">Partner</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
            <button
              type="button"
              onClick={resetForm}
              className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
              style={{ color: "var(--fg-52)" }}
            >
              Reset
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="kicker-sm">Preset</span>
            <button
              type="button"
              className="chip"
              data-active={presetId === ""}
              onClick={() => setPresetId("")}
              disabled={running}
            >
              Blank
            </button>
            {PARTNER_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip"
                data-active={presetId === p.id}
                onClick={() => applyPreset(p.id)}
                disabled={running}
              >
                {p.label}
              </button>
            ))}
          </div>
          <FieldGrid>
            <Field label="Partner name" required>
              <input
                className="input"
                value={inputs.partnerName}
                onChange={(e) => set("partnerName", e.target.value)}
                placeholder="e.g. Thor Ernstsson"
                disabled={running}
              />
            </Field>
            <Field label="Home base" hint="Used for travel burden tagging.">
              <input
                className="input"
                value={inputs.partnerHomeBase}
                onChange={(e) => set("partnerHomeBase", e.target.value)}
                placeholder="e.g. Brooklyn, NY"
                disabled={running}
              />
            </Field>
            <Field label="Focus" required hint="1–2 sentences.">
              <textarea
                className="textarea"
                rows={3}
                value={inputs.partnerFocus}
                onChange={(e) => set("partnerFocus", e.target.value)}
                placeholder="Enterprise AI adoption in regulated industries. Speaking engagements reaching CIO / CAIO audiences."
                disabled={running}
              />
            </Field>
            <Field label="Audience targets" required>
              <input
                className="input"
                value={inputs.audienceTargets}
                onChange={(e) => set("audienceTargets", e.target.value)}
                placeholder="CIO, CAIO, Chief Data Officer, VP AI Strategy"
                disabled={running}
              />
            </Field>
            <Field label="Theme targets" required hint="3–6 themes, comma-separated.">
              <textarea
                className="textarea"
                rows={2}
                value={inputs.themeTargets}
                onChange={(e) => set("themeTargets", e.target.value)}
                placeholder="enterprise AI rollout, governance, agentic workflows, data foundations, measurable ROI"
                disabled={running}
              />
            </Field>
          </FieldGrid>

          <div className="mt-10 flex items-center gap-3">
            <span className="kicker">Window</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <FieldGrid>
            <Field label="Start date" required>
              <input
                type="date"
                className="input"
                value={inputs.windowStart}
                onChange={(e) => set("windowStart", e.target.value)}
                disabled={running}
              />
            </Field>
            <Field label="End date" required>
              <input
                type="date"
                className="input"
                value={inputs.windowEnd}
                onChange={(e) => set("windowEnd", e.target.value)}
                disabled={running}
              />
            </Field>
            <Field label="Regional scope">
              <select
                className="select"
                value={inputs.regionalScope}
                onChange={(e) => set("regionalScope", e.target.value)}
                disabled={running}
              >
                <option>Global</option>
                <option>North America + Europe only</option>
                <option>North America only</option>
                <option>US domestic only</option>
                <option>Europe only</option>
                <option>APAC only</option>
                <option>EMEA only</option>
              </select>
            </Field>
          </FieldGrid>

          <div className="mt-10 flex items-center gap-3">
            <span className="kicker">Refine (optional)</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <FieldGrid>
            <Field label="Industry" hint="Narrow the sourcing queries.">
              <input
                className="input"
                value={inputs.industry}
                onChange={(e) => set("industry", e.target.value)}
                placeholder="e.g. Financial services, Healthcare, Industrials"
                disabled={running}
              />
            </Field>
            <Field
              label="Event count"
              hint="Pick a specific number or a range. Default 15."
            >
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="input"
                  value={inputs.eventCountMin}
                  onChange={(e) => set("eventCountMin", e.target.value)}
                  placeholder="min"
                  min={1}
                  max={50}
                  style={{ width: "80px" }}
                  disabled={running}
                />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: "var(--fg-52)" }}
                >
                  to
                </span>
                <input
                  type="number"
                  className="input"
                  value={inputs.eventCountMax}
                  onChange={(e) => set("eventCountMax", e.target.value)}
                  placeholder="max"
                  min={1}
                  max={50}
                  style={{ width: "80px" }}
                  disabled={running}
                />
              </div>
            </Field>
            <Field
              label="Halo event cap"
              hint="% of list reserved for LEAP / TEDx / high-prestige summits. 0 for sponsorship-only."
            >
              <input
                type="number"
                className="input"
                value={inputs.haloCapPercent}
                onChange={(e) => set("haloCapPercent", e.target.value)}
                placeholder="default 10"
                min={0}
                max={40}
                style={{ width: "120px" }}
                disabled={running}
              />
            </Field>
            <Field
              label="Seed events"
              hint="Events the partner already tracks — flag for in-window status, don't re-propose."
            >
              <textarea
                className="textarea"
                rows={2}
                value={inputs.seedEvents}
                onChange={(e) => set("seedEvents", e.target.value)}
                placeholder="e.g. AWS re:Invent 2026; Gartner CIO Leadership Forum"
                disabled={running}
              />
            </Field>
          </FieldGrid>

          <div
            className="mt-8 flex items-center justify-between gap-3 border-t pt-5"
            style={{ borderTopColor: "var(--fg-16)" }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: requiredOk ? "var(--frost)" : "var(--fg-52)" }}
            >
              {requiredOk
                ? "Ready"
                : "Fill required fields (partner · focus · audience · themes · dates)"}
            </div>
            <button
              onClick={run}
              className="btn-primary"
              disabled={running || !requiredOk}
            >
              {running ? "Sourcing…" : output ? "Re-run" : "Source events →"}
            </button>
          </div>
        </div>

        {/* Right: output */}
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">Output</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
            {source && (
              <span
                className="font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
                style={{
                  padding: "3px 8px",
                  background:
                    source === "mock" ? "transparent" : "var(--ink-deep)",
                  border:
                    source === "mock"
                      ? "1px solid var(--fg-16)"
                      : "1px solid var(--frost)",
                  color: source === "mock" ? "var(--fg-52)" : "var(--frost)",
                  borderRadius: 2,
                }}
              >
                {source === "mock" ? "MOCK" : source.toUpperCase()}
              </span>
            )}
            {output && !running && (
              <>
                <button onClick={copy} className="btn-secondary">
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={downloadMarkdown} className="btn-secondary">
                  Download .md
                </button>
              </>
            )}
          </div>

          {!output && !running && <IdleState />}

          {(running || output) && (
            <motion.div
              ref={outputRef}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
              className="prose-editorial event-stream mt-4 px-6 py-5"
              style={{
                background: "var(--ink-raised)",
                border: "1px solid var(--fg-16)",
                borderRadius: 2,
                maxHeight: "calc(100vh - 220px)",
                overflowY: "auto",
              }}
            >
              {running && !output ? (
                <LoadingState />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-col gap-5">{children}</div>;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
          style={{ color: required ? "var(--frost)" : "var(--fg-52)" }}
        >
          {label}
          {required && <span style={{ marginLeft: 4 }}>·</span>}
          {required && (
            <span
              style={{ color: "var(--frost)", marginLeft: 4 }}
              aria-label="required"
            >
              required
            </span>
          )}
        </span>
      </div>
      {children}
      {hint && (
        <div
          className="mt-1.5 text-[11px] leading-[1.5]"
          style={{ color: "var(--fg-52)" }}
        >
          {hint}
        </div>
      )}
    </label>
  );
}

function IdleState() {
  return (
    <div
      className="mt-4 flex min-h-[360px] items-center justify-center px-6 py-10 text-center"
      style={{
        background: "var(--ink-raised)",
        border: "1px solid var(--fg-16)",
        borderRadius: 2,
      }}
    >
      <div>
        <div className="kicker-sm">Awaiting inputs</div>
        <p
          className="serif mt-3 max-w-md text-[16px] leading-[1.45]"
          style={{ color: "var(--fg-72)" }}
        >
          The event list renders here once the run completes. Primary stream
          first, halo candidates flagged at the tail.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3">
      <div className="kicker-sm flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: "var(--amber)",
            animation: "data-pulse 2.4s ease-in-out infinite",
          }}
        />
        Sourcing
      </div>
      <ol
        className="m-0 list-decimal pl-5 text-[13px] leading-[1.75]"
        style={{ color: "var(--fg-72)" }}
      >
        <li>Running primary + halo queries across the theme targets…</li>
        <li>Filtering for in-person, in-window, real venue…</li>
        <li>Verifying speaking / sponsorship routes on official pages…</li>
        <li>Sorting by start date + deduping across editions…</li>
      </ol>
      <div
        className="font-mono text-[10px] italic uppercase tracking-[0.14em]"
        style={{ color: "var(--fg-52)" }}
      >
        First tokens typically under 30 seconds.
      </div>
    </div>
  );
}
