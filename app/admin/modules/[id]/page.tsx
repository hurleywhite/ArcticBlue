import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULES } from "@/lib/content/modules";
import { PageHeader } from "@/components/shared/page-header";
import { ModuleEditor } from "./module-editor";

export async function generateStaticParams() {
  return MODULES.map((m) => ({ id: m.id }));
}

export default async function AdminModuleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = MODULES.find((mm) => mm.id === id);
  if (!m) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker={`Admin · Module · ${m.module_type}`}
        title={`Edit: ${m.title}`}
        right={
          <Link href="/admin/modules" className="btn-secondary inline-block bg-white">
            ← All modules
          </Link>
        }
      />
      <ModuleEditor module={m} />
    </div>
  );
}
