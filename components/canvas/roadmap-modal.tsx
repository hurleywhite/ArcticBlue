"use client";

import type { Opportunity } from "@/lib/canvas/demo-data";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
  const exportPdf = () => {
    if (typeof window === "undefined") return;
    const now = new Date().toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
    const phaseRows = starredOps
      .map((op, idx) => {
        const phase = Math.floor(idx / 2) + 1;
        return `
          <tr>
            <td style="width:6%;font-weight:700;color:#1F3A5F;">${String(idx + 1).padStart(2, "0")}</td>
            <td style="width:10%;">Phase ${phase}</td>
            <td>
              <div style="font-weight:700;">${escapeHtml(op.title)}</div>
              <div style="color:#555;margin-top:2px;">${escapeHtml(op.tagline)}</div>
              <div style="margin-top:6px;font-style:italic;font-size:11px;">First experiment: ${escapeHtml(op.experiment)}</div>
              <div style="margin-top:4px;font-size:11px;color:#555;"><strong>Primary risk:</strong> ${escapeHtml(op.risk)}</div>
            </td>
            <td style="width:12%;">${escapeHtml(op.category)}</td>
          </tr>
        `;
      })
      .join("");

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>ArcticMind Roadmap — ${escapeHtml(role)} · ${escapeHtml(industry)}</title>
      <style>
        @page { margin: 0.5in; }
        body { font-family: Arial, Helvetica, sans-serif; max-width: 880px; margin: 0 auto; padding: 28px; color: #1A1A1A; font-size: 13px; line-height: 1.55; }
        .band { background: #1F3A5F; color: #fff; padding: 14px 18px; }
        .band .k { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.8; }
        .band h1 { margin: 4px 0 0; font-size: 20px; }
        .callout { background: #D5E8F0; border-left: 3px solid #1F3A5F; padding: 12px 16px; margin: 16px 0; }
        h2 { color: #1F3A5F; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin: 22px 0 8px; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #CCC; }
        th, td { border: 1px solid #CCC; padding: 10px 14px; text-align: left; vertical-align: top; }
        thead th { background: #1F3A5F; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
        footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #CCC; color: #555; font-size: 11px; display: flex; justify-content: space-between; }
      </style>
    </head><body>
      <div class="band">
        <div class="k">Opportunity Canvas · Prioritized roadmap</div>
        <h1>${escapeHtml(role)} · ${escapeHtml(industry)}</h1>
      </div>
      <div class="callout">
        <strong>${starredOps.length} opportunities sequenced.</strong> Ranked by
        combined strategic impact and expected return. Phase groupings assume
        standard enterprise change cadence.
      </div>
      <h2>Roadmap</h2>
      <table>
        <thead>
          <tr><th style="width:6%;">#</th><th style="width:10%;">Phase</th><th>Opportunity</th><th style="width:12%;">Category</th></tr>
        </thead>
        <tbody>${phaseRows}</tbody>
      </table>
      <footer>
        <span>Generated ${now} · ArcticMind · arcticblue.ai</span>
        <span>Confidential — for ${escapeHtml(role)} planning only</span>
      </footer>
    </body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

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
            <button className="btn-primary" onClick={exportPdf}>
              Export brief (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
