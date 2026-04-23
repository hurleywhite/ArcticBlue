import Link from "next/link";
import { notFound } from "next/navigation";
import { COLLECTIONS } from "@/lib/content/collections";
import { MODULES } from "@/lib/content/modules";
import { PageHeader } from "@/components/shared/page-header";
import { CollectionEditor } from "./collection-editor";

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ id: c.id }));
}

export default async function AdminCollectionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = COLLECTIONS.find((cc) => cc.id === id);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Collection"
        title={`Edit: ${c.title}`}
        right={
          <Link href="/admin/collections" className="btn-secondary inline-block bg-white">
            ← All collections
          </Link>
        }
      />
      <CollectionEditor collection={c} allModules={MODULES} />
    </div>
  );
}
