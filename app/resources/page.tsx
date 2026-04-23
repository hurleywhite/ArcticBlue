import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { RESOURCES } from "@/lib/content/resources";

export const metadata = { title: "Resources · ArcticMind" };

export default function ResourcesPage() {
  const frameworks = RESOURCES.filter((r) => r.category === "framework");
  const glossary = RESOURCES.filter((r) => r.category === "glossary");
  const playbooks = RESOURCES.filter((r) => r.category === "playbook");

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Resources"
        title="Frameworks, glossary, playbooks — the shared vocabulary."
      />

      <div className="callout mt-6">
        <p>
          The reference material ArcticBlue cites on engagements. Start with the
          governance frameworks when scoping with legal. Keep the playbooks open
          when running a pilot. Use the glossary when the vocabulary isn't shared.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">Governance frameworks</h2>
      <ResourceTable rows={frameworks} extraColumn={{ header: "Jurisdiction", render: (r) => r.jurisdiction ?? "—" }} />

      <h2 className="section-header mt-10 mb-3">Playbooks</h2>
      <ResourceTable rows={playbooks} />

      <h2 className="section-header mt-10 mb-3">Glossary</h2>
      <ResourceTable rows={glossary} />

      <div className="mt-10 text-[12px] text-ink-muted">
        Reference material is maintained by ArcticBlue facilitators. Request a new
        entry through the admin CMS.
      </div>
    </div>
  );
}

function ResourceTable({
  rows,
  extraColumn,
}: {
  rows: typeof RESOURCES;
  extraColumn?: { header: string; render: (r: (typeof RESOURCES)[number]) => React.ReactNode };
}) {
  return (
    <table className="doc-table">
      <thead>
        <tr>
          <th style={{ width: "14%" }}>Kind</th>
          {extraColumn && <th style={{ width: "16%" }}>{extraColumn.header}</th>}
          <th>Title</th>
          <th style={{ width: "12%" }}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                {r.kind}
              </span>
            </td>
            {extraColumn && <td className="text-ink-muted">{extraColumn.render(r)}</td>}
            <td>
              <Link
                href={`/resources/${r.slug}`}
                className="font-bold text-navy hover:underline"
              >
                {r.title}
              </Link>
              <div className="mt-1 text-ink-muted">{r.summary}</div>
            </td>
            <td>
              <Link
                href={`/resources/${r.slug}`}
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
              >
                Open →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
