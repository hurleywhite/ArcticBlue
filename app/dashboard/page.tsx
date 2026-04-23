import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Dashboard · ArcticMind" };

/*
  Dashboard — the home for returning users.
  Full personalization wires up in Phase 1F. For now this is the static
  skeleton showing what each section will hold.
*/

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Dashboard"
        title="Good morning. Pick up where you left off."
        right={
          <Link href="/canvas" className="btn-secondary inline-block bg-white">
            Open Canvas →
          </Link>
        }
      />

      <h2 className="section-header mt-8 mb-3">Your Canvas</h2>
      <div className="card-surface">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Latest session
        </div>
        <div className="mt-1 text-[14px] font-bold">
          Build your first Canvas →
        </div>
        <p className="mt-1 text-[13px] text-ink">
          Pick a role and an industry to generate an opportunity map. Stars from
          here drive recommendations across Learning, Use Cases, and Tools.
        </p>
      </div>

      <h2 className="section-header mt-8 mb-3">Recommended for you</h2>
      <div className="callout">
        <p>
          Personalization wires up in Phase 1F. Once you've starred opportunities
          on the Canvas, six cards will appear here — two Learning modules, two
          Use Cases, two Prompts — ranked against your star pattern.
        </p>
      </div>

      <h2 className="section-header mt-8 mb-3">New from ArcticBlue</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "14%" }}>Type</th>
            <th>Title</th>
            <th style={{ width: "14%" }}>Added</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Module</td>
            <td className="text-ink-muted italic">Seeded when Learning Hub ships (Phase 1B).</td>
            <td className="text-ink-muted">—</td>
          </tr>
          <tr>
            <td>Use Case</td>
            <td className="text-ink-muted italic">Seeded when Use Cases ship (Phase 1C).</td>
            <td className="text-ink-muted">—</td>
          </tr>
          <tr>
            <td>Prompt</td>
            <td className="text-ink-muted italic">Seeded when Tools ships (Phase 1D).</td>
            <td className="text-ink-muted">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
