"use client";

import { useState } from "react";
import type { Opportunity } from "@/lib/canvas/demo-data";
import { SaveBar } from "@/components/admin/editor-primitives";

/*
  Canvas template editor.

  Each template is a list of 8 opportunities. This editor renders them
  as collapsible cards — click to expand, edit title / tagline / detail /
  smallest experiment / primary risk / category, adjust the six 0–10
  score sliders that drive quadrant placement.

  Score sliders are the interesting piece — each one is a native range
  input plus a numeric display. The 6 dimensions map directly to the
  three axes in the Canvas prototype: Time × Impact, Cost × ROI, Tech × Org.
*/

const SCORE_KEYS: Array<{ key: keyof Opportunity; label: string }> = [
  { key: "time_to_value", label: "Time to value" },
  { key: "strategic_impact", label: "Strategic impact" },
  { key: "cost_to_implement", label: "Cost efficiency" },
  { key: "expected_roi", label: "Expected ROI" },
  { key: "tech_maturity", label: "Tech maturity" },
  { key: "org_readiness", label: "Org readiness" },
];

export function CanvasTemplateEditor({
  role,
  industry,
  opportunities,
}: {
  role: string;
  industry: string;
  opportunities: Opportunity[];
}) {
  const [ops, setOps] = useState<Opportunity[]>(opportunities);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const update = <K extends keyof Opportunity>(i: number, key: K, val: Opportunity[K]) => {
    setOps((prev) => prev.map((o, idx) => (idx === i ? { ...o, [key]: val } : o)));
  };

  return (
    <div className="mt-6">
      <div className="callout">
        <p>
          A Canvas template renders 8 opportunities for a given role × industry.
          Scores below are 0–10 and drive quadrant placement across the three
          lenses (Speed × Impact, Cost × Return, Readiness).
        </p>
      </div>

      <h2 className="section-header mt-8 mb-3">
        Opportunities · {ops.length} of 8
      </h2>
      <div className="border border-ink-border">
        {ops.map((op, i) => (
          <div key={op.id} className={i === ops.length - 1 ? "" : "border-b border-ink-border"}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="flex w-full items-center justify-between bg-bg-card px-4 py-3 text-left transition hover:bg-ice"
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  {String(i + 1).padStart(2, "0")} · {op.category}
                </div>
                <div className="mt-0.5 text-[14px] font-bold text-ink">{op.title}</div>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
                {openIdx === i ? "Collapse −" : "Expand +"}
              </div>
            </button>
            {openIdx === i && (
              <div className="bg-white px-5 py-5">
                <table className="doc-table">
                  <tbody>
                    <Row label="Title">
                      <input
                        className="input"
                        value={op.title}
                        onChange={(e) => update(i, "title", e.target.value)}
                      />
                    </Row>
                    <Row label="Tagline">
                      <input
                        className="input"
                        value={op.tagline}
                        onChange={(e) => update(i, "tagline", e.target.value)}
                      />
                    </Row>
                    <Row label="Detail">
                      <textarea
                        className="textarea"
                        rows={3}
                        value={op.detail}
                        onChange={(e) => update(i, "detail", e.target.value)}
                      />
                    </Row>
                    <Row label="Smallest experiment" hint="The single most important line on the card.">
                      <textarea
                        className="textarea"
                        rows={2}
                        value={op.experiment}
                        onChange={(e) => update(i, "experiment", e.target.value)}
                      />
                    </Row>
                    <Row label="Primary risk">
                      <textarea
                        className="textarea"
                        rows={2}
                        value={op.risk}
                        onChange={(e) => update(i, "risk", e.target.value)}
                      />
                    </Row>
                    <Row label="Category">
                      <select
                        className="select"
                        value={op.category}
                        onChange={(e) => update(i, "category", e.target.value)}
                      >
                        {["Growth", "Ops", "Research", "Service", "People", "Finance"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Row>
                  </tbody>
                </table>

                <h3 className="section-header mt-6 mb-2">Scores · 0–10</h3>
                <table className="doc-table">
                  <tbody>
                    {SCORE_KEYS.map((s) => (
                      <tr key={s.key}>
                        <td style={{ width: "26%" }}>
                          <strong>{s.label}</strong>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={10}
                              value={op[s.key] as number}
                              onChange={(e) =>
                                update(i, s.key, Number(e.target.value) as never)
                              }
                              className="flex-1"
                            />
                            <span className="w-10 text-right font-bold text-navy">
                              {op[s.key]} / 10
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <SaveBar slug={`${role}__${industry}`} id={`${role}__${industry}`} />
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td style={{ width: "26%", verticalAlign: "top" }}>
        <strong>{label}</strong>
        {hint && <div className="mt-0.5 text-[11px] text-ink-muted">{hint}</div>}
      </td>
      <td>{children}</td>
    </tr>
  );
}
