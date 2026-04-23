"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { marked } from "marked";
import type { UseCase } from "@/lib/content/types";

/*
  Case walk. In normal mode, a sidebar lists cases and the main pane
  shows the active one with slide navigation. In present mode the
  sidebar is hidden and the main pane takes the whole screen with
  bigger type.

  Slides: 1. Setup (client + metric), 2. Challenge, 3. Approach,
  4. Outcome, 5. Pitch close. Arrow keys advance.
*/

type Slide = "setup" | "challenge" | "approach" | "outcome" | "close";
const SLIDES: Slide[] = ["setup", "challenge", "approach", "outcome", "close"];

export function CaseWalkApp({ cases }: { cases: UseCase[] }) {
  const searchParams = useSearchParams();
  const isPresenting = searchParams?.get("present") === "1";
  const [activeSlug, setActiveSlug] = useState<string>(cases[0]?.slug ?? "");
  const [slide, setSlide] = useState<Slide>("setup");

  const active = cases.find((c) => c.slug === activeSlug) ?? cases[0];

  // Keyboard nav in present mode
  useEffect(() => {
    if (!isPresenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setSlide((s) => {
          const idx = SLIDES.indexOf(s);
          return SLIDES[Math.min(SLIDES.length - 1, idx + 1)];
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlide((s) => {
          const idx = SLIDES.indexOf(s);
          return SLIDES[Math.max(0, idx - 1)];
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresenting]);

  useEffect(() => {
    setSlide("setup");
  }, [activeSlug]);

  if (!active) return null;

  return (
    <div className={isPresenting ? "min-h-screen bg-navy text-white" : "mx-auto max-w-[1200px] px-6 py-8"}>
      {!isPresenting && (
        <div className="mb-6 bg-navy px-6 py-4 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
            Showcase · Case walks
          </div>
          <div className="mt-0.5 text-[20px] font-bold leading-[1.15]">
            Three minutes, one proof point.
          </div>
        </div>
      )}

      <div className={isPresenting ? "flex min-h-screen items-stretch" : "grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]"}>
        {/* Sidebar — case picker (only shown outside present mode) */}
        {!isPresenting && (
          <aside className="space-y-0 border border-ink-border">
            {cases.map((c, idx) => (
              <button
                key={c.slug}
                onClick={() => setActiveSlug(c.slug)}
                className={`block w-full text-left transition ${
                  c.slug === active.slug ? "bg-ice" : "bg-white hover:bg-bg-card"
                } ${idx === cases.length - 1 ? "" : "border-b border-ink-border"}`}
              >
                <div className="px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    {c.anonymized_client_label}
                  </div>
                  <div className="mt-0.5 text-[12px] font-bold text-navy leading-[1.25]">
                    {c.title.slice(0, 60)}
                    {c.title.length > 60 ? "…" : ""}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-muted">{c.headline_metric}</div>
                </div>
              </button>
            ))}
          </aside>
        )}

        {/* Main — active slide */}
        <div className={isPresenting ? "flex w-full items-center justify-center px-[10vw] py-[8vh]" : ""}>
          <CaseSlide active={active} slide={slide} isPresenting={!!isPresenting} />
        </div>
      </div>

      {/* Slide nav */}
      <div
        className={
          isPresenting
            ? "fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
            : "mt-6"
        }
      >
        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s}
              onClick={() => setSlide(s)}
              className={
                s === slide
                  ? isPresenting
                    ? "border border-white/70 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
                    : "border border-navy bg-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                  : isPresenting
                    ? "border border-white/30 bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 hover:border-white hover:text-white"
                    : "border border-ink-border bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
              }
            >
              0{i + 1} · {labelFor(s)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CaseSlide({
  active,
  slide,
  isPresenting,
}: {
  active: UseCase;
  slide: Slide;
  isPresenting: boolean;
}) {
  const html = useMemo(() => {
    if (slide === "challenge") return marked.parse(active.challenge_markdown, { async: false }) as string;
    if (slide === "approach") return marked.parse(active.approach_markdown, { async: false }) as string;
    if (slide === "outcome") return marked.parse(active.outcome_markdown, { async: false }) as string;
    return "";
  }, [active, slide]);

  const common = isPresenting ? "max-w-[900px] w-full" : "";

  if (slide === "setup") {
    return (
      <div className={common}>
        <div
          className={
            isPresenting
              ? "text-[11px] font-bold uppercase tracking-[0.15em] text-white/70"
              : "text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
          }
        >
          {active.anonymized_client_label} · {(active.tags.industries ?? []).join(" · ")}
        </div>
        <h1
          className={
            isPresenting
              ? "mt-3 text-[54px] font-bold leading-[1.05] text-white"
              : "mt-2 text-[26px] font-bold leading-[1.15] text-navy"
          }
        >
          {active.title}
        </h1>
        <p
          className={
            isPresenting
              ? "mt-6 max-w-[800px] text-[18px] leading-[1.55] text-white/80"
              : "mt-4 text-[14px] leading-[1.65] text-ink"
          }
        >
          {active.summary}
        </p>
        <div className={isPresenting ? "mt-10 border-t border-white/20 pt-6" : "mt-6 border-t border-ink-border pt-4"}>
          <div
            className={
              isPresenting
                ? "text-[11px] font-bold uppercase tracking-[0.15em] text-white/70"
                : "text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted"
            }
          >
            Headline metric
          </div>
          <div
            className={
              isPresenting
                ? "mt-2 text-[84px] font-bold leading-[1.02] text-white"
                : "mt-1 text-[36px] font-bold leading-[1.05] text-navy"
            }
          >
            {active.headline_metric}
          </div>
        </div>
      </div>
    );
  }

  if (slide === "close") {
    return (
      <div className={common}>
        <div
          className={
            isPresenting
              ? "text-[11px] font-bold uppercase tracking-[0.15em] text-white/70"
              : "text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
          }
        >
          30-second pitch
        </div>
        <p
          className={
            isPresenting
              ? "mt-4 text-[32px] font-bold leading-[1.25] text-white"
              : "mt-2 text-[18px] font-bold leading-[1.35] text-navy"
          }
        >
          "{active.pitch_30sec}"
        </p>
        <div className={isPresenting ? "mt-10 text-[14px] text-white/70" : "mt-4 text-[12px] text-ink-muted"}>
          Assets: Story · {active.one_pager_available ? "One-pager PDF" : "No PDF"}
          {active.slides_available ? " · Slides" : ""}
        </div>
      </div>
    );
  }

  return (
    <div className={common}>
      <div
        className={
          isPresenting
            ? "text-[11px] font-bold uppercase tracking-[0.15em] text-white/70"
            : "text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
        }
      >
        {labelFor(slide).toUpperCase()}
      </div>
      <div
        className={
          isPresenting
            ? "prose-editorial mt-4 max-w-none text-[18px] leading-[1.6] text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_p]:text-white/90 [&_strong]:text-white"
            : "prose-editorial mt-3"
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function labelFor(s: Slide): string {
  return s === "setup" ? "Setup" : s === "challenge" ? "Challenge" : s === "approach" ? "Approach" : s === "outcome" ? "Outcome" : "Close";
}
