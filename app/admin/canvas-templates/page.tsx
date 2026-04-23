import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

export const metadata = { title: "Canvas templates · Admin · ArcticMind" };

export default function AdminCanvasTemplatesPage() {
  const keys = Object.keys(DEMO_DATA);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Canvas templates"
        title={`Role × industry canvases · ${keys.length}`}
        right={
          <Link href="/admin" className="btn-secondary inline-block bg-white">
            ← Admin
          </Link>
        }
      />

      <div className="callout mt-6">
        <p>
          Canvas templates define the eight opportunities for a given role +
          industry combination. Each opportunity has a title, tagline, detail
          paragraph, smallest-experiment line, primary risk, and six score
          sliders (0–10). The editor ships in Phase 1E.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-b border-ink-border bg-bg-card px-4 py-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
          Bulk import · role × industry grid view · uncurated flags (Phase 1E)
        </div>
        <Link href="/admin/canvas-templates/new" className="btn-primary">
          + New canvas template
        </Link>
      </div>

      <table className="doc-table mt-0">
        <thead>
          <tr>
            <th style={{ width: "30%" }}>Role</th>
            <th>Industry</th>
            <th style={{ width: "12%" }}>Opportunities</th>
            <th style={{ width: "12%" }}>Status</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const [role, industry] = key.split("__");
            const ops = DEMO_DATA[key];
            return (
              <tr key={key}>
                <td>
                  <strong>{role}</strong>
                </td>
                <td>{industry}</td>
                <td className="font-bold text-navy">{ops.length}</td>
                <td>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    Published
                  </span>
                </td>
                <td>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                    Edit →
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 className="section-header mt-10 mb-3">Uncurated combinations</h2>
      <div className="callout">
        <p>
          Role × industry combinations without a curated template either show a
          "Not yet curated — try…" message to the learner, or (if live generation
          is enabled) call Claude Sonnet 4.6 to generate a draft template for admin
          review and publish. The toggle lives here in Phase 1E.
        </p>
      </div>
    </div>
  );
}
