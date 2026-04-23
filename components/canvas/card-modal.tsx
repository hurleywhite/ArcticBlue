"use client";

import type { Opportunity } from "@/lib/canvas/demo-data";

/*
  Expanded card modal — same editorial treatment as the rest of the doc:
  white body, navy section dividers, ice-blue callout for the experiment,
  no shadow (hairline border only), no rounded corners above 2px.
*/

export function CardModal({
  op,
  isStarred,
  onStar,
  onClose,
}: {
  op: Opportunity;
  isStarred: boolean;
  onStar: () => void;
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
        className="w-full max-w-[720px] border border-navy bg-white"
      >
        {/* Navy header band */}
        <div className="flex items-center justify-between bg-navy px-6 py-3 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
            {op.category}
          </div>
          <button
            onClick={onClose}
            className="text-[11px] font-bold uppercase tracking-[0.12em] hover:underline"
          >
            Close ×
          </button>
        </div>

        <div className="px-7 py-6">
          <h3 className="text-[20px] font-bold leading-[1.2] text-navy">
            {op.title}
          </h3>
          <p className="mt-2 text-[14px] text-ink">{op.tagline}</p>

          <h4 className="section-header mt-6 mb-2">Context</h4>
          <p className="text-[13px] leading-[1.55]">{op.detail}</p>

          <div className="callout mt-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
              Smallest experiment
            </div>
            <p className="mt-1 text-[13px] leading-[1.55]">{op.experiment}</p>
          </div>

          <h4 className="section-header mt-5 mb-2">Primary risk</h4>
          <p className="text-[13px] leading-[1.55]">{op.risk}</p>

          <h4 className="section-header mt-6 mb-2">Scores</h4>
          <table className="doc-table">
            <tbody>
              <ScoreRow label="Time to value" value={op.time_to_value} />
              <ScoreRow label="Strategic impact" value={op.strategic_impact} />
              <ScoreRow label="Expected ROI" value={op.expected_roi} />
              <ScoreRow label="Cost efficiency" value={op.cost_to_implement} />
              <ScoreRow label="Tech maturity" value={op.tech_maturity} />
              <ScoreRow label="Org readiness" value={op.org_readiness} />
            </tbody>
          </table>

          <div className="mt-6 flex items-center justify-between border-t border-ink-border pt-4">
            <button
              onClick={onStar}
              className={isStarred ? "btn-primary" : "btn-secondary"}
            >
              {isStarred ? "★ Starred · add more" : "Add to roadmap"}
            </button>
            <div className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              ArcticBlue would scope this in ~4 weeks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <tr>
      <td style={{ width: "35%" }}>{label}</td>
      <td style={{ width: "45%" }}>
        <div className="h-2 border border-ink-border">
          <div
            className="h-full bg-navy"
            style={{ width: `${value * 10}%` }}
          />
        </div>
      </td>
      <td className="text-right font-bold text-navy" style={{ width: "20%" }}>
        {value} / 10
      </td>
    </tr>
  );
}
