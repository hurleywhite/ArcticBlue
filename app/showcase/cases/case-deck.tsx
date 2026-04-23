"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CASE_STUDIES,
  CREATE_CATEGORIES,
  TRANSFORM_CATEGORIES,
  type CaseStudy,
} from "@/lib/content/case-studies";

/*
  Interactive case-study deck — click through like a slide deck.

  Slide 0 = the TRANSFORM / CREATE index (8 opportunity categories).
  Slides 1..N = one per case study, each with:
    - Client + logo (when available)
    - Tagline
    - Three reveal panels: Business Challenge → Solution → Impact
    - Panel-by-panel reveal (press right arrow to advance within a slide)

  Keyboard: arrow keys + space advance. Backspace / left arrow go back.
  In present mode the sidebar hides and the stage takes the whole screen.
*/

type Slide = { kind: "index" } | { kind: "case"; study: CaseStudy };

const SLIDES: Slide[] = [
  { kind: "index" },
  ...CASE_STUDIES.map((study) => ({ kind: "case" as const, study })),
];

type Panel = 0 | 1 | 2; // 0=challenge, 1=solution, 2=impact

export function CaseDeck() {
  const searchParams = useSearchParams();
  const isPresenting = searchParams?.get("present") === "1";
  const [slideIdx, setSlideIdx] = useState(0);
  const [panel, setPanel] = useState<Panel>(0);

  const slide = SLIDES[slideIdx];

  // Keyboard nav — panels first, then slides
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowLeft" || e.key === "Backspace" || e.key === "PageUp") {
        e.preventDefault();
        retreat();
      } else if (e.key === "Home") {
        setSlideIdx(0);
        setPanel(0);
      } else if (e.key === "End") {
        setSlideIdx(SLIDES.length - 1);
        setPanel(2);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIdx, panel]);

  const advance = () => {
    if (slide.kind === "case" && panel < 2) {
      setPanel((p) => (p + 1) as Panel);
      return;
    }
    if (slideIdx < SLIDES.length - 1) {
      setSlideIdx(slideIdx + 1);
      setPanel(0);
    }
  };
  const retreat = () => {
    if (slide.kind === "case" && panel > 0) {
      setPanel((p) => (p - 1) as Panel);
      return;
    }
    if (slideIdx > 0) {
      const prev = SLIDES[slideIdx - 1];
      setSlideIdx(slideIdx - 1);
      setPanel(prev.kind === "case" ? 2 : 0);
    }
  };

  const jumpTo = (idx: number) => {
    setSlideIdx(idx);
    setPanel(0);
  };

  return (
    <div className={isPresenting ? "min-h-screen bg-navy text-white" : "mx-auto max-w-[1200px] px-6 py-8"}>
      {!isPresenting && (
        <div className="mb-6 bg-navy px-6 py-4 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
            Showcase · Case studies
          </div>
          <div className="mt-0.5 text-[20px] font-bold leading-[1.15]">
            Click through the deck.
          </div>
        </div>
      )}

      <div className={isPresenting ? "flex min-h-screen" : "grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]"}>
        {!isPresenting && (
          <aside className="border border-ink-border">
            <button
              onClick={() => jumpTo(0)}
              className={`block w-full border-b border-ink-border text-left transition ${
                slide.kind === "index" ? "bg-ice" : "bg-white hover:bg-bg-card"
              }`}
            >
              <div className="px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  Index
                </div>
                <div className="mt-0.5 text-[12px] font-bold leading-[1.25] text-navy">
                  Transform internal ops · Create external solutions
                </div>
              </div>
            </button>
            {CASE_STUDIES.map((study, i) => (
              <button
                key={study.id}
                onClick={() => jumpTo(i + 1)}
                className={`block w-full text-left transition ${
                  slide.kind === "case" && slide.study.id === study.id
                    ? "bg-ice"
                    : "bg-white hover:bg-bg-card"
                } ${i === CASE_STUDIES.length - 1 ? "" : "border-b border-ink-border"}`}
              >
                <div className="px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    0{i + 1} · {study.client_label}
                  </div>
                  <div className="mt-0.5 text-[12px] font-bold leading-[1.25] text-navy">
                    {study.title}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-muted">
                    {study.impact[0]?.metric}
                  </div>
                </div>
              </button>
            ))}
          </aside>
        )}

        <div
          className={
            isPresenting
              ? "flex w-full items-center justify-center px-[8vw] py-[8vh]"
              : ""
          }
        >
          <div className={isPresenting ? "w-full max-w-[1000px]" : ""}>
            {slide.kind === "index" ? (
              <IndexSlide isPresenting={isPresenting} />
            ) : (
              <CaseSlide study={slide.study} panel={panel} isPresenting={isPresenting} />
            )}
          </div>
        </div>
      </div>

      {/* Footer controls — slide position + panel dots + next/back */}
      <div
        className={
          isPresenting
            ? "fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
            : "mt-6"
        }
      >
        <div className={isPresenting ? "flex items-center gap-3 rounded-none border border-white/30 bg-navy/80 px-4 py-2 backdrop-blur-sm" : "flex items-center gap-3 border border-ink-border bg-bg-card px-4 py-2"}>
          <button
            onClick={retreat}
            className={
              isPresenting
                ? "border border-white/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:border-white hover:bg-white/10"
                : "border border-ink-border bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
            }
          >
            ← Back
          </button>
          <div
            className={
              isPresenting
                ? "text-[10px] font-bold uppercase tracking-[0.15em] text-white/80"
                : "text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted"
            }
          >
            {slideIdx === 0 ? "Index" : `Case ${slideIdx} of ${CASE_STUDIES.length}`}
            {slide.kind === "case" && (
              <span className="ml-3">
                {["Challenge", "Solution", "Impact"][panel]} ({panel + 1}/3)
              </span>
            )}
          </div>
          <button
            onClick={advance}
            className={
              isPresenting
                ? "border border-white bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:bg-ice"
                : "border border-navy bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:bg-navy-hover"
            }
          >
            {slide.kind === "case" && panel < 2 ? "Reveal →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IndexSlide({ isPresenting }: { isPresenting: boolean }) {
  return (
    <div>
      <Kicker isPresenting={isPresenting}>Case studies · Index</Kicker>
      <Headline isPresenting={isPresenting}>
        Transform internal operations. Create external solutions.
      </Headline>
      <p
        className={
          isPresenting
            ? "mt-6 max-w-[820px] text-[18px] leading-[1.55] text-white/85"
            : "mt-3 max-w-[720px] text-[14px] leading-[1.65] text-ink"
        }
      >
        Six case studies across both lenses.
      </p>

      <div
        className={
          isPresenting
            ? "mt-12 grid grid-cols-2 gap-10"
            : "mt-8 grid grid-cols-1 gap-6 md:grid-cols-2"
        }
      >
        <IndexColumn
          kicker="Transform"
          label="internal operations"
          categories={TRANSFORM_CATEGORIES}
          isPresenting={isPresenting}
        />
        <IndexColumn
          kicker="Create"
          label="external solutions"
          categories={CREATE_CATEGORIES}
          isPresenting={isPresenting}
        />
      </div>
    </div>
  );
}

function IndexColumn({
  kicker,
  label,
  categories,
  isPresenting,
}: {
  kicker: string;
  label: string;
  categories: { role: string; headline: string }[];
  isPresenting: boolean;
}) {
  return (
    <div
      className={
        isPresenting
          ? "border border-white/30 bg-white/5 px-6 py-6"
          : "border border-ink-border bg-bg-card px-5 py-5"
      }
    >
      <div
        className={
          isPresenting
            ? "text-[11px] font-bold uppercase tracking-[0.2em] text-white/70"
            : "text-[10px] font-bold uppercase tracking-[0.15em] text-navy"
        }
      >
        {kicker}
      </div>
      <div
        className={
          isPresenting
            ? "mt-1 text-[22px] font-bold text-white"
            : "mt-0.5 text-[16px] font-bold text-navy"
        }
      >
        {label}
      </div>
      <ul
        className={
          isPresenting
            ? "mt-5 space-y-4"
            : "mt-3 space-y-2"
        }
      >
        {categories.map((c) => (
          <li
            key={c.role + c.headline}
            className={
              isPresenting
                ? "border-t border-white/20 pt-3"
                : "border-t border-ink-border pt-2"
            }
          >
            <div
              className={
                isPresenting
                  ? "text-[10px] font-bold uppercase tracking-[0.15em] text-white/60"
                  : "text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted"
              }
            >
              {c.role}
            </div>
            <div
              className={
                isPresenting
                  ? "mt-1 text-[15px] leading-[1.4] text-white/90"
                  : "mt-0.5 text-[12px] leading-[1.45] text-ink"
              }
            >
              {c.headline}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CaseSlide({
  study,
  panel,
  isPresenting,
}: {
  study: CaseStudy;
  panel: Panel;
  isPresenting: boolean;
}) {
  return (
    <div>
      {/* Slide header: client + title + tagline */}
      <div className={isPresenting ? "flex items-center gap-5" : "flex items-center gap-4"}>
        {study.logo_url && (
          <div
            className={
              isPresenting
                ? "flex h-[84px] w-[180px] shrink-0 items-center justify-center border border-white/25 bg-white/5 px-3"
                : "flex h-[56px] w-[128px] shrink-0 items-center justify-center border border-ink-border bg-white px-3"
            }
          >
            <Image
              src={study.logo_url}
              alt={`${study.client_label} logo`}
              width={240}
              height={72}
              style={{ objectFit: "contain", width: "auto", height: "100%" }}
              unoptimized
            />
          </div>
        )}
        <div>
          <div
            className={
              isPresenting
                ? "text-[11px] font-bold uppercase tracking-[0.15em] text-white/70"
                : "text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
            }
          >
            Case study · {study.category}
            {!study.client_named && " · anonymized"}
          </div>
          <Headline isPresenting={isPresenting}>
            {study.title}
          </Headline>
          <p
            className={
              isPresenting
                ? "mt-3 max-w-[800px] text-[16px] italic leading-[1.5] text-white/80"
                : "mt-2 max-w-[720px] text-[13px] italic leading-[1.55] text-ink-muted"
            }
          >
            {study.tagline}
          </p>
        </div>
      </div>

      {/* Three revealing panels */}
      <div
        className={
          isPresenting
            ? "mt-10 grid grid-cols-1 gap-5 md:grid-cols-3"
            : "mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
        }
      >
        <Panel
          n={1}
          label="Business challenge"
          visible={panel >= 0}
          active={panel === 0}
          body={study.business_challenge}
          isPresenting={isPresenting}
        />
        <Panel
          n={2}
          label="Solution"
          visible={panel >= 1}
          active={panel === 1}
          body={study.solution}
          isPresenting={isPresenting}
        />
        <PanelImpact
          visible={panel >= 2}
          active={panel === 2}
          impact={study.impact}
          detail={study.impact_detail}
          isPresenting={isPresenting}
        />
      </div>
    </div>
  );
}

function Panel({
  n,
  label,
  visible,
  active,
  body,
  isPresenting,
}: {
  n: number;
  label: string;
  visible: boolean;
  active: boolean;
  body: string[];
  isPresenting: boolean;
}) {
  const base = isPresenting
    ? "rounded-none border px-5 py-5 transition-all duration-300"
    : "border px-4 py-4 transition-all duration-300";
  const tone = !visible
    ? isPresenting
      ? "border-white/10 bg-white/5 opacity-25"
      : "border-ink-border bg-bg-card opacity-40"
    : active
      ? isPresenting
        ? "border-white/70 bg-white/10"
        : "border-navy bg-ice"
      : isPresenting
        ? "border-white/30 bg-white/5"
        : "border-ink-border bg-white";
  return (
    <div className={`${base} ${tone}`}>
      <div
        className={
          isPresenting
            ? "text-[10px] font-bold uppercase tracking-[0.18em] text-white/80"
            : "text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
        }
      >
        0{n} · {label}
      </div>
      <ul
        className={
          isPresenting
            ? "mt-3 space-y-3 text-[15px] leading-[1.55] text-white/90"
            : "mt-2 space-y-2 text-[13px] leading-[1.55] text-ink"
        }
      >
        {body.map((b, i) => (
          <li
            key={i}
            className={
              isPresenting
                ? "border-l-2 border-white/30 pl-3"
                : "border-l-2 border-ink-border pl-3"
            }
          >
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PanelImpact({
  visible,
  active,
  impact,
  detail,
  isPresenting,
}: {
  visible: boolean;
  active: boolean;
  impact: Array<{ metric: string; label: string }>;
  detail?: string[];
  isPresenting: boolean;
}) {
  const base = isPresenting
    ? "rounded-none border px-5 py-5 transition-all duration-300"
    : "border px-4 py-4 transition-all duration-300";
  const tone = !visible
    ? isPresenting
      ? "border-white/10 bg-white/5 opacity-25"
      : "border-ink-border bg-bg-card opacity-40"
    : active
      ? isPresenting
        ? "border-white bg-white text-navy"
        : "border-navy bg-navy text-white"
      : isPresenting
        ? "border-white/30 bg-white/5"
        : "border-ink-border bg-white";
  const textTone = active
    ? isPresenting
      ? "text-navy"
      : "text-white"
    : isPresenting
      ? "text-white/90"
      : "text-ink";
  const labelTone = active
    ? isPresenting
      ? "text-navy/70"
      : "text-white/80"
    : isPresenting
      ? "text-white/70"
      : "text-navy";
  return (
    <div className={`${base} ${tone}`}>
      <div
        className={`text-[10px] font-bold uppercase tracking-[0.18em] ${labelTone}`}
      >
        03 · Impact
      </div>
      <div className={isPresenting ? "mt-4 space-y-4" : "mt-3 space-y-3"}>
        {impact.map((it, i) => (
          <div key={i}>
            <div
              className={
                isPresenting
                  ? `text-[28px] font-bold leading-[1.05] ${textTone}`
                  : `text-[22px] font-bold leading-[1.1] ${textTone}`
              }
            >
              {it.metric}
            </div>
            <div
              className={
                isPresenting
                  ? `mt-1 text-[13px] ${active ? "text-navy/70" : "text-white/70"}`
                  : `mt-0.5 text-[12px] ${active ? "text-white/90" : "text-ink-muted"}`
              }
            >
              {it.label}
            </div>
          </div>
        ))}
      </div>
      {detail && detail.length > 0 && (
        <ul
          className={
            isPresenting
              ? `mt-5 space-y-2 border-t pt-3 text-[13px] leading-[1.55] ${
                  active ? "border-navy/20 text-navy/80" : "border-white/20 text-white/80"
                }`
              : `mt-4 space-y-1.5 border-t pt-3 text-[12px] leading-[1.5] ${
                  active ? "border-white/30 text-white/90" : "border-ink-border text-ink-muted"
                }`
          }
        >
          {detail.map((d, i) => (
            <li key={i}>— {d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Kicker({
  children,
  isPresenting,
}: {
  children: React.ReactNode;
  isPresenting: boolean;
}) {
  return (
    <div
      className={
        isPresenting
          ? "text-[11px] font-bold uppercase tracking-[0.18em] text-white/70"
          : "text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
      }
    >
      {children}
    </div>
  );
}

function Headline({
  children,
  isPresenting,
}: {
  children: React.ReactNode;
  isPresenting: boolean;
}) {
  return (
    <h1
      className={
        isPresenting
          ? "mt-3 text-[46px] font-bold leading-[1.05] text-white"
          : "mt-2 text-[22px] font-bold leading-[1.2] text-navy"
      }
    >
      {children}
    </h1>
  );
}
