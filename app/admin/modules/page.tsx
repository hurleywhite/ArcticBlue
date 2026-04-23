import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { AdminListTable, AdminToolbar } from "@/components/admin/list-table";
import { MODULES } from "@/lib/content/modules";

export const metadata = { title: "Modules · Admin · ArcticMind" };

const TYPE_LABEL: Record<string, string> = {
  reading: "Reading",
  video: "Video",
  exercise: "Exercise",
  live_workshop: "Live workshop",
  curated_external: "Curated external",
};

export default function AdminModulesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Modules"
        title={`Learning Hub modules · ${MODULES.length}`}
        right={
          <Link href="/admin" className="btn-secondary inline-block bg-white">
            ← Admin
          </Link>
        }
      />

      <AdminToolbar newHref="/admin/modules/new" newLabel="+ New module" />

      <AdminListTable
        columns={[
          { label: "Type", width: "12%", render: (m) => (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
              {TYPE_LABEL[m.module_type]}
            </span>
          )},
          { label: "Title", render: (m) => (
            <div>
              <Link href={`/learning/${m.slug}`} className="font-bold text-navy hover:underline">
                {m.title}
              </Link>
              {m.subtitle && <div className="mt-0.5 text-ink-muted">{m.subtitle}</div>}
            </div>
          )},
          { label: "Author", width: "18%", render: (m) => <span>{m.author_name}</span> },
          { label: "Length", width: "8%", render: (m) => <span>{m.estimated_minutes} min</span> },
          { label: "Status", width: "10%", render: () => (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
              Published
            </span>
          )},
        ]}
        rows={MODULES}
        editHrefFor={(m) => `/admin/modules/${m.id}`}
      />
    </div>
  );
}
