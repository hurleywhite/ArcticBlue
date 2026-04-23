import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DELIVERABLES, getDeliverable } from "@/lib/content/deliverables";
import { DeliverableWorkflow } from "./workflow";

export async function generateStaticParams() {
  return DELIVERABLES.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = getDeliverable(slug);
  return { title: d ? `${d.title} · Deliverables · ArcticMind` : "Deliverable · ArcticMind" };
}

export default async function DeliverablePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = getDeliverable(slug);
  if (!def) notFound();

  return (
    <div className="shell pb-32">
      <PageHeader
        kicker={`Deliverables · ${def.category}`}
        title={def.title}
        description={def.summary}
        right={
          <Link href="/deliverables" className="btn-secondary">
            ← All deliverables
          </Link>
        }
      />
      <div className="mt-12">
        <DeliverableWorkflow def={def} />
      </div>
    </div>
  );
}
