import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { PROMPTS } from "@/lib/content/prompts";

export const metadata = { title: "Prompt Library · ArcticMind" };

export default function PromptsLibraryPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Prompt Library"
        title="Reusable prompts, curated by ArcticBlue."
        right={
          <Link href="/tools" className="btn-secondary inline-block bg-white">
            ← All Tools
          </Link>
        }
      />

      <div className="callout mt-6">
        <p>
          Every prompt has variables you fill in and a structure designed to produce
          a readout-ready output. Copy to clipboard for any AI tool, or open Practice
          to try it with the context pre-seeded.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">The library</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th>Prompt</th>
            <th style={{ width: "22%" }}>Best for</th>
            <th style={{ width: "10%" }}>Variables</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          {PROMPTS.map((p) => (
            <tr key={p.id}>
              <td>
                <Link
                  href={`/tools/prompts/${p.slug}`}
                  className="font-bold text-navy hover:underline"
                >
                  {p.title}
                </Link>
                <div className="mt-1 text-ink-muted">{p.description}</div>
              </td>
              <td className="text-ink-muted">
                {(p.tags.roles ?? []).filter((r) => r !== "all").join(" · ") ||
                  "Any role"}
              </td>
              <td className="font-bold text-navy">{p.variables.length}</td>
              <td>
                <Link
                  href={`/tools/prompts/${p.slug}`}
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
