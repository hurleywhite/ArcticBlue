import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "News · ArcticMind" };

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader kicker="News" title="Coming in Phase 2." />

      <div className="callout mt-6">
        <p>
          News Feed is an AI landscape monitor, filtered by the opportunities you starred
          on the Canvas. When a model release, competitor move, or regulatory update
          matters for your specific work, it surfaces here — and in Slack, Teams, or email
          at the cadence you set.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">What Phase 2 will include</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "30%" }}>Source class</th>
            <th>What lands in your feed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Model and platform releases</strong>
            </td>
            <td>
              Claude, GPT, Gemini, Mistral — release notes summarized against your
              starred opportunities.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Competitor moves</strong>
            </td>
            <td>
              Product launches, pricing changes, leadership shifts at named competitors
              you've configured.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Regulatory and policy</strong>
            </td>
            <td>
              EU AI Act, ISO 42001, NIST, US state-level rulings. Filtered by your
              industry and operating geographies.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Research and method</strong>
            </td>
            <td>Papers and benchmarks relevant to the opportunities you're pursuing.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
