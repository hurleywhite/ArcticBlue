import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { AdminListTable, AdminToolbar } from "@/components/admin/list-table";
import { COLLECTIONS } from "@/lib/content/collections";

export const metadata = { title: "Collections · Admin · ArcticMind" };

export default function AdminCollectionsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Collections"
        title={`Learning collections · ${COLLECTIONS.length}`}
        right={
          <Link href="/admin" className="btn-secondary inline-block bg-white">
            ← Admin
          </Link>
        }
      />
      <AdminToolbar newHref="/admin/collections/new" newLabel="+ New collection" />
      <AdminListTable
        columns={[
          { label: "Title", render: (c) => (
            <div>
              <Link href={`/learning/collections/${c.slug}`} className="font-bold text-navy hover:underline">
                {c.title}
              </Link>
              <div className="mt-0.5 text-ink-muted">{c.description}</div>
            </div>
          )},
          { label: "Modules", width: "12%", render: (c) => <span className="font-bold text-navy">{c.module_slugs.length}</span> },
          { label: "Status", width: "12%", render: () => (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">Published</span>
          )},
        ]}
        rows={COLLECTIONS}
        editHrefFor={(c) => `/admin/collections/${c.id}`}
      />
    </div>
  );
}
