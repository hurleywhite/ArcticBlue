"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Stagger, staggerChild } from "@/components/motion/primitives";

type ShowcaseItem = {
  kicker: string;
  title: string;
  body: string;
  openHref: string;
  presentHref: string;
  stat: string;
  accent?: boolean;
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
    accent: true,
  },
  {
    kicker: "02 · Canvas",
    title: "Opportunity map by role and industry",
    body:
      "Pick a role and an industry. Eight opportunities across three lenses. Star and build a shortlist.",
    openHref: "/showcase/canvas",
    presentHref: "/showcase/canvas?present=1",
    stat: "10 × 10",
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
  },
  {
    kicker: "06 · Practical Labs",
    title: "Product explainer",
    body:
      "Six-beat walkthrough of what clients buy: problem, the Lab, how it works, walkaway, what's included, close.",
    openHref: "/showcase/lab",
    presentHref: "/showcase/lab?present=1",
    stat: "From the one-pager",
  },
];

export function ShowcaseGallery() {
  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="kicker">Six demos</span>
        <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
      </div>

      <Stagger
        className="grid grid-cols-1 gap-px overflow-hidden md:grid-cols-2"
        style={{ background: "var(--fg-16)" }}
      >
        {ITEMS.map((item) => (
          <motion.div key={item.kicker} variants={staggerChild}>
            <article
              className="group relative flex h-full flex-col justify-between gap-8 p-8"
              style={{
                background: "var(--ink-raised)",
                transition: "background 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
                style={{
                  boxShadow: "inset 0 0 0 1px var(--frost-glow)",
                  transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
                }}
              />
              {item.accent && (
                <span
                  className="pointer-events-none absolute right-6 top-6 h-10 w-10 rounded-full opacity-50"
                  style={{
                    background:
                      "radial-gradient(circle, var(--frost) 0%, transparent 70%)",
                    filter: "blur(8px)",
                  }}
                />
              )}

              <div>
                <div className="kicker flex items-center gap-2">
                  <span>{item.kicker}</span>
                  <span style={{ color: "var(--fg-32)" }}>·</span>
                  <span style={{ color: "var(--fg-52)" }}>{item.stat}</span>
                </div>
                <div
                  className="serif-tight mt-5 text-[26px] leading-[1.1]"
                  style={{ color: "var(--fg-100)" }}
                >
                  {item.title}
                </div>
                <p
                  className="mt-4 text-[14px] leading-[1.6]"
                  style={{ color: "var(--fg-52)" }}
                >
                  {item.body}
                </p>
              </div>

              <div
                className="flex items-center justify-between border-t pt-5"
                style={{ borderTopColor: "var(--fg-16)" }}
              >
                <Link
                  href={item.openHref}
                  className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] transition-colors"
                  style={{ color: "var(--fg-52)" }}
                >
                  Open
                </Link>
                <Link
                  href={item.presentHref}
                  className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                  style={{ color: "var(--frost)" }}
                >
                  <span>Present mode</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </article>
          </motion.div>
        ))}
      </Stagger>
    </div>
  );
}
