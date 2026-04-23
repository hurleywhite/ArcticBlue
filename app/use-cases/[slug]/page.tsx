import Link from "next/link";
import { notFound } from "next/navigation";
import { USE_CASES, getUseCaseBySlug } from "@/lib/content/use-cases";
import { MODULES } from "@/lib/content/modules";
import { PROMPTS } from "@/lib/content/prompts";
import { CaseTabs } from "./case-tabs";

export async function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const u = getUseCaseBySlug(slug);
  return { title: u ? `${u.title} · ArcticMind` : "Use case · ArcticMind" };
}

export default async function UseCaseDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const u = getUseCaseBySlug(slug);
  if (!u) notFound();

  const relatedModules = MODULES.filter((m) =>
    (m.tags.topics ?? []).some((t) => (u.tags.topics ?? []).includes(t))
  ).slice(0, 3);
  const relatedPrompts = PROMPTS.filter((p) =>
    (p.tags.topics ?? []).some((t) => (u.tags.topics ?? []).includes(t))
  ).slice(0, 2);
  const relatedCases = USE_CASES.filter(
    (o) =>
      o.id !== u.id &&
      ((o.tags.industries ?? []).some((i) => (u.tags.industries ?? []).includes(i)) ||
        (o.tags.topics ?? []).some((t) => (u.tags.topics ?? []).includes(t)))
  ).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="bg-navy px-6 py-5 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
          <Link href="/use-cases" className="hover:underline">
            Use Cases
          </Link>
          <span className="mx-2">·</span>
          <span>{u.anonymized_client_label}</span>
          <span className="mx-2">·</span>
          <span>{(u.tags.industries ?? []).join(" · ")}</span>
        </div>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.15]">{u.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
          <div>
            <span className="opacity-70">Headline metric:</span>{" "}
            <strong>{u.headline_metric}</strong>
          </div>
          <div className="opacity-80">{u.summary.split(".")[0]}.</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_260px]">
        <div>
          <CaseTabs
            story={{
              challenge: u.challenge_markdown,
              approach: u.approach_markdown,
              outcome: u.outcome_markdown,
            }}
            onePagerAvailable={u.one_pager_available}
            slidesAvailable={u.slides_available}
            pitch={u.pitch_30sec}
            clientLabel={u.anonymized_client_label}
            title={u.title}
            headlineMetric={u.headline_metric}
          />
        </div>

        <aside>
          <h3 className="section-header mb-2">30-second pitch</h3>
          <div className="callout">
            <p className="text-[12px] leading-[1.55]">{u.pitch_30sec}</p>
          </div>

          <h3 className="section-header mt-8 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {(u.tags.industries ?? []).map((i) => (
              <span
                key={i}
                className="border border-ink-border bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
              >
                {i}
              </span>
            ))}
            {(u.tags.categories ?? []).map((c) => (
              <span
                key={c}
                className="border border-ice bg-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
              >
                {c}
              </span>
            ))}
          </div>

          {relatedModules.length > 0 && (
            <>
              <h3 className="section-header mt-8 mb-2">Related learning</h3>
              <ul className="m-0 list-none p-0">
                {relatedModules.map((m) => (
                  <li key={m.id} className="mb-2">
                    <Link
                      href={`/learning/${m.slug}`}
                      className="block border border-ink-border bg-white px-3 py-2 transition hover:border-navy"
                    >
                      <div className="text-[11px] font-bold text-navy">{m.title}</div>
                      <div className="mt-0.5 text-[11px] text-ink-muted">
                        {m.estimated_minutes} min
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {relatedPrompts.length > 0 && (
            <>
              <h3 className="section-header mt-8 mb-2">Try this approach</h3>
              <ul className="m-0 list-none p-0">
                {relatedPrompts.map((p) => (
                  <li key={p.id} className="mb-2">
                    <Link
                      href={`/tools/prompts/${p.slug}`}
                      className="block border border-ink-border bg-white px-3 py-2 transition hover:border-navy"
                    >
                      <div className="text-[11px] font-bold text-navy">{p.title}</div>
                      <div className="mt-0.5 text-[11px] text-ink-muted">
                        Prompt · try it in Practice
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {relatedCases.length > 0 && (
            <>
              <h3 className="section-header mt-8 mb-2">Related cases</h3>
              <ul className="m-0 list-none p-0">
                {relatedCases.map((rc) => (
                  <li key={rc.id} className="mb-2">
                    <Link
                      href={`/use-cases/${rc.slug}`}
                      className="block border border-ink-border bg-white px-3 py-2 transition hover:border-navy"
                    >
                      <div className="text-[11px] font-bold text-navy">{rc.title}</div>
                      <div className="mt-0.5 text-[11px] text-ink-muted">
                        {rc.anonymized_client_label}
                      </div>
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
