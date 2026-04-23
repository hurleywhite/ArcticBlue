import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Learning Hub · ArcticMind" };

export default function LearningPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader kicker="Learning Hub" title="Build the skills to act on the canvas." />

      <section className="mt-6">
        <h2 className="section-header mb-3">Entry paths</h2>
        <table className="doc-table">
          <thead>
            <tr>
              <th style={{ width: "20%" }}>Path</th>
              <th>Description</th>
              <th style={{ width: "18%" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>My Path</strong>
              </td>
              <td>
                Modules personalized to the opportunities you starred on the Canvas, plus
                anything you've already started.
              </td>
              <td>Phase 1B</td>
            </tr>
            <tr>
              <td>
                <strong>Browse by topic</strong>
              </td>
              <td>
                The full library, filterable by role, industry, module type, and skill
                level.
              </td>
              <td>Phase 1B</td>
            </tr>
            <tr>
              <td>
                <strong>Collections</strong>
              </td>
              <td>
                Curated sequences — "Getting started with AI at work",
                "The ArcticBlue experimentation method", "Prompting fundamentals".
              </td>
              <td>Phase 1B</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="callout mt-8">
        <p>
          Learning Hub ships in Phase 1B. Module types will include reading (MDX with
          custom components), video (Mux), exercise (with a "Practice this in Tools"
          jump-off), live workshop, and curated external.
        </p>
      </div>
    </div>
  );
}
