import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { USE_CASES } from "@/lib/content/use-cases";

export const metadata = { title: "Showcase · ArcticMind" };

/*
  Showcase gallery. Every tile is a demo-ready surface with a
  "Present mode →" CTA. The sales team opens one of these on a screen
  share in a meeting; the Exit button is the only affordance so the
  client sees the product, not the app.
*/

type ShowcaseItem = {
  kicker: string;
  title: string;
  body: string;
  openHref: string;
  presentHref: string;
  stat: string;
  accent?: "navy" | "ice";
};

const ITEMS: ShowcaseItem[] = [
  {
    kicker: "01 · Mirror",
    title: "The opportunity field, visualized",
    body:
      "Type the prospect's domain. The orbital map places eight opportunities around their company: sized by impact, positioned by readiness, colored by category. Star three, export a branded brief.",
    openHref: "/mirror",
    presentHref: "/mirror",
    stat: "Curated archetypes · 5 demo companies",
    accent: "navy",
  },
  {
    kicker: "02 · Canvas",
    title: "Role × industry opportunity map",
    body:
      "In a discovery call, ask the buyer to pick their role and industry. The Canvas streams eight specific opportunities across three strategic lenses. Star what matters, build a shortlist on the screen.",
    openHref: "/showcase/canvas",
    presentHref: "/showcase/canvas?present=1",
    stat: "10 roles × 10 industries",
  },
  {
    kicker: "03 · Analyzer",
    title: "Their company, their profile — live",
    body:
      "Apollo firmographics, detected tech stack, Exa-sourced recent signals, Claude-synthesized AI adoption read, and three actionable insights. Run it live with the prospect watching.",
    openHref: "/showcase/analyzer",
    presentHref: "/showcase/analyzer?present=1",
    stat: "Apollo + Exa + Claude",
  },
  {
    kicker: "04 · Practice",
    title: "Claude, working on their actual task",
    body:
      "Seed the sandbox with a task they mentioned on the call. Streaming response from Claude Sonnet 4.6, rendered in clean markdown. Exportable as an artifact they can keep.",
    openHref: "/showcase/practice",
    presentHref: "/showcase/practice?present=1",
    stat: "Claude Sonnet 4.6",
  },
  {
    kicker: "05 · Case walks",
    title: "Three minutes, one proof point",
    body:
      "Seven anonymized engagements, each with a story, a one-pager PDF, a slide deck. The case walk cycles through challenge → approach → outcome with the headline metric as the close.",
    openHref: "/showcase/cases",
    presentHref: "/showcase/cases?present=1",
    stat: `${USE_CASES.length} cases`,
    accent: "ice",
  },
  {
    kicker: "06 · The Lab",
    title: "What they'd actually buy, in four panels",
    body:
      "The one-pager pitch, animated. Monthly session, real work, facilitated by people who do this for a living, compounded over time. End with what's included and how to start.",
    openHref: "/showcase/lab",
    presentHref: "/showcase/lab?present=1",
    stat: "AI Practical Labs",
    accent: "ice",
  },
];

export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Showcase"
        title="Open any tile on a screen share. Exit with Esc."
      />

      <div className="callout mt-6">
        <p>
          Every surface has a present mode — full-bleed, no nav, keyboard-navigable —
          so the client sees the product, not the app. Use the open links to demo
          interactively from a meeting.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {ITEMS.map((item) => (
          <article
            key={item.kicker}
            className={`border border-ink-border ${
              item.accent === "ice" ? "bg-ice" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between bg-navy px-5 py-3 text-white">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {item.kicker}
                </div>
                <div className="mt-0.5 text-[16px] font-bold leading-[1.15]">{item.title}</div>
              </div>
              <span className="border border-white/30 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]">
                {item.stat}
              </span>
            </div>
            <div className="px-5 py-4">
              <p className="text-[13px] leading-[1.6] text-ink">{item.body}</p>
              <div className="mt-4 flex items-center justify-between border-t border-ink-border pt-3">
                <Link
                  href={item.openHref}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                >
                  Open →
                </Link>
                <Link
                  href={item.presentHref}
                  className="border border-navy bg-navy px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-navy-hover"
                >
                  Present mode →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
