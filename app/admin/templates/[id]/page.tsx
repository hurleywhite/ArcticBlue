import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES } from "@/lib/content/templates";
import { PageHeader } from "@/components/shared/page-header";
import { TemplateEditor } from "./template-editor";

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }));
}

export default async function AdminTemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = TEMPLATES.find((tt) => tt.id === id);
  if (!t) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Template"
        title={`Edit: ${t.title}`}
        right={
          <Link href="/admin/templates" className="btn-secondary inline-block bg-white">
            ← All templates
          </Link>
        }
      />
      <TemplateEditor template={t} />
    </div>
  );
}
