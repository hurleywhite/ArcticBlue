import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { USE_CASES } from "@/lib/content/use-cases";

export const metadata = { title: "Use Cases · ArcticMind" };

export default function UseCasesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Use Cases"
        title="Anonymized proof points from real ArcticBlue engagements."
      />

      <div className="callout mt-6">
        <p>
          All case studies are anonymized by default. Named clients appear only when
          ArcticBlue has explicit written permission per record.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">The library</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "22%" }}>Client (anonymized)</th>
            <th style={{ width: "16%" }}>Headline metric</th>
            <th>Case</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          {USE_CASES.map((u) => (
            <tr key={u.id}>
              <td>
                <strong>{u.anonymized_client_label}</strong>
                <div className="mt-1 text-ink-muted">
                  {(u.tags.industries ?? []).join(" · ")}
                </div>
              </td>
              <td className="font-bold text-navy">{u.headline_metric}</td>
              <td>
                <Link
                  href={`/use-cases/${u.slug}`}
                  className="font-bold text-navy hover:underline"
                >
                  {u.title}
                </Link>
                <div className="mt-1 text-ink-muted">{u.summary}</div>
              </td>
              <td>
                <Link
                  href={`/use-cases/${u.slug}`}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                >
                  Open →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
