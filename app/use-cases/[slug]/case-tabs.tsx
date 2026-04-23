"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Markdown } from "@/components/shared/markdown";

type Tab = "story" | "one_pager" | "slides";

export function CaseTabs({
  story,
  onePagerAvailable,
  slidesAvailable,
  pitch,
  clientLabel,
  title,
  headlineMetric,
}: {
  story: { challenge: string; approach: string; outcome: string };
  onePagerAvailable: boolean;
  slidesAvailable: boolean;
  pitch: string;
  clientLabel: string;
  title: string;
  headlineMetric: string;
}) {
  const [tab, setTab] = useState<Tab>("story");

  return (
    <div>
      <div
        className="flex gap-0"
        style={{ borderBottom: "1px solid var(--fg-16)" }}
      >
        <TabButton active={tab === "story"} onClick={() => setTab("story")}>
          Story
        </TabButton>
        <TabButton
          active={tab === "one_pager"}
          onClick={() => setTab("one_pager")}
          disabled={!onePagerAvailable}
        >
          One-pager
        </TabButton>
        <TabButton
          active={tab === "slides"}
          onClick={() => setTab("slides")}
          disabled={!slidesAvailable}
        >
          Slides
        </TabButton>
      </div>

      {tab === "story" && (
        <motion.div
          key="story"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          className="py-8"
        >
          <section>
            <div className="flex items-center gap-3">
              <span className="kicker">The challenge</span>
              <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
            </div>
            <div className="mt-3">
              <Markdown>{story.challenge}</Markdown>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center gap-3">
              <span className="kicker">The approach</span>
              <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
            </div>
            <div className="mt-3">
              <Markdown>{story.approach}</Markdown>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center gap-3">
              <span className="kicker">The outcome</span>
              <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
            </div>
            <div className="mt-3">
              <Markdown>{story.outcome}</Markdown>
            </div>
          </section>
        </motion.div>
      )}

      {tab === "one_pager" && (
        <motion.div
          key="one_pager"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          className="py-8"
        >
          <div className="flex items-center gap-3">
            <span className="kicker">One-pager</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <div
            className="mt-4 overflow-hidden"
            style={{
              border: "1px solid var(--fg-16)",
              borderRadius: 2,
            }}
          >
            <div
              className="flex aspect-[8.5/11] items-center justify-center"
              style={{ background: "var(--paper)" }}
            >
              <div className="mx-6 text-center">
                <div
                  className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]"
                  style={{ color: "var(--ink-deep)" }}
                >
                  {clientLabel}
                </div>
                <h3
                  className="serif-tight mt-4 text-[28px] leading-[1.1]"
                  style={{ color: "var(--ink-deep)" }}
                >
                  {title}
                </h3>
                <div
                  className="mt-8 inline-block px-5 py-4"
                  style={{ border: "1px solid var(--ink-deep)" }}
                >
                  <div
                    className="font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                    style={{ color: "var(--ink-deep)", opacity: 0.6 }}
                  >
                    Headline metric
                  </div>
                  <div
                    className="serif-tight mt-1 text-[26px]"
                    style={{ color: "var(--ink-deep)" }}
                  >
                    {headlineMetric}
                  </div>
                </div>
                <p
                  className="mx-auto mt-6 max-w-md text-[13px] leading-[1.55]"
                  style={{ color: "var(--ink-deep)", opacity: 0.75 }}
                >
                  {pitch}
                </p>
                <p
                  className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: "var(--ink-deep)", opacity: 0.5 }}
                >
                  Preview · real file in Supabase Storage
                </p>
              </div>
            </div>
          </div>
          <div
            className="mt-4 flex items-center justify-between border-t pt-4"
            style={{ borderTopColor: "var(--fg-16)" }}
          >
            <div
              className="font-mono text-[11px]"
              style={{ color: "var(--fg-52)" }}
            >
              Preview. The real one-pager lives in Supabase Storage.
            </div>
            <button className="btn-primary" disabled>
              Download PDF
            </button>
          </div>
        </motion.div>
      )}

      {tab === "slides" && (
        <motion.div
          key="slides"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          className="py-8"
        >
          <div className="flex items-center gap-3">
            <span className="kicker">Slides</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
          </div>
          <div
            className="mt-4 grid grid-cols-1 gap-px overflow-hidden md:grid-cols-2"
            style={{ background: "var(--fg-16)" }}
          >
            {[
              { n: 1, label: "The challenge" },
              { n: 2, label: "The approach" },
              { n: 3, label: "The outcome" },
            ].map((s) => (
              <div
                key={s.n}
                className="flex aspect-video items-center justify-center"
                style={{ background: "var(--ink-raised)" }}
              >
                <div className="text-center">
                  <div className="kicker-sm">
                    Slide {s.n} · {s.label}
                  </div>
                  <div
                    className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: "var(--fg-32)" }}
                  >
                    Placeholder preview
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 flex items-center justify-between border-t pt-4"
            style={{ borderTopColor: "var(--fg-16)" }}
          >
            <div
              className="font-mono text-[11px]"
              style={{ color: "var(--fg-52)" }}
            >
              Slides upload via the admin CMS. Embed replaces these placeholders.
            </div>
            <button className="btn-primary" disabled>
              Download slides
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative font-mono text-[11px] font-medium uppercase tracking-[0.16em]"
      style={{
        padding: "10px 16px",
        background: "transparent",
        color: active ? "var(--fg-100)" : "var(--fg-52)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "color 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
      }}
    >
      {children}
      {active && (
        <motion.span
          layoutId="case-tab-underline"
          className="absolute bottom-[-1px] left-0 right-0 h-[2px]"
          style={{ background: "var(--frost)" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        />
      )}
    </button>
  );
}
