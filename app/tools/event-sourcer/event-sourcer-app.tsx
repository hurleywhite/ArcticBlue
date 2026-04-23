"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { marked } from "marked";
import { PARTNER_PRESETS, findPreset } from "@/lib/event-sourcer/partner-presets";
import { composeUserMessage } from "@/lib/event-sourcer/compose";
import {
  parseEventOutput,
  streamClassifyState,
  type ParsedEvent,
} from "@/lib/event-sourcer/parse";

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
  const [showPrompt, setShowPrompt] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customizingPartner, setCustomizingPartner] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "markdown">("cards");
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
    if (id === "") {
      setCustomizingPartner(true);
      return;
    }
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
    setCustomizingPartner(false);
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

  const parsed = useMemo(() => parseEventOutput(output), [output]);
  const streamStatus = useMemo(() => streamClassifyState(output), [output]);

  const previewUserMessage = useMemo(() => {
    if (!requiredOk) return "";
    return composeUserMessage({
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
    });
  }, [inputs, requiredOk]);

  const selectedPreset = findPreset(presetId);

  return (
    <div>
      <div className="mt-2 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,480px)_1fr]">
        {/* Left: form */}
        <div>
          {/* Preset row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker">Partner</span>
            <button
              type="button"
              className="chip"
              data-active={presetId === ""}
              onClick={() => applyPreset("")}
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
            <span className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
                style={{ color: "var(--fg-52)" }}
              >
                Reset
              </button>
            </span>
          </div>

          {/* Partner details — compact summary when a preset is picked,
              editable fields when Blank or user clicks Customize. */}
          {selectedPreset && !customizingPartner ? (
            <div
              className="mt-4 flex items-start gap-4 px-5 py-4"
              style={{
                background: "var(--ink-raised)",
                border: "1px solid var(--fg-16)",
                borderRadius: 2,
              }}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="serif text-[16px] leading-[1.2]"
                  style={{ color: "var(--fg-100)" }}
                >
                  {inputs.partnerName || selectedPreset.label}
                </div>
                <p
                  className="mt-1.5 text-[12.5px] leading-[1.55]"
                  style={{ color: "var(--fg-72)" }}
                >
                  {inputs.partnerFocus || selectedPreset.focus}
                </p>
                <div
                  className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--fg-52)" }}
                >
                  {inputs.audienceTargets.split(",").slice(0, 4).join(" · ")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingPartner(true)}
                className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
                style={{ color: "var(--frost)" }}
                disabled={running}
              >
                Edit →
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Partner name" required>
                <input
                  className="input"
                  value={inputs.partnerName}
                  onChange={(e) => set("partnerName", e.target.value)}
                  placeholder="e.g. Thor Ernstsson"
                  disabled={running}
                />
              </Field>
              <Field label="Focus" required>
                <textarea
                  className="textarea"
                  rows={2}
                  value={inputs.partnerFocus}
                  onChange={(e) => set("partnerFocus", e.target.value)}
                  placeholder="Enterprise AI adoption in regulated industries. Speaking engagements reaching CIO / CAIO audiences."
                  disabled={running}
                />
              </Field>
              <Field label="Audience" required>
                <input
                  className="input"
                  value={inputs.audienceTargets}
                  onChange={(e) => set("audienceTargets", e.target.value)}
                  placeholder="CIO, CAIO, Chief Data Officer"
                  disabled={running}
                />
              </Field>
              <Field label="Themes" required>
                <input
                  className="input"
                  value={inputs.themeTargets}
                  onChange={(e) => set("themeTargets", e.target.value)}
                  placeholder="enterprise AI rollout, governance, agentic workflows, measurable ROI"
                  disabled={running}
                />
              </Field>
              {selectedPreset && customizingPartner && (
                <button
                  type="button"
                  onClick={() => setCustomizingPartner(false)}
                  className="self-start font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
                  style={{ color: "var(--fg-52)" }}
                >
                  ← Collapse
                </button>
              )}
            </div>
          )}

          {/* Window — dates + region on one row */}
          <div className="mt-8 flex items-center gap-3">
            <span className="kicker">Window</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_180px]">
            <Field label="From" required tight>
              <input
                type="date"
                className="input"
                value={inputs.windowStart}
                onChange={(e) => set("windowStart", e.target.value)}
                disabled={running}
              />
            </Field>
            <Field label="To" required tight>
              <input
                type="date"
                className="input"
                value={inputs.windowEnd}
                onChange={(e) => set("windowEnd", e.target.value)}
                disabled={running}
              />
            </Field>
            <Field label="Region" tight>
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
          </div>

          {/* More options disclosure — industry, count, halo, home base, seeds */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
              style={{ color: "var(--frost)" }}
              disabled={running}
            >
              {showAdvanced ? "− Fewer options" : "+ More options"}
            </button>

            {showAdvanced && (
              <div className="mt-4 flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_140px]">
                  <Field label="Industry" tight>
                    <input
                      className="input"
                      value={inputs.industry}
                      onChange={(e) => set("industry", e.target.value)}
                      placeholder="Financial services, Healthcare…"
                      disabled={running}
                    />
                  </Field>
                  <Field label="Count (min–max)" tight>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        className="input"
                        value={inputs.eventCountMin}
                        onChange={(e) => set("eventCountMin", e.target.value)}
                        placeholder="min"
                        min={1}
                        max={50}
                        disabled={running}
                      />
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: "var(--fg-52)" }}
                      >
                        –
                      </span>
                      <input
                        type="number"
                        className="input"
                        value={inputs.eventCountMax}
                        onChange={(e) => set("eventCountMax", e.target.value)}
                        placeholder="max"
                        min={1}
                        max={50}
                        disabled={running}
                      />
                    </div>
                  </Field>
                  <Field label="Halo %" tight>
                    <input
                      type="number"
                      className="input"
                      value={inputs.haloCapPercent}
                      onChange={(e) => set("haloCapPercent", e.target.value)}
                      placeholder="10"
                      min={0}
                      max={40}
                      disabled={running}
                    />
                  </Field>
                </div>
                <Field label="Home base" tight hint="Sets travel-burden tagging.">
                  <input
                    className="input"
                    value={inputs.partnerHomeBase}
                    onChange={(e) => set("partnerHomeBase", e.target.value)}
                    placeholder="e.g. Brooklyn, NY"
                    disabled={running}
                  />
                </Field>
                <Field
                  label="Seed events"
                  tight
                  hint="Partner's existing tracker — checked, not re-proposed."
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
              </div>
            )}
          </div>

          {requiredOk && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowPrompt((s) => !s)}
                className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
                style={{ color: "var(--frost)" }}
              >
                {showPrompt ? "Hide Dust prompt" : "Show Dust prompt"} →
              </button>
              {showPrompt && (
                <pre
                  className="mt-3 max-h-[280px] overflow-auto px-4 py-3 text-[11.5px] leading-[1.6] whitespace-pre-wrap"
                  style={{
                    background: "var(--ink-deep)",
                    border: "1px solid var(--fg-16)",
                    color: "var(--fg-72)",
                    fontFamily:
                      "var(--font-ibm-plex-mono), ui-monospace, monospace",
                    borderRadius: 2,
                  }}
                >
                  {previewUserMessage}
                </pre>
              )}
            </div>
          )}

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
          <div className="flex flex-wrap items-center gap-3">
            <span className="kicker">Output</span>
            {parsed.events.length > 0 && (
              <span
                className="font-mono text-[10px] uppercase tracking-[0.16em]"
                style={{ color: "var(--frost)" }}
              >
                {parsed.events.length} event{parsed.events.length === 1 ? "" : "s"}
              </span>
            )}
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
            {output && !running && parsed.events.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  className="chip"
                  data-active={viewMode === "cards"}
                  onClick={() => setViewMode("cards")}
                >
                  Cards
                </button>
                <button
                  className="chip"
                  data-active={viewMode === "markdown"}
                  onClick={() => setViewMode("markdown")}
                >
                  Markdown
                </button>
              </div>
            )}
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

          {running && !output && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-4 px-6 py-5"
              style={{
                background: "var(--ink-raised)",
                border: "1px solid var(--fg-16)",
                borderRadius: 2,
              }}
            >
              <LoadingState />
            </motion.div>
          )}

          {running && output && (
            <StreamingState
              eventsSoFar={streamStatus.eventsSoFar}
              activeHeading={streamStatus.activeHeading}
            />
          )}

          {output && viewMode === "cards" && parsed.events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-4 flex flex-col gap-px overflow-hidden"
              style={{
                background: "var(--fg-16)",
                border: "1px solid var(--fg-16)",
                borderRadius: 2,
                maxHeight: "calc(100vh - 220px)",
                overflowY: "auto",
              }}
              ref={outputRef}
            >
              {parsed.events.map((ev) => (
                <EventCard key={ev.num} event={ev} />
              ))}
              {(parsed.sessionSummary || parsed.verificationNotes) && (
                <SummaryCard
                  sessionSummary={parsed.sessionSummary}
                  verificationNotes={parsed.verificationNotes}
                />
              )}
            </motion.div>
          )}

          {output && (viewMode === "markdown" || parsed.events.length === 0) && !running && (
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
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  tight,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  tight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className={`flex items-center gap-2 ${tight ? "mb-1" : "mb-1.5"}`}>
        <span
          className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
          style={{ color: required ? "var(--frost)" : "var(--fg-52)" }}
        >
          {label}
          {required && <span style={{ marginLeft: 4 }}>·</span>}
          {required && (
            <span style={{ color: "var(--frost)", marginLeft: 4 }}>
              required
            </span>
          )}
        </span>
      </div>
      {children}
      {hint && !tight && (
        <div
          className="mt-1.5 text-[11px] leading-[1.5]"
          style={{ color: "var(--fg-52)" }}
        >
          {hint}
        </div>
      )}
      {hint && tight && (
        <div
          className="mt-1 text-[10.5px] leading-[1.4]"
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

function StreamingState({
  eventsSoFar,
  activeHeading,
}: {
  eventsSoFar: number;
  activeHeading: string | null;
}) {
  return (
    <div
      className="mt-4 flex items-center gap-3 px-5 py-3"
      style={{
        background: "var(--ink-raised)",
        border: "1px solid var(--fg-16)",
        borderRadius: 2,
      }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          background: "var(--amber)",
          animation: "data-pulse 2.4s ease-in-out infinite",
        }}
      />
      <span className="kicker-sm">
        Streaming · {eventsSoFar} event{eventsSoFar === 1 ? "" : "s"}
        {activeHeading ? ` · on ${activeHeading}` : ""}
      </span>
    </div>
  );
}

function EventCard({ event: e }: { event: ParsedEvent }) {
  const [copied, setCopied] = useState(false);
  const streamColor =
    e.stream?.toUpperCase() === "HALO"
      ? "var(--amber)"
      : "var(--frost)";
  const copyEvent = async () => {
    try {
      await navigator.clipboard.writeText(e.raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };
  return (
    <article
      className="group relative px-6 py-5"
      style={{
        background: "var(--ink-raised)",
        transition: "background 180ms cubic-bezier(0.2, 0.7, 0.2, 1)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px var(--frost-glow)" }}
      />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--fg-52)" }}
            >
              {e.num.padStart(2, "0")}
            </span>
            {e.stream && (
              <span
                className="font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
                style={{
                  padding: "2px 6px",
                  background: "var(--ink-deep)",
                  border: `1px solid ${streamColor}`,
                  color: streamColor,
                  borderRadius: 2,
                }}
              >
                {e.stream}
              </span>
            )}
          </div>
          <h3
            className="serif mt-2 text-[20px] leading-[1.15]"
            style={{ color: "var(--fg-100)" }}
          >
            {e.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {e.link && (
            <a
              href={e.link}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
              style={{
                padding: "5px 10px",
                background: "transparent",
                border: "1px solid var(--frost)",
                color: "var(--frost)",
                borderRadius: 2,
              }}
            >
              Open ↗
            </a>
          )}
          <button
            onClick={copyEvent}
            className="font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
            style={{
              padding: "5px 10px",
              background: "transparent",
              border: "1px solid var(--fg-16)",
              color: "var(--fg-72)",
              borderRadius: 2,
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-2.5 md:grid-cols-[150px_1fr]">
        {e.dates && <Row label="Dates" value={e.dates} />}
        {e.location && <Row label="Location" value={e.location} />}
        {e.audienceFit && <Row label="Audience fit" value={e.audienceFit} />}
        {e.themeFit && <Row label="Theme fit" value={e.themeFit} />}
        {e.speakingRoute && (
          <Row label="Speaking route" value={e.speakingRoute} />
        )}
        {e.sponsorshipRoute && (
          <Row label="Sponsorship route" value={e.sponsorshipRoute} />
        )}
        {e.payToPlay && (
          <Row
            label="Pay-to-play"
            value={e.payToPlay}
            accent={
              /partial|yes/i.test(e.payToPlay) ? "var(--amber)" : undefined
            }
          />
        )}
        {e.whyPartner && <Row label="Why this partner" value={e.whyPartner} />}
        {e.travelBurden && (
          <Row label="Travel burden" value={e.travelBurden} />
        )}
        {Object.entries(e.extra).map(([k, v]) => (
          <Row key={k} label={k} value={v} />
        ))}
      </dl>
    </article>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <>
      <dt
        className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
        style={{ color: "var(--fg-52)", paddingTop: 1 }}
      >
        {label}
      </dt>
      <dd
        className="m-0 text-[13.5px] leading-[1.55]"
        style={{ color: accent ?? "var(--fg-100)" }}
      >
        {value}
      </dd>
    </>
  );
}

function SummaryCard({
  sessionSummary,
  verificationNotes,
}: {
  sessionSummary?: string;
  verificationNotes?: string;
}) {
  return (
    <div
      className="px-6 py-5"
      style={{ background: "var(--ink-deep)" }}
    >
      <div className="kicker-sm">Session summary</div>
      {sessionSummary && (
        <p
          className="mt-2 text-[13px] leading-[1.6]"
          style={{ color: "var(--fg-100)" }}
        >
          {sessionSummary}
        </p>
      )}
      {verificationNotes && (
        <>
          <div className="kicker-sm mt-5">Verification notes</div>
          <p
            className="mt-2 whitespace-pre-wrap text-[12.5px] leading-[1.6]"
            style={{ color: "var(--fg-72)" }}
          >
            {verificationNotes}
          </p>
        </>
      )}
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
