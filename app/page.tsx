import Link from "next/link";
import { getCurrentLab, getPastLabs, formatMonth } from "@/lib/content/labs";
import { MODULES } from "@/lib/content/modules";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";

/*
  Landing page. The product is AI Practical Labs — a monthly live
  working session. Everything else in the app supports the session.
  The landing page leads with the Lab, not the Canvas.
*/

export default function HomePage() {
  const lab = getCurrentLab();
  const past = getPastLabs();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {/* Title band */}
      <section className="bg-navy text-white">
        <div className="grid grid-cols-1 gap-4 px-8 py-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
              ArcticMind · AI Practical Labs
            </div>
            <h1 className="mt-1 text-[28px] font-bold leading-[1.15]">
              A monthly rhythm that turns AI access into fluency.
            </h1>
          </div>
          <div className="text-[11px] uppercase tracking-[0.12em] opacity-80">
            90 min · Up to 20 teammates · Every month
          </div>
        </div>
      </section>

      {/* Callout — the core claim */}
      <section className="callout mt-6">
        <p>
          Giving people access to AI doesn't make them good at it. That takes practice —
          the kind you can't get from a one-time workshop or a self-paced course.
          Practical Labs are monthly, hands-on working sessions where your team
          actually gets good at using AI, not just aware of it.
        </p>
      </section>

      {/* This month's Lab — the hero */}
      {lab && (
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-header mb-0">This month · {formatMonth(lab.month)}</h2>
            <Link
              href="/lab"
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
            >
              Open Lab →
            </Link>
          </div>
          <div className="mt-3 border border-navy">
            <div className="bg-navy px-6 py-4 text-white">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
                {new Date(lab.session_datetime).toLocaleString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}{" "}
                · {lab.session_duration_minutes} min · {lab.facilitator_name}
              </div>
              <div className="mt-1 text-[18px] font-bold leading-[1.2]">{lab.title}</div>
            </div>
            <div className="px-6 py-5 bg-white">
              <p className="text-[13px] leading-[1.6]">{lab.challenge_brief}</p>
              <div className="mt-4 flex items-center justify-between border-t border-ink-border pt-4">
                <div className="text-[12px] text-ink-muted">
                  Pre-work lives in Learning. RSVP + post-session artifacts live in the Lab hub.
                </div>
                <Link href="/lab" className="btn-primary">Go to the Lab →</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* The four promises — from the one-pager */}
      <h2 className="section-header mt-12 mb-3">How it works</h2>
      <div className="border border-ink-border">
        <HowRow n="01" title="Monthly live session built around your team" body="A group of up to 20 members of your team works through a real business problem using current AI tools. Everyone's doing the work, live, together." />
        <HowRow n="02" title="New challenge every month to always stay current" body="Each session covers different tools and techniques based on what's actually useful right now. Your team builds range instead of going deep on one thing that'll be obsolete next quarter." />
        <HowRow n="03" title="Run by people who do this for a living" body="ArcticBlue facilitators run enterprise AI enablement programs every day. These aren't vendor demos — they're actual working sessions led by expert practitioners." />
        <HowRow n="04" title="Snowball effect" body="Each month builds on the last. Over time, your team develops a shared vocabulary, a habit of experimenting, and the confidence to figure things out on their own." last />
      </div>

      {/* Snowball preview — recent labs */}
      {past.length > 0 && (
        <>
          <h2 className="section-header mt-12 mb-3">The snowball so far</h2>
          <div className="border border-ink-border">
            {past.slice(0, 3).map((l, idx, arr) => (
              <Link
                key={l.id}
                href={`/lab/${l.month.slice(0, 7)}`}
                className={`grid grid-cols-[110px_1fr_auto] items-start transition hover:bg-ice ${
                  idx === arr.length - 1 ? "" : "border-b border-ink-border"
                }`}
              >
                <div className="bg-navy px-4 py-4 text-center text-white">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
                    {new Date(l.month).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}
                  </div>
                  <div className="text-[20px] font-bold leading-none">
                    {new Date(l.month).toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC" })}
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    {l.facilitator_name}
                    {l.attendance && (
                      <> · {l.attendance.attended} of {l.attendance.invited} attended</>
                    )}
                  </div>
                  <div className="mt-0.5 text-[14px] font-bold text-navy">{l.title}</div>
                  {l.artifacts.length > 0 && (
                    <div className="mt-1 text-[12px] text-ink-muted">
                      {l.artifacts.length} team artifact{l.artifacts.length === 1 ? "" : "s"} shared
                    </div>
                  )}
                </div>
                <div className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
                  Recap →
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Between sessions — support surfaces */}
      <h2 className="section-header mt-12 mb-3">Between sessions</h2>
      <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-4">
        <BetweenCell kicker="Learning" title="Homework for the next Lab" body="Curated modules, videos, exercises, live workshops." stat={`${MODULES.length} modules`} href="/learning" />
        <BetweenCell kicker="Use Cases" title="How ArcticBlue clients did it" body="Anonymized proof points — story, PDF, slides." stat={`${USE_CASES.length} cases`} href="/use-cases" />
        <BetweenCell kicker="Tools" title="Practice the workflow first" body="Seeded chat, prompt library, templates." stat={`${PROMPTS.length + TEMPLATES.length} assets`} href="/tools" />
        <BetweenCell kicker="More" title="Canvas, Analyzer, Resources" body="Map opportunities, inspect companies, reference frameworks." stat="Full list" href="/between-sessions" last />
      </div>

      <div className="mt-10 border-t border-ink-border pt-6 text-center text-[12px] text-ink-muted">
        Returning?{" "}
        <Link href="/dashboard" className="text-navy hover:underline">
          Open your dashboard →
        </Link>
      </div>
    </div>
  );
}

function HowRow({ n, title, body, last }: { n: string; title: string; body: string; last?: boolean }) {
  return (
    <div className={`grid grid-cols-[72px_1fr] items-start ${last ? "" : "border-b border-ink-border"}`}>
      <div className="bg-navy px-4 py-4 text-center text-[18px] font-bold text-white">{n}</div>
      <div className="px-5 py-4">
        <div className="text-[14px] font-bold text-navy">{title}</div>
        <p className="mt-1 text-[13px] leading-[1.55] text-ink">{body}</p>
      </div>
    </div>
  );
}

function BetweenCell({
  kicker,
  title,
  body,
  stat,
  href,
  last,
}: {
  kicker: string;
  title: string;
  body: string;
  stat: string;
  href: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block bg-bg-card px-5 py-4 transition hover:bg-ice ${
        last ? "" : "md:border-r md:border-ink-border"
      } border-b border-ink-border md:border-b-0`}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">{kicker}</div>
      <div className="mt-1 text-[14px] font-bold text-ink">{title}</div>
      <p className="mt-1 text-[12px] leading-[1.55] text-ink">{body}</p>
      <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        <span>Open →</span>
        <span className="text-ink-muted">{stat}</span>
      </div>
    </Link>
  );
}
