import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { TEMPLATES } from "@/lib/content/templates";

export const metadata = { title: "Templates · ArcticMind" };

const TYPE_LABEL: Record<string, string> = {
  email: "Email",
  brief: "Brief",
  analysis: "Analysis",
  plan: "Plan",
  other: "Other",
};

export default function TemplatesLibraryPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Templates"
        title="Structured scaffolding for common AI-assisted deliverables."
        right={
          <Link href="/tools" className="btn-secondary inline-block bg-white">
            ← All Tools
          </Link>
        }
      />

      <div className="callout mt-6">
        <p>
          Templates are the output scaffolding. Prompts are the AI input. Pair them:
          use a template to shape what you want produced, use a prompt to generate the draft.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">The library</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "12%" }}>Type</th>
            <th>Template</th>
            <th style={{ width: "10%" }}>Variables</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          {TEMPLATES.map((t) => (
            <tr key={t.id}>
              <td>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  {TYPE_LABEL[t.template_type]}
                </span>
              </td>
              <td>
                <Link
                  href={`/tools/templates/${t.slug}`}
                  className="font-bold text-navy hover:underline"
                >
                  {t.title}
                </Link>
                <div className="mt-1 text-ink-muted">{t.description}</div>
              </td>
              <td className="font-bold text-navy">{t.variables.length}</td>
              <td>
                <Link
                  href={`/tools/templates/${t.slug}`}
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
