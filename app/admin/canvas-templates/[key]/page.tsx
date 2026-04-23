import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMO_DATA } from "@/lib/canvas/demo-data";
import { PageHeader } from "@/components/shared/page-header";
import { CanvasTemplateEditor } from "./canvas-template-editor";

export async function generateStaticParams() {
  return Object.keys(DEMO_DATA).map((key) => ({ key: encodeURIComponent(key) }));
}

export default async function AdminCanvasTemplateEditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const decoded = decodeURIComponent(key);
  const ops = DEMO_DATA[decoded];
  if (!ops) notFound();
  const [role, industry] = decoded.split("__");

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker={`Admin · Canvas template`}
        title={`${role} · ${industry}`}
        right={
          <Link href="/admin/canvas-templates" className="btn-secondary inline-block bg-white">
            ← All canvas templates
          </Link>
        }
      />
      <CanvasTemplateEditor role={role} industry={industry} opportunities={ops} />
    </div>
  );
}
