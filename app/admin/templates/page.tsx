import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { AdminListTable, AdminToolbar } from "@/components/admin/list-table";
import { TEMPLATES } from "@/lib/content/templates";

export const metadata = { title: "Templates · Admin · ArcticMind" };

const TYPE_LABEL: Record<string, string> = {
  email: "Email",
  brief: "Brief",
  analysis: "Analysis",
  plan: "Plan",
  other: "Other",
};

export default function AdminTemplatesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Templates"
        title={`Template library · ${TEMPLATES.length}`}
        right={
          <Link href="/admin" className="btn-secondary inline-block bg-white">
            ← Admin
          </Link>
        }
      />
      <AdminToolbar newHref="/admin/templates/new" newLabel="+ New template" />
      <AdminListTable
        columns={[
          { label: "Type", width: "12%", render: (t) => (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
              {TYPE_LABEL[t.template_type]}
            </span>
          )},
          { label: "Title", render: (t) => (
            <div>
              <Link href={`/tools/templates/${t.slug}`} className="font-bold text-navy hover:underline">
                {t.title}
              </Link>
              <div className="mt-0.5 text-ink-muted">{t.description}</div>
            </div>
          )},
          { label: "Variables", width: "12%", render: (t) => <span className="font-bold text-navy">{t.variables.length}</span> },
          { label: "Status", width: "12%", render: () => (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">Published</span>
          )},
        ]}
        rows={TEMPLATES}
        editHrefFor={(t) => `/admin/templates/${t.id}`}
      />
    </div>
  );
}
