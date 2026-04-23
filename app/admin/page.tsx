import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { MODULES } from "@/lib/content/modules";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";
import { COLLECTIONS } from "@/lib/content/collections";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

export const metadata = { title: "Admin · ArcticMind" };

export default function AdminPage() {
  const canvasTemplateCount = Object.keys(DEMO_DATA).length;

  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Admin CMS"
        title="Curate every surface."
        description="List views + inline editors for every content type. Same design language as the learner product, no separate admin dashboard aesthetic."
      />

      <div className="callout mt-12">
        <p>
          The CMS is where ArcticBlue facilitators maintain all content. Every content
          type has a list view and an editor. Writes persist to Supabase once DB
          credentials are provisioned — today the list views read from the seeded
          content files.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">Content types</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "22%" }}>Type</th>
            <th style={{ width: "10%" }}>Published</th>
            <th>What's maintained here</th>
            <th style={{ width: "12%" }}></th>
          </tr>
        </thead>
        <tbody>
          <AdminRow
            href="/admin/canvas-templates"
            title="Canvas templates"
            count={canvasTemplateCount}
            body="Role × industry combinations. 8 opportunities per template, each with 6 score sliders and a smallest-experiment line."
          />
          <AdminRow
            href="/admin/modules"
            title="Learning modules"
            count={MODULES.length}
            body="Video, reading, exercise, live workshop, curated external. Authors, tags, MDX bodies, Mux playback IDs."
          />
          <AdminRow
            href="/admin/use-cases"
            title="Use Cases"
            count={USE_CASES.length}
            body="Anonymized client label, headline metric, story (challenge/approach/outcome), 30-sec pitch, one-pager PDF, slides."
          />
          <AdminRow
            href="/admin/prompts"
            title="Prompts"
            count={PROMPTS.length}
            body="Prompt body with {{variables}}, variable definitions, tags. Appears in Tools → Prompt Library."
          />
          <AdminRow
            href="/admin/templates"
            title="Templates"
            count={TEMPLATES.length}
            body="Structured output scaffolding — email, brief, analysis, plan. MDX bodies with variable fill."
          />
          <AdminRow
            href="/admin/collections"
            title="Collections"
            count={COLLECTIONS.length}
            body="Ordered sequences of modules. Drag-to-reorder picker, cover image, description."
          />
        </tbody>
      </table>

      <h2 className="section-header mt-10 mb-3">Activity</h2>
      <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-3">
        <StatCell label="Content items" value={`${MODULES.length + USE_CASES.length + PROMPTS.length + TEMPLATES.length}`} sub="modules + cases + prompts + templates" />
        <StatCell label="Published" value="100%" sub="seeded content" />
        <StatCell label="Needs review" value="0" sub="queue empty" last />
      </div>
    </div>
  );
}

function AdminRow({
  href,
  title,
  count,
  body,
}: {
  href: string;
  title: string;
  count: number;
  body: string;
}) {
  return (
    <tr>
      <td>
        <Link href={href} className="font-bold text-navy hover:underline">
          {title}
        </Link>
      </td>
      <td className="font-bold text-navy">{count}</td>
      <td className="text-ink-muted">{body}</td>
      <td>
        <Link
          href={href}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
        >
          Manage →
        </Link>
      </td>
    </tr>
  );
}

function StatCell({
  label,
  value,
  sub,
  last,
}: {
  label: string;
  value: string;
  sub: string;
  last?: boolean;
}) {
  return (
    <div className={`px-5 py-4 bg-bg-card ${last ? "" : "md:border-r md:border-ink-border"}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-bold text-navy">{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-muted">{sub}</div>
    </div>
  );
}
