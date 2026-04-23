"use client";

import { useState } from "react";
import { Markdown } from "@/components/shared/markdown";

/*
  Three form factors for a use case per PROJECT.md §7.5:
  - Story: challenge → approach → outcome, rendered markdown
  - One-pager: embedded PDF placeholder with download CTA
  - Slides: embedded slides placeholder with download CTA

  Tabs are plain buttons styled as navy underlines — consistent with
  the editorial design, not shadcn Tabs.
*/

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
      <div className="flex gap-0 border-b border-ink-border">
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
        <div className="py-6">
          <h2 className="section-header mb-2">The challenge</h2>
          <Markdown>{story.challenge}</Markdown>

          <h2 className="section-header mt-8 mb-2">The approach</h2>
          <Markdown>{story.approach}</Markdown>

          <h2 className="section-header mt-8 mb-2">The outcome</h2>
          <Markdown>{story.outcome}</Markdown>
        </div>
      )}

      {tab === "one_pager" && (
        <div className="py-6">
          <h2 className="section-header mb-2">One-pager</h2>
          <div className="card-surface">
            <div className="flex aspect-[8.5/11] items-center justify-center bg-white">
              <div className="mx-6 text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
                  {clientLabel}
                </div>
                <h3 className="mt-3 text-[22px] font-bold leading-[1.15] text-navy">
                  {title}
                </h3>
                <div className="mt-6 inline-block border border-navy px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    Headline metric
                  </div>
                  <div className="mt-1 text-[22px] font-bold text-navy">
                    {headlineMetric}
                  </div>
                </div>
                <p className="mx-auto mt-6 max-w-md text-[12px] leading-[1.55] text-ink">
                  {pitch}
                </p>
                <p className="mt-6 text-[11px] text-ink-muted">
                  Branded PDF replaces this preview once the file is uploaded
                  through the admin CMS.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink-border pt-4">
            <div className="text-[12px] text-ink-muted">
              Preview. The real one-pager lives in Supabase Storage.
            </div>
            <button className="btn-primary" disabled>
              Download PDF
            </button>
          </div>
        </div>
      )}

      {tab === "slides" && (
        <div className="py-6">
          <h2 className="section-header mb-2">Slides</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { n: 1, label: "The challenge" },
              { n: 2, label: "The approach" },
              { n: 3, label: "The outcome" },
            ].map((s) => (
              <div key={s.n} className="card-surface">
                <div className="flex aspect-video items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                      Slide {s.n} · {s.label}
                    </div>
                    <div className="mt-2 text-[11px] text-ink-muted">
                      Placeholder preview.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink-border pt-4">
            <div className="text-[12px] text-ink-muted">
              Slides upload via the admin CMS. Embed replaces these placeholders.
            </div>
            <button className="btn-primary" disabled>
              Download slides
            </button>
          </div>
        </div>
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
      className={[
        "px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition",
        active
          ? "border-b-2 border-navy text-navy -mb-px"
          : "text-ink-muted hover:text-navy",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
