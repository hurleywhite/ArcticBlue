import Link from "next/link";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollectionBySlug } from "@/lib/content/collections";
import { MODULES } from "@/lib/content/modules";

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCollectionBySlug(slug);
  return { title: c ? `${c.title} · ArcticMind` : "Collection · ArcticMind" };
}

const TYPE_LABEL: Record<string, string> = {
  reading: "Reading",
  video: "Video",
  exercise: "Exercise",
  live_workshop: "Live workshop",
  curated_external: "Curated external",
};

export default async function CollectionDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCollectionBySlug(slug);
  if (!c) notFound();

  const modules = c.module_slugs
    .map((s) => MODULES.find((m) => m.slug === s))
    .filter(Boolean) as typeof MODULES;

  const totalMin = modules.reduce((sum, m) => sum + (m?.estimated_minutes ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="bg-navy px-6 py-5 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
          <Link href="/learning" className="hover:underline">
            Learning
          </Link>
          <span className="mx-2">·</span>
          <span>Collection</span>
          <span className="mx-2">·</span>
          <span>{totalMin} min total</span>
        </div>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.15]">{c.title}</h1>
        <p className="mt-1 text-[13px] opacity-90">{c.description}</p>
      </div>

      <h2 className="section-header mt-8 mb-3">Sequence</h2>
      <div className="border border-ink-border">
        {modules.map((m, idx) => (
          <div
            key={m.id}
            className={`grid grid-cols-[72px_1fr_auto] items-start ${
              idx === modules.length - 1 ? "" : "border-b border-ink-border"
            }`}
          >
            <div className="bg-navy px-4 py-4 text-center text-[18px] font-bold text-white">
              {String(idx + 1).padStart(2, "0")}
            </div>
            <Link
              href={`/learning/${m.slug}`}
              className="block px-5 py-4 transition hover:bg-bg-card"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                {TYPE_LABEL[m.module_type]} · {m.estimated_minutes} min
              </div>
              <div className="mt-0.5 text-[14px] font-bold text-navy">{m.title}</div>
              {m.subtitle && (
                <p className="mt-1 text-[12px] text-ink">{m.subtitle}</p>
              )}
            </Link>
            <div className="px-4 py-4">
              <Link
                href={`/learning/${m.slug}`}
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
              >
                Open →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
