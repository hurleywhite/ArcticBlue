import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Admin · ArcticMind" };

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin CMS"
        title="Maintain canvases, modules, use cases, prompts, templates."
      />

      <div className="callout mt-6">
        <p>
          The admin surface ships in Phase 1E. Same design language as the learner
          product — no separate dashboard aesthetic. Form-based editors for every content
          type, tag-driven, published via a single status column.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">Content types</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "22%" }}>Type</th>
            <th>Editor sections</th>
            <th style={{ width: "14%" }}>Phase</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Canvas template</strong>
            </td>
            <td>Role · industry · 8 opportunity cards · 6 score sliders each</td>
            <td>1E</td>
          </tr>
          <tr>
            <td>
              <strong>Module</strong>
            </td>
            <td>Type (video/reading/exercise/workshop/external) · body · author · tags</td>
            <td>1E</td>
          </tr>
          <tr>
            <td>
              <strong>Use case</strong>
            </td>
            <td>Anonymized label · metric · story · one-pager PDF · slides</td>
            <td>1E</td>
          </tr>
          <tr>
            <td>
              <strong>Prompt</strong>
            </td>
            <td>Body · variable definitions · tags</td>
            <td>1E</td>
          </tr>
          <tr>
            <td>
              <strong>Template</strong>
            </td>
            <td>Tiptap body · variables · type (email/brief/analysis/plan)</td>
            <td>1E</td>
          </tr>
          <tr>
            <td>
              <strong>Collection</strong>
            </td>
            <td>Cover · module picker with drag reorder</td>
            <td>1E</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
