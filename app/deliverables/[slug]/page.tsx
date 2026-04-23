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
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker={`Deliverables · ${def.category}`}
        title={def.title}
        right={
          <Link href="/deliverables" className="btn-secondary inline-block bg-white">
            ← All deliverables
          </Link>
        }
      />
      <DeliverableWorkflow def={def} />
    </div>
  );
}
