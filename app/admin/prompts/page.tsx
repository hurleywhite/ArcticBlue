import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { AdminListTable, AdminToolbar } from "@/components/admin/list-table";
import { PROMPTS } from "@/lib/content/prompts";

export const metadata = { title: "Prompts · Admin · ArcticMind" };

export default function AdminPromptsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Prompts"
        title={`Prompt library · ${PROMPTS.length}`}
        right={
          <Link href="/admin" className="btn-secondary inline-block bg-white">
            ← Admin
          </Link>
        }
      />
      <AdminToolbar newHref="/admin/prompts/new" newLabel="+ New prompt" />
      <AdminListTable
        columns={[
          { label: "Title", render: (p) => (
            <div>
              <Link href={`/tools/prompts/${p.slug}`} className="font-bold text-navy hover:underline">
                {p.title}
              </Link>
              <div className="mt-0.5 text-ink-muted">{p.description}</div>
            </div>
          )},
          { label: "Variables", width: "12%", render: (p) => <span className="font-bold text-navy">{p.variables.length}</span> },
          { label: "Topics", width: "22%", render: (p) => <span className="text-ink-muted">{(p.tags.topics ?? []).join(", ")}</span> },
          { label: "Status", width: "12%", render: () => (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">Published</span>
          )},
        ]}
        rows={PROMPTS}
        editHrefFor={(p) => `/admin/prompts/${p.id}`}
      />
    </div>
  );
}
