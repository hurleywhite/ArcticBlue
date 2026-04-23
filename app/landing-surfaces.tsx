"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE, Stagger, staggerChild } from "@/components/motion/primitives";

/*
  Landing-page composition blocks. Separated so the server page stays
  small and the client-side motion stays local to the pieces that need it.
*/

export function LandingHero() {
  return (
    <section className="relative pb-16 pt-24 md:pb-24 md:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="kicker flex items-center gap-3"
      >
        <span className="data-dot" />
        ArcticMind · by ArcticBlue
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className="serif-tight mt-8 text-[56px] leading-[0.98] md:text-[84px]"
        style={{ color: "var(--fg-100)" }}
      >
        An instrument for navigating
        <br />
        <span className="italic" style={{ color: "var(--frost)" }}>
          AI
        </span>{" "}
        opportunity.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
        className="mt-8 max-w-xl text-[16px] leading-[1.6]"
        style={{ color: "var(--fg-72)" }}
      >
        Pipeline, deliverables, demos, and a reference library — built for
        the people who pitch, deliver, and scale AI Practical Labs.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
        className="mt-12 flex flex-wrap items-center gap-4"
      >
        <Link
          href="/workbench"
          className="btn-primary breathe"
          style={{ animationDuration: "3800ms" }}
        >
          Open workbench
          <span>→</span>
        </Link>
        <Link href="/deliverables" className="btn-secondary">
          Deliverables
        </Link>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--fg-32)" }}
        >
          ⌘ Everything saves locally
        </span>
      </motion.div>
    </section>
  );
}

export function NextUpStrip({
  accountId,
  company,
  title,
  whenLabel,
  poc,
  attendeeCount,
}: {
  accountId: string;
  company: string;
  title: string;
  whenLabel: string;
  poc: string;
  attendeeCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
      className="mb-10 overflow-hidden rounded-[4px]"
      style={{
        background: "var(--ink-raised)",
        border: "1px solid var(--fg-16)",
      }}
    >
      <div className="flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <span
            className="mt-2 data-dot"
            style={{ background: "var(--amber)" }}
            aria-hidden
          />
          <div>
            <div className="kicker flex items-center gap-2">
              <span>Next up</span>
              <span style={{ color: "var(--fg-32)" }}>·</span>
              <span>{whenLabel}</span>
            </div>
            <div
              className="serif mt-3 text-[22px] leading-[1.2] md:text-[26px]"
              style={{ color: "var(--fg-100)" }}
            >
              {title}
            </div>
            <div
              className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em]"
              style={{ color: "var(--fg-52)" }}
            >
              {company} · {poc} · {attendeeCount} attendee
              {attendeeCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
          <Link href="/workbench" className="btn-ghost">
            Full pipeline
          </Link>
          <Link
            href={`/workbench/accounts/${accountId}`}
            className="btn-primary"
          >
            Open meeting →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedToolStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
      className="relative mb-10 overflow-hidden rounded-[4px]"
      style={{
        background:
          "linear-gradient(135deg, var(--ink-raised) 0%, var(--ink-deep) 55%, var(--ink-raised) 100%)",
        border: "1px solid var(--frost-glow)",
      }}
    >
      {/* Frost halo in top-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, var(--frost) 0%, transparent 68%)",
          filter: "blur(18px)",
        }}
      />
      {/* Left frost accent rail */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-[2px]"
        style={{ background: "var(--frost)" }}
      />

      <div className="relative flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="mt-2 inline-block h-2 w-2 rounded-full"
            style={{
              background: "var(--frost)",
              animation: "breathe-opacity 3.8s ease-in-out infinite",
            }}
          />
          <div>
            <div className="kicker flex items-center gap-2">
              <span style={{ color: "var(--frost)" }}>New · Partner tools</span>
              <span style={{ color: "var(--fg-32)" }}>·</span>
              <span>Powered by Dust</span>
            </div>
            <div
              className="serif-tight mt-3 text-[28px] leading-[1.1] md:text-[34px]"
              style={{ color: "var(--fg-100)" }}
            >
              Event sourcer
              <span
                className="italic"
                style={{ color: "var(--frost)" }}
              >
                {" "}
                — in-person events, tailored per partner.
              </span>
            </div>
            <p
              className="mt-3 max-w-2xl text-[14px] leading-[1.6]"
              style={{ color: "var(--fg-72)" }}
            >
              Partner inputs in (focus, audience, themes, window), a filtered
              primary + halo event list out. Verified dates, speaking routes,
              sponsorship routes. Sorted by date. Copy or download per event.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
          <Link href="/tools/event-sourcer" className="btn-primary">
            Open event sourcer →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function LandingSurfaces({
  accountCount,
  deliverableCount,
  facilitatorCount,
  libraryCount,
}: {
  accountCount: number;
  deliverableCount: number;
  facilitatorCount: number;
  libraryCount: number;
}) {
  return (
    <div className="mt-4">
      <div className="mb-6 flex items-center gap-3">
        <span className="kicker">Sections</span>
        <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
      </div>

      <Stagger className="grid grid-cols-1 gap-px overflow-hidden md:grid-cols-2" style={{ background: "var(--fg-16)" }}>
        <SurfaceCard
          href="/workbench"
          kicker="Workbench"
          title="Pipeline and meeting prep"
          body={`${accountCount} accounts. Per-meeting brief drafted by Claude. Notes, stage picker, activity log all persist locally.`}
          stat={`${accountCount} accounts`}
        />
        <SurfaceCard
          href="/deliverables"
          kicker="Deliverables"
          title="Guided workflows with branded exports"
          body="Intake → Claude draft → branded PDF. Co-brand toggle and a referral block route clients back to ArcticBlue."
          stat={`${deliverableCount} workflows`}
        />
        <SurfaceCard
          href="/showcase"
          kicker="Showcase"
          title="Demos designed for screen share"
          body="Mirror, Canvas, Analyzer, Practice, case-study deck, Practical Labs explainer. Each has a present mode."
          stat="6 demos"
        />
        <SurfaceCard
          href="/facilitators"
          kicker="Facilitators"
          title="The global pool"
          body="External consultants and trainers. Filter by focus, experience, region. Pull into proposals."
          stat={`${facilitatorCount} profiles`}
        />
        <SurfaceCard
          href="/library"
          kicker="Library"
          title="Reference material"
          body="Prompts, templates, cases, resources, modules. Filter, cite, compose a proposal."
          stat={`${libraryCount} items`}
        />
        <SurfaceCard
          href="/mirror"
          kicker="Mirror"
          title="A company's opportunity field"
          body="Enter a domain. Eight opportunities orbit their core — sized by impact, positioned by readiness."
          stat="Sales demo"
          accent
        />
      </Stagger>
    </div>
  );
}

function SurfaceCard({
  href,
  kicker,
  title,
  body,
  stat,
  accent,
}: {
  href: string;
  kicker: string;
  title: string;
  body: string;
  stat: string;
  accent?: boolean;
}) {
  return (
    <motion.div variants={staggerChild}>
      <Link
        href={href}
        className="group relative block h-full"
        style={{
          background: "var(--ink-raised)",
          transition: "background 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      >
        {/* Hover-reveal border glow */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
          style={{
            boxShadow: "inset 0 0 0 1px var(--frost-glow)",
            transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
          }}
        />

        {accent && (
          <span
            className="pointer-events-none absolute right-5 top-5 h-8 w-8 rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(circle, var(--frost) 0%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />
        )}

        <div className="flex h-full flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <div className="kicker flex items-center gap-2">
              <span>{kicker}</span>
              <span style={{ color: "var(--fg-32)" }}>·</span>
              <span style={{ color: "var(--fg-52)" }}>{stat}</span>
            </div>
            <div
              className="serif-tight mt-5 text-[26px] leading-[1.1]"
              style={{ color: "var(--fg-100)" }}
            >
              {title}
            </div>
            <p
              className="mt-4 text-[14px] leading-[1.6]"
              style={{ color: "var(--fg-52)" }}
            >
              {body}
            </p>
          </div>
          <div
            className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] transition-transform duration-200"
            style={{
              color: "var(--frost)",
              transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
            }}
          >
            <span>Open</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
