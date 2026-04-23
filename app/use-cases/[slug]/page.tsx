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
    <div className="shell pb-32 pt-8">
      {/* Header — dark band with frost accent rail */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--fg-16)",
          borderRadius: 2,
        }}
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-[2px]"
          style={{ background: "var(--frost)" }}
        />
        <div className="px-7 py-6">
          <div className="kicker-sm">
            <Link
              href="/use-cases"
              style={{ color: "var(--frost)" }}
              className="hover:opacity-80"
            >
              Use Cases
            </Link>
            <span className="mx-2" style={{ color: "var(--fg-32)" }}>·</span>
            <span>{u.anonymized_client_label}</span>
            <span className="mx-2" style={{ color: "var(--fg-32)" }}>·</span>
            <span>{(u.tags.industries ?? []).join(" · ")}</span>
          </div>
          <h1
            className="serif-tight mt-3 text-[32px] leading-[1.1]"
            style={{ color: "var(--fg-100)" }}
          >
            {u.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div
              className="serif text-[20px] leading-[1]"
              style={{ color: "var(--frost)" }}
            >
              {u.headline_metric}
            </div>
            <div
              className="text-[13px] leading-[1.55]"
              style={{ color: "var(--fg-72)" }}
            >
              {u.summary.split(".")[0]}.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[1fr_260px]">
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
          <div className="flex items-center gap-3">
            <span className="kicker">30-second pitch</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <div className="callout mt-3">
            <p>{u.pitch_30sec}</p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="kicker">Tags</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(u.tags.industries ?? []).map((i) => (
              <Pill key={i}>{i}</Pill>
            ))}
            {(u.tags.categories ?? []).map((c) => (
              <Pill key={c} frost>
                {c}
              </Pill>
            ))}
          </div>

          {relatedModules.length > 0 && (
            <>
              <div className="mt-8 flex items-center gap-3">
                <span className="kicker">Related learning</span>
                <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
              </div>
              <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
                {relatedModules.map((m) => (
                  <AsideLink
                    key={m.id}
                    href={`/learning/${m.slug}`}
                    title={m.title}
                    sub={`${m.estimated_minutes} min`}
                  />
                ))}
              </ul>
            </>
          )}

          {relatedPrompts.length > 0 && (
            <>
              <div className="mt-8 flex items-center gap-3">
                <span className="kicker">Try this approach</span>
                <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
              </div>
              <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
                {relatedPrompts.map((p) => (
                  <AsideLink
                    key={p.id}
                    href={`/tools/prompts/${p.slug}`}
                    title={p.title}
                    sub="Prompt · try it in Practice"
                  />
                ))}
              </ul>
            </>
          )}

          {relatedCases.length > 0 && (
            <>
              <div className="mt-8 flex items-center gap-3">
                <span className="kicker">Related cases</span>
                <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
              </div>
              <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
                {relatedCases.map((rc) => (
                  <AsideLink
                    key={rc.id}
                    href={`/use-cases/${rc.slug}`}
                    title={rc.title}
                    sub={rc.anonymized_client_label}
                  />
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Pill({
  children,
  frost,
}: {
  children: React.ReactNode;
  frost?: boolean;
}) {
  return (
    <span
      className="font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
      style={{
        padding: "3px 7px",
        background: frost ? "rgba(139, 178, 237, 0.12)" : "var(--ink-raised)",
        border: `1px solid ${frost ? "var(--frost-deep)" : "var(--fg-16)"}`,
        color: frost ? "var(--frost)" : "var(--fg-72)",
        borderRadius: 2,
      }}
    >
      {children}
    </span>
  );
}

function AsideLink({
  href,
  title,
  sub,
}: {
  href: string;
  title: string;
  sub: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group relative block px-3 py-2.5 no-underline"
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--fg-16)",
          borderRadius: 2,
          transition: "border-color 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 1px var(--frost-glow)" }}
        />
        <div
          className="relative font-mono text-[11px] uppercase tracking-[0.14em] transition-colors group-hover:text-[color:var(--frost)]"
          style={{ color: "var(--fg-100)" }}
        >
          {title}
        </div>
        <div
          className="relative mt-0.5 text-[11px]"
          style={{ color: "var(--fg-52)" }}
        >
          {sub}
        </div>
      </Link>
    </li>
  );
}
