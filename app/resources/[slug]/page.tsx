import Link from "next/link";
import { notFound } from "next/navigation";
import { RESOURCES, getResourceBySlug } from "@/lib/content/resources";
import { Markdown } from "@/components/shared/markdown";

export async function generateStaticParams() {
  return RESOURCES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = getResourceBySlug(slug);
  return { title: r ? `${r.title} · ArcticMind` : "Resource · ArcticMind" };
}

const CATEGORY_LABEL: Record<string, string> = {
  framework: "Framework",
  glossary: "Glossary",
  playbook: "Playbook",
};

export default async function ResourceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = getResourceBySlug(slug);
  if (!r) notFound();

  const related = RESOURCES.filter(
    (o) => o.id !== r.id && o.category === r.category
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="bg-navy px-6 py-5 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
          <Link href="/resources" className="hover:underline">
            Resources
          </Link>
          <span className="mx-2">·</span>
          <span>{CATEGORY_LABEL[r.category]}</span>
          {r.jurisdiction && (
            <>
              <span className="mx-2">·</span>
              <span>{r.jurisdiction}</span>
            </>
          )}
        </div>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.15]">{r.title}</h1>
        <p className="mt-1 text-[13px] opacity-90">{r.summary}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_240px]">
        <div>
          <Markdown>{r.body_markdown}</Markdown>
          {r.external_url && (
            <div className="callout mt-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                External
              </div>
              <p className="mt-1">
                <a
                  href={r.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {r.external_url}
                </a>
              </p>
            </div>
          )}
        </div>
        <aside>
          <h3 className="section-header mb-2">Meta</h3>
          <table className="doc-table">
            <tbody>
              <tr>
                <td>
                  <strong>Kind</strong>
                </td>
                <td>{r.kind}</td>
              </tr>
              {r.jurisdiction && (
                <tr>
                  <td>
                    <strong>Jurisdiction</strong>
                  </td>
                  <td>{r.jurisdiction}</td>
                </tr>
              )}
              <tr>
                <td>
                  <strong>Added</strong>
                </td>
                <td>{new Date(r.published_at).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>

          {related.length > 0 && (
            <>
              <h3 className="section-header mt-8 mb-2">Related</h3>
              <ul className="m-0 list-none p-0">
                {related.map((o) => (
                  <li key={o.id} className="mb-2">
                    <Link
                      href={`/resources/${o.slug}`}
                      className="block border border-ink-border bg-white px-3 py-2 transition hover:border-navy"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                        {o.kind}
                      </div>
                      <div className="mt-0.5 text-[11px] font-bold">{o.title}</div>
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
