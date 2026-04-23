import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Use Cases · ArcticMind" };

const SEED = [
  {
    client: "Global insurer",
    metric: "83% accuracy",
    title: "Synthetic personas for policy servicing copy testing",
    summary:
      "Validated transactional copy against modeled customer segments before full rollout — compressed copy testing from 4 weeks to 5 days.",
  },
  {
    client: "Design software leader",
    metric: "Days, not weeks",
    title: "Synthetic user testing for new feature concepts",
    summary:
      "Ran concept validation with modeled user panels in parallel with live research — decisions landed the same week.",
  },
  {
    client: "Nonprofit advocacy org",
    metric: "Full coverage",
    title: "AI vetting workflow for grantee applications",
    summary:
      "Standardized initial application review across volunteer reviewers, surfacing edge cases to staff.",
  },
  {
    client: "Edtech platform",
    metric: "3x enrichment",
    title: "Sales enrichment pipeline for inbound leads",
    summary:
      "Multi-source enrichment fills firmographic and intent signals in under a minute per lead, up from same-day manual work.",
  },
  {
    client: "Fortune 50 insurer",
    metric: "5 months vs 18",
    title: "Product launch compression",
    summary:
      "Condensed a traditional 18-month launch cycle to 5 months using AI-assisted research, drafting, and testing rituals.",
  },
  {
    client: "Healthcare call center",
    metric: "45% faster",
    title: "Call resolution with in-call AI assistance",
    summary:
      "Real-time playbook surfacing reduced average handle time while lifting first-call resolution.",
  },
  {
    client: "Government agency",
    metric: "450+ upskilled",
    title: "Executive upskilling at scale",
    summary:
      "ArcticBlue-led cohort program upskilled 450+ senior executives with facilitated sessions and role-based labs.",
  },
];

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

      <h2 className="section-header mt-10 mb-3">Phase 1 seed set</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "20%" }}>Client (anonymized)</th>
            <th style={{ width: "15%" }}>Headline metric</th>
            <th>Case</th>
          </tr>
        </thead>
        <tbody>
          {SEED.map((c) => (
            <tr key={c.title}>
              <td>
                <strong>{c.client}</strong>
              </td>
              <td className="font-bold text-navy">{c.metric}</td>
              <td>
                <div className="font-bold">{c.title}</div>
                <div className="mt-1 text-ink-muted">{c.summary}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-[12px] text-ink-muted">
        Detail pages with three form factors (story, one-pager PDF, slides) ship in Phase
        1C.
      </div>
    </div>
  );
}
