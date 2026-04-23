import Link from "next/link";
import { notFound } from "next/navigation";
import { PROMPTS, getPromptBySlug } from "@/lib/content/prompts";
import { PromptRunner } from "./prompt-runner";

export async function generateStaticParams() {
  return PROMPTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPromptBySlug(slug);
  return { title: p ? `${p.title} · ArcticMind` : "Prompt · ArcticMind" };
}

export default async function PromptDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPromptBySlug(slug);
  if (!p) notFound();

  const related = PROMPTS.filter(
    (o) =>
      o.id !== p.id &&
      (o.tags.topics ?? []).some((t) => (p.tags.topics ?? []).includes(t))
  ).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="bg-navy px-6 py-5 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
          <Link href="/tools/prompts" className="hover:underline">
            Prompt Library
          </Link>
          <span className="mx-2">·</span>
          <span>{p.variables.length} variables</span>
        </div>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.15]">{p.title}</h1>
        <p className="mt-1 text-[13px] opacity-90">{p.description}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_240px]">
        <PromptRunner prompt={p} />

        <aside>
          <h3 className="section-header mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {(p.tags.topics ?? []).map((t) => (
              <span
                key={t}
                className="border border-ink-border bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
              >
                {t}
              </span>
            ))}
            {(p.tags.roles ?? [])
              .filter((r) => r !== "all")
              .map((r) => (
                <span
                  key={r}
                  className="border border-ice bg-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
                >
                  {r}
                </span>
              ))}
          </div>

          {related.length > 0 && (
            <>
              <h3 className="section-header mt-8 mb-2">Related</h3>
              <ul className="m-0 list-none p-0">
                {related.map((rp) => (
                  <li key={rp.id} className="mb-2">
                    <Link
                      href={`/tools/prompts/${rp.slug}`}
                      className="block border border-ink-border bg-white px-3 py-2 transition hover:border-navy"
                    >
                      <div className="text-[11px] font-bold text-navy">{rp.title}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
