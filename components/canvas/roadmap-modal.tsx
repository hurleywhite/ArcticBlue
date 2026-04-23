"use client";

import type { Opportunity } from "@/lib/canvas/demo-data";

/*
  Roadmap modal — the prioritized shortlist the user builds from stars.
  Table form, not stacked cards. "Export brief" button wires up to a
  real PDF export in Phase 1A follow-up (react-pdf or Puppeteer route).
*/

export function RoadmapModal({
  role,
  industry,
  starredOps,
  onClose,
}: {
  role: string;
  industry: string;
  starredOps: Opportunity[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6"
      style={{ background: "rgba(31, 58, 95, 0.35)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[920px] border border-navy bg-white"
      >
        <div className="flex items-center justify-between bg-navy px-6 py-3 text-white">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
              Prioritized roadmap · {role} · {industry}
            </div>
            <div className="mt-0.5 text-[15px] font-bold">
              Your shortlist, sequenced.
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] font-bold uppercase tracking-[0.12em] hover:underline"
          >
            Close ×
          </button>
        </div>

        <div className="px-7 py-6">
          <p className="text-[13px] leading-[1.55] text-ink-muted">
            Ranked by combined strategic impact and expected return. Phase
            groupings assume standard enterprise change cadence — adjust based
            on your team's capacity and parallel streams.
          </p>

          <table className="doc-table mt-5">
            <thead>
              <tr>
                <th style={{ width: "7%" }}>#</th>
                <th style={{ width: "10%" }}>Phase</th>
                <th>Opportunity</th>
                <th style={{ width: "14%" }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {starredOps.map((op, idx) => (
                <tr key={op.id}>
                  <td className="font-bold text-navy">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td>Phase {Math.floor(idx / 2) + 1}</td>
                  <td>
                    <div className="font-bold">{op.title}</div>
                    <div className="mt-0.5 text-ink-muted">{op.tagline}</div>
                    <div className="mt-1 text-[12px] italic text-ink">
                      First experiment: {op.experiment}
                    </div>
                  </td>
                  <td>{op.category}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex items-center justify-between border-t border-ink-border pt-4">
            <div className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              Generated{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <button
              className="btn-primary"
              onClick={() => alert("PDF export wires up in Phase 1A follow-up.")}
            >
              Export brief (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
