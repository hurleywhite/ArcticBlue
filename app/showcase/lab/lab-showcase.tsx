"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/*
  Lab explainer — the AI Practical Labs pitch, paced in six beats:
  01 Problem, 02 The Lab, 03 How it works (four rows), 04 Walkaway,
  05 What's included, 06 Close.

  Keyboard: right / space advances, left goes back, numbers jump.
*/

const BEATS = [
  { id: "problem", label: "Problem" },
  { id: "thelab", label: "The Lab" },
  { id: "how", label: "How it works" },
  { id: "walkaway", label: "Walkaway" },
  { id: "included", label: "What's included" },
  { id: "close", label: "Close" },
] as const;

type BeatId = (typeof BEATS)[number]["id"];

export function LabShowcase() {
  const searchParams = useSearchParams();
  const isPresenting = searchParams?.get("present") === "1";
  const [beat, setBeat] = useState<BeatId>("problem");

  useEffect(() => {
    if (!isPresenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setBeat((b) => {
          const idx = BEATS.findIndex((x) => x.id === b);
          return BEATS[Math.min(BEATS.length - 1, idx + 1)].id;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setBeat((b) => {
          const idx = BEATS.findIndex((x) => x.id === b);
          return BEATS[Math.max(0, idx - 1)].id;
        });
      } else if (/^[1-6]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        setBeat(BEATS[idx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresenting]);

  const container = isPresenting
    ? "min-h-screen w-full bg-navy text-white"
    : "mx-auto max-w-[1200px] px-6 py-8";

  return (
    <div className={container}>
      {!isPresenting && (
        <div className="mb-6 bg-navy px-6 py-4 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
            Showcase · The Lab
          </div>
          <div className="mt-0.5 text-[20px] font-bold leading-[1.15]">
            What clients actually buy.
          </div>
        </div>
      )}

      <div
        className={
          isPresenting
            ? "flex min-h-screen items-center justify-center px-[8vw] py-[8vh]"
            : "border border-ink-border bg-bg-card px-6 py-8 md:px-10"
        }
      >
        <div className="max-w-[1000px] w-full">
          {beat === "problem" && <ProblemBeat isPresenting={!!isPresenting} />}
          {beat === "thelab" && <TheLabBeat isPresenting={!!isPresenting} />}
          {beat === "how" && <HowBeat isPresenting={!!isPresenting} />}
          {beat === "walkaway" && <WalkawayBeat isPresenting={!!isPresenting} />}
          {beat === "included" && <IncludedBeat isPresenting={!!isPresenting} />}
          {beat === "close" && <CloseBeat isPresenting={!!isPresenting} />}
        </div>
      </div>

      <div
        className={
          isPresenting
            ? "fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
            : "mt-6"
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {BEATS.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setBeat(b.id)}
              className={
                b.id === beat
                  ? isPresenting
                    ? "border border-white/70 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
                    : "border border-navy bg-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                  : isPresenting
                    ? "border border-white/30 bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 hover:border-white hover:text-white"
                    : "border border-ink-border bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
              }
            >
              0{i + 1} · {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kicker({ label, isPresenting }: { label: string; isPresenting: boolean }) {
  return (
    <div
      className={
        isPresenting
          ? "text-[11px] font-bold uppercase tracking-[0.15em] text-white/70"
          : "text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
      }
    >
      {label}
    </div>
  );
}

function Headline({ children, isPresenting }: { children: React.ReactNode; isPresenting: boolean }) {
  return (
    <h1
      className={
        isPresenting
          ? "mt-3 text-[54px] font-bold leading-[1.05] text-white"
          : "mt-2 text-[28px] font-bold leading-[1.15] text-navy"
      }
    >
      {children}
    </h1>
  );
}

function Body({ children, isPresenting }: { children: React.ReactNode; isPresenting: boolean }) {
  return (
    <p
      className={
        isPresenting
          ? "mt-6 text-[22px] leading-[1.55] text-white/90"
          : "mt-3 text-[14px] leading-[1.65] text-ink"
      }
    >
      {children}
    </p>
  );
}

function ProblemBeat({ isPresenting }: { isPresenting: boolean }) {
  return (
    <div>
      <Kicker label="01 · Problem" isPresenting={isPresenting} />
      <Headline isPresenting={isPresenting}>
        Your team has AI tools, but they're barely using them.
      </Headline>
      <Body isPresenting={isPresenting}>
        You've made the investment. But the tools change weekly, the techniques shift daily,
        and most of your team is still figuring out where to start — let alone do anything
        useful with what they have. Giving people access to AI doesn't make them good at it.
      </Body>
      <Body isPresenting={isPresenting}>
        That takes practice — the kind you can't get from a one-time workshop or a self-paced course.
      </Body>
    </div>
  );
}

function TheLabBeat({ isPresenting }: { isPresenting: boolean }) {
  return (
    <div>
      <Kicker label="02 · The Lab" isPresenting={isPresenting} />
      <Headline isPresenting={isPresenting}>
        Monthly, hands-on working sessions where your team actually gets good at using AI.
      </Headline>
      <Body isPresenting={isPresenting}>
        Up to 20 teammates. 90 minutes. Real business problem. Current tools. Expert facilitators.
        Not a workshop. Not a course. A session where everyone's doing the work — live, together.
      </Body>
    </div>
  );
}

function HowBeat({ isPresenting }: { isPresenting: boolean }) {
  const rows = [
    {
      n: "01",
      title: "Monthly live session built around your team",
      body:
        "A group of up to 20 works through a real business problem using current AI tools. Not slides and lectures. Everyone's doing the work, live, together.",
    },
    {
      n: "02",
      title: "New challenge every month to always stay current",
      body:
        "Each session covers different tools and techniques based on what's useful right now. Strategy, ops, comms, analysis — your team builds range instead of going deep on one thing that'll be obsolete next quarter.",
    },
    {
      n: "03",
      title: "Run by people who do this for a living",
      body:
        "ArcticBlue facilitators run enterprise AI enablement programs every day. Not vendor demos or product walkthroughs — actual working sessions led by expert practitioners.",
    },
    {
      n: "04",
      title: "Snowball effect",
      body:
        "Each month builds on the last. Over time, your team develops a shared vocabulary, a habit of experimenting, and the confidence to figure things out on their own.",
    },
  ];
  return (
    <div>
      <Kicker label="03 · How it works" isPresenting={isPresenting} />
      <Headline isPresenting={isPresenting}>Four ideas. One format.</Headline>
      <div className={isPresenting ? "mt-8 space-y-4" : "mt-4 space-y-3"}>
        {rows.map((r) => (
          <div
            key={r.n}
            className={
              isPresenting
                ? "grid grid-cols-[72px_1fr] items-start gap-6 border-t border-white/20 pt-4"
                : "grid grid-cols-[56px_1fr] items-start gap-4 border-t border-ink-border pt-3"
            }
          >
            <div
              className={
                isPresenting
                  ? "text-[24px] font-bold text-white/70"
                  : "text-[18px] font-bold text-navy"
              }
            >
              {r.n}
            </div>
            <div>
              <div
                className={
                  isPresenting
                    ? "text-[20px] font-bold leading-[1.25] text-white"
                    : "text-[14px] font-bold leading-[1.3] text-navy"
                }
              >
                {r.title}
              </div>
              <p
                className={
                  isPresenting
                    ? "mt-1 text-[15px] leading-[1.55] text-white/80"
                    : "mt-1 text-[12px] leading-[1.55] text-ink"
                }
              >
                {r.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalkawayBeat({ isPresenting }: { isPresenting: boolean }) {
  const items = [
    {
      h: "Real fluency",
      b: "People who can actually use AI on real work, not just talk about it.",
    },
    {
      h: "Always current",
      b: "Hands-on time with whatever tools and techniques matter this month, not six months ago.",
    },
    {
      h: "Momentum",
      b: "A monthly rhythm that keeps AI from falling off the radar.",
    },
  ];
  return (
    <div>
      <Kicker label="04 · Walkaway" isPresenting={isPresenting} />
      <Headline isPresenting={isPresenting}>What your team walks away with.</Headline>
      <div className={isPresenting ? "mt-10 grid grid-cols-3 gap-6" : "mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"}>
        {items.map((it) => (
          <div
            key={it.h}
            className={
              isPresenting
                ? "border border-white/30 bg-white/5 px-5 py-5"
                : "border border-ink-border bg-white px-4 py-4"
            }
          >
            <div
              className={
                isPresenting
                  ? "text-[20px] font-bold leading-[1.2] text-white"
                  : "text-[15px] font-bold leading-[1.25] text-navy"
              }
            >
              {it.h}
            </div>
            <p
              className={
                isPresenting
                  ? "mt-3 text-[14px] leading-[1.55] text-white/80"
                  : "mt-2 text-[12px] leading-[1.55] text-ink"
              }
            >
              {it.b}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncludedBeat({ isPresenting }: { isPresenting: boolean }) {
  const items = [
    "One 90-minute live session per month",
    "Challenge built around your team's actual work",
    "Materials and follow-up resources",
    "ArcticMind facilitation team included",
    "Up to 20 participants — cancel anytime",
  ];
  return (
    <div>
      <Kicker label="05 · What's included" isPresenting={isPresenting} />
      <Headline isPresenting={isPresenting}>Per engagement.</Headline>
      <ul className={isPresenting ? "mt-10 space-y-3" : "mt-4 space-y-2"}>
        {items.map((it) => (
          <li
            key={it}
            className={
              isPresenting
                ? "flex items-start gap-4 border-t border-white/20 pt-3 text-[18px] text-white"
                : "flex items-start gap-3 border-t border-ink-border pt-2 text-[13px] text-ink"
            }
          >
            <span
              className={
                isPresenting ? "mt-1 text-[18px] text-white/70" : "mt-0.5 text-navy"
              }
            >
              ✓
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CloseBeat({ isPresenting }: { isPresenting: boolean }) {
  return (
    <div>
      <Kicker label="06 · Close" isPresenting={isPresenting} />
      <Headline isPresenting={isPresenting}>
        Get your team doing AI. Not just talking about it.
      </Headline>
      <Body isPresenting={isPresenting}>
        We'll scope a first session around a problem you're working on right now. 90 minutes,
        up to 20 teammates, real work in the room.
      </Body>
      <div className={isPresenting ? "mt-12 border-t border-white/20 pt-6 text-[16px] text-white/80" : "mt-6 border-t border-ink-border pt-4 text-[13px] text-ink-muted"}>
        arcticblue.ai · scott@arcticblue.ai
      </div>
    </div>
  );
}
