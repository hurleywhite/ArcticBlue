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
    title: "Opportunity field for a company",
    body:
      "Enter a domain. Eight opportunities plotted around the company — sized by impact, positioned by readiness. Star three, export a brief.",
    openHref: "/mirror",
    presentHref: "/mirror",
    stat: "5 demo companies",
    accent: "navy",
  },
  {
    kicker: "02 · Canvas",
    title: "Opportunity map by role and industry",
    body:
      "Pick a role and an industry. Eight opportunities across three lenses. Star and build a shortlist.",
    openHref: "/showcase/canvas",
    presentHref: "/showcase/canvas?present=1",
    stat: "10 roles × 10 industries",
  },
  {
    kicker: "03 · Analyzer",
    title: "Company profile, live",
    body:
      "Enter a domain. Firmographics, detected tech stack, recent signals, AI-adoption notes, and actionable insights.",
    openHref: "/showcase/analyzer",
    presentHref: "/showcase/analyzer?present=1",
    stat: "Apollo + Exa + Claude",
  },
  {
    kicker: "04 · Practice",
    title: "Seeded chat with Claude",
    body:
      "Start a session from a Canvas opportunity, a module exercise, or a prompt. Streamed response, markdown export.",
    openHref: "/showcase/practice",
    presentHref: "/showcase/practice?present=1",
    stat: "Claude Sonnet 4.6",
  },
  {
    kicker: "05 · Case studies",
    title: "Click-through deck",
    body:
      "Six case studies. Each reveals business challenge, solution, and impact in sequence. Sidebar jump or arrow keys.",
    openHref: "/showcase/cases",
    presentHref: "/showcase/cases?present=1",
    stat: "6 cases",
    accent: "ice",
  },
  {
    kicker: "06 · Practical Labs",
    title: "Product explainer",
    body:
      "Six-beat walkthrough of what clients buy: problem, the Lab, how it works, walkaway, what's included, close.",
    openHref: "/showcase/lab",
    presentHref: "/showcase/lab?present=1",
    stat: "From the one-pager",
    accent: "ice",
  },
];

export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Showcase"
        title="Demos for screen share."
      />

      <div className="callout mt-6">
        <p>
          Each demo has a present mode — full-bleed, keyboard-navigable, no app chrome.
          Esc exits.
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
