"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DELIVERABLES } from "@/lib/content/deliverables";
import { Stagger, staggerChild } from "@/components/motion/primitives";

export function DeliverableGalleryClient() {
  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="kicker">Workflows · {DELIVERABLES.length}</span>
        <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
      </div>

      <Stagger
        className="grid grid-cols-1 gap-px overflow-hidden md:grid-cols-2"
        style={{ background: "var(--fg-16)" }}
      >
        {DELIVERABLES.map((d) => (
          <motion.div key={d.id} variants={staggerChild}>
            <Link
              href={`/deliverables/${d.slug}`}
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
              <div>
                <div className="kicker flex items-center gap-2">
                  <span>{d.category}</span>
                  <span style={{ color: "var(--fg-32)" }}>·</span>
                  <span>~{d.minutes} min</span>
                </div>
                <div
                  className="serif-tight mt-5 text-[26px] leading-[1.1]"
                  style={{ color: "var(--fg-100)" }}
                >
                  {d.title}
                </div>
                <p
                  className="mt-4 text-[14px] leading-[1.6]"
                  style={{ color: "var(--fg-52)" }}
                >
                  {d.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px overflow-hidden" style={{ background: "var(--fg-16)" }}>
                <MetaCell label="When" value={d.when_to_use} />
                <MetaCell label="Produces" value={d.produces} />
              </div>

              <div
                className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                style={{ color: "var(--frost)" }}
              >
                <span>Start workflow</span>
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </Stagger>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="px-3 py-3"
      style={{ background: "var(--ink-deep)" }}
    >
      <div className="kicker-sm">{label}</div>
      <div
        className="mt-1 text-[12px] leading-[1.45]"
        style={{ color: "var(--fg-72)" }}
      >
        {value}
      </div>
    </div>
  );
}
