import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { AdminListTable, AdminToolbar } from "@/components/admin/list-table";
import { USE_CASES } from "@/lib/content/use-cases";

export const metadata = { title: "Use Cases · Admin · ArcticMind" };

export default function AdminUseCasesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Use Cases"
        title={`Anonymized case studies · ${USE_CASES.length}`}
        right={
          <Link href="/admin" className="btn-secondary inline-block bg-white">
            ← Admin
          </Link>
        }
      />
      <AdminToolbar newHref="/admin/use-cases/new" newLabel="+ New use case" />
      <AdminListTable
        columns={[
          { label: "Client (anon)", width: "20%", render: (u) => <strong>{u.anonymized_client_label}</strong> },
          { label: "Headline metric", width: "16%", render: (u) => <span className="font-bold text-navy">{u.headline_metric}</span> },
          { label: "Title", render: (u) => (
            <div>
              <Link href={`/use-cases/${u.slug}`} className="font-bold text-navy hover:underline">
                {u.title}
              </Link>
              <div className="mt-1 text-ink-muted">
                {(u.tags.industries ?? []).join(" · ")}
              </div>
            </div>
          )},
          { label: "Assets", width: "14%", render: (u) => (
            <div className="text-[11px] text-ink-muted">
              {u.one_pager_available ? "PDF ✓" : "PDF —"} · {u.slides_available ? "Slides ✓" : "Slides —"}
            </div>
          )},
          { label: "Status", width: "10%", render: () => (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">Published</span>
          )},
        ]}
        rows={USE_CASES}
        editHrefFor={(u) => `/admin/use-cases/${u.id}`}
      />
    </div>
  );
}
