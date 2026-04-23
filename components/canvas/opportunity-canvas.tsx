"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AXIS_CONFIGS,
  INDUSTRIES,
  ROLES,
  routeDemo,
  type Opportunity,
} from "@/lib/canvas/demo-data";
import { sessionKey, useStarState } from "@/lib/state/stars";
import { CardModal } from "./card-modal";
import { RoadmapModal } from "./roadmap-modal";

/*
  Opportunity Canvas — editorial re-skin of the prototype.
  Three screens share one page: input → loading → canvas. Modals overlay
  the canvas for expanded card view and the prioritized roadmap.

  Visual treatment follows docs/design-system.md — navy header bars, ice
  blue accents on starred cards, Arial throughout, table-based quadrant
  grid, no cream or Instrument Serif.
*/

type Screen = "input" | "loading" | "canvas";

export function OpportunityCanvas() {
  const [screen, setScreen] = useState<Screen>("input");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [axisIdx, setAxisIdx] = useState(0);
  const [expanded, setExpanded] = useState<Opportunity | null>(null);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Mapping the opportunity landscape");
  const [starState, setStarState] = useStarState();

  const axis = AXIS_CONFIGS[axisIdx];

  // Re-hydrate stars when role/industry changes and we're on the canvas
  useEffect(() => {
    if (screen !== "canvas") return;
    const key = sessionKey(role, industry);
    const existing = starState.stars[key] ?? [];
    setStarred(new Set(existing));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, role, industry]);

  // Persist stars + last-open whenever the star set changes on the canvas
  useEffect(() => {
    if (screen !== "canvas") return;
    const key = sessionKey(role, industry);
    setStarState((prev) => ({
      stars: { ...prev.stars, [key]: Array.from(starred) },
      lastRole: role,
      lastIndustry: industry,
      lastOpenedAt: new Date().toISOString(),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starred, screen]);

  const handleGenerate = () => {
    setScreen("loading");
    setStarred(new Set());
    const msgs = [
      "Mapping the opportunity landscape",
      "Scoring against strategic lenses",
      "Triangulating industry benchmarks",
      "Assembling your canvas",
    ];
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % msgs.length;
      setLoadingMsg(msgs[i]);
    }, 900);
    setTimeout(() => {
      clearInterval(timer);
      setOpportunities(routeDemo(role, industry));
      setScreen("canvas");
    }, 2200);
  };

  const getQuadrant = (op: Opportunity): "TR" | "TL" | "BR" | "BL" => {
    const x = op[axis.x.key] as number;
    const y = op[axis.y.key] as number;
    if (x > 5 && y > 5) return "TR";
    if (x <= 5 && y > 5) return "TL";
    if (x > 5 && y <= 5) return "BR";
    return "BL";
  };

  const byQuadrant = useMemo(() => {
    const groups: Record<"TR" | "TL" | "BR" | "BL", Opportunity[]> = {
      TR: [],
      TL: [],
      BR: [],
      BL: [],
    };
    opportunities.forEach((op) => groups[getQuadrant(op)].push(op));
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunities, axisIdx]);

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const starredOps = opportunities
    .filter((op) => starred.has(op.id))
    .sort(
      (a, b) =>
        b.strategic_impact + b.expected_roi - (a.strategic_impact + a.expected_roi)
    );

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      {/* Canvas header band */}
      <div className="bg-navy px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
              Opportunity Canvas
            </div>
            <div className="mt-0.5 text-[15px] font-bold">
              Where AI actually moves the needle — by role, by industry.
            </div>
          </div>
          {screen === "canvas" && (
            <button
              onClick={() => setScreen("input")}
              className="text-[11px] font-bold uppercase tracking-[0.12em] hover:underline"
            >
              New canvas
            </button>
          )}
        </div>
      </div>

      {screen === "input" && (
        <section className="rise">
          <div className="callout mt-0">
            <p>
              Pick a role and an industry. ArcticMind plots eight specific
              opportunities on a canvas you can re-frame across three strategic
              lenses, star what matters, and shape into a prioritized roadmap.
            </p>
          </div>

          <h2 className="section-header mt-10 mb-3">Configure the canvas</h2>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Field</th>
                <th>Selection</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>01 · Role</strong>
                  <div className="text-ink-muted">
                    The function we're canvassing for.
                  </div>
                </td>
                <td>
                  <select
                    className="select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>02 · Industry</strong>
                  <div className="text-ink-muted">
                    Industry context shapes every opportunity below.
                  </div>
                </td>
                <td>
                  <select
                    className="select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 flex items-center justify-between border-t border-ink-border pt-6">
            <div className="text-[12px] text-ink-muted">
              Canvas renders eight opportunities across three lenses.
            </div>
            <button className="btn-primary" onClick={handleGenerate}>
              Map the opportunity →
            </button>
          </div>

          <h2 className="section-header mt-12 mb-3">How to read this canvas</h2>
          <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-3">
            <ReadCell
              n="One."
              body="Eight specific opportunities — not generic categories."
            />
            <ReadCell
              n="Two."
              body="Three lenses re-frame what 'priority' means."
            />
            <ReadCell
              n="Three."
              body="Star what matters. We'll shape it into a roadmap."
              last
            />
          </div>
        </section>
      )}

      {screen === "loading" && (
        <section className="mt-8 rise">
          <div className="section-header mb-3">
            {role} · {industry}
          </div>
          <h2 className="text-[20px] font-bold leading-[1.2] text-navy">
            {loadingMsg}…
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-0 border border-ink-border">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 border-b border-r border-ink-border bg-bg-card last:border-r-0 md:border-b-0"
                style={{
                  animation: `riseIn 500ms ${i * 120}ms both`,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {screen === "canvas" && (
        <section className="mt-6 rise">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="section-header">
                {role} · {industry}
              </div>
              <h2 className="mt-1 text-[18px] font-bold leading-[1.2] text-navy">
                Eight opportunities — viewed through{" "}
                <span className="italic">{axis.shortLabel.toLowerCase()}</span>.
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                Lens
              </span>
              {AXIS_CONFIGS.map((a, idx) => (
                <button
                  key={a.label}
                  onClick={() => setAxisIdx(idx)}
                  className={
                    axisIdx === idx
                      ? "border border-navy bg-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                      : "border border-ink-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
                  }
                >
                  {a.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* 2x2 quadrant grid — table-based, hairline borders */}
          <div className="relative mt-5">
            <div className="pointer-events-none absolute -left-4 top-0 bottom-0 flex flex-col justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-ink-muted">
              <span
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {axis.y.high} →
              </span>
              <span
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                ← {axis.y.low}
              </span>
            </div>
            <div className="ml-4 grid grid-cols-2 grid-rows-2 border border-ink-border">
              <Quadrant
                label={axis.quadrants.TL}
                subLabel={`${axis.y.high} · ${axis.x.low}`}
                cards={byQuadrant.TL}
                onCardClick={setExpanded}
                starred={starred}
                onStar={toggleStar}
                borderRight
                borderBottom
              />
              <Quadrant
                label={axis.quadrants.TR}
                subLabel={`${axis.y.high} · ${axis.x.high}`}
                cards={byQuadrant.TR}
                onCardClick={setExpanded}
                starred={starred}
                onStar={toggleStar}
                highlight
                borderBottom
              />
              <Quadrant
                label={axis.quadrants.BL}
                subLabel={`${axis.y.low} · ${axis.x.low}`}
                cards={byQuadrant.BL}
                onCardClick={setExpanded}
                starred={starred}
                onStar={toggleStar}
                borderRight
              />
              <Quadrant
                label={axis.quadrants.BR}
                subLabel={`${axis.y.low} · ${axis.x.high}`}
                cards={byQuadrant.BR}
                onCardClick={setExpanded}
                starred={starred}
                onStar={toggleStar}
              />
            </div>
            <div className="ml-4 mt-2 flex justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-ink-muted">
              <span>← {axis.x.low}</span>
              <span>{axis.x.high} →</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-border pt-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
              {starred.size} starred
            </div>
            <div className="flex items-center gap-2">
              {starred.size >= 3 && (
                <Link
                  href="/canvas/next"
                  className="btn-secondary"
                >
                  See what's next →
                </Link>
              )}
              <button
                className="btn-primary disabled:cursor-not-allowed"
                onClick={() => setShowRoadmap(true)}
                disabled={starred.size === 0}
              >
                Build roadmap →
              </button>
            </div>
          </div>
        </section>
      )}

      {expanded && (
        <CardModal
          op={expanded}
          isStarred={starred.has(expanded.id)}
          onStar={() => toggleStar(expanded.id)}
          onClose={() => setExpanded(null)}
        />
      )}
      {showRoadmap && (
        <RoadmapModal
          role={role}
          industry={industry}
          starredOps={starredOps}
          onClose={() => setShowRoadmap(false)}
        />
      )}
    </div>
  );
}

function ReadCell({ n, body, last }: { n: string; body: string; last?: boolean }) {
  return (
    <div
      className={`px-5 py-4 ${
        last ? "" : "md:border-r md:border-ink-border"
      } bg-bg-card`}
    >
      <div className="text-[14px] font-bold text-navy">{n}</div>
      <p className="mt-1 text-[13px] leading-[1.55]">{body}</p>
    </div>
  );
}

function Quadrant({
  label,
  subLabel,
  cards,
  onCardClick,
  starred,
  onStar,
  highlight,
  borderRight,
  borderBottom,
}: {
  label: string;
  subLabel: string;
  cards: Opportunity[];
  onCardClick: (op: Opportunity) => void;
  starred: Set<string>;
  onStar: (id: string) => void;
  highlight?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
}) {
  return (
    <div
      className={`min-h-[260px] p-4 ${
        highlight ? "bg-ice" : "bg-white"
      } ${borderRight ? "border-r border-ink-border" : ""} ${
        borderBottom ? "border-b border-ink-border" : ""
      }`}
    >
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-muted">
        {subLabel}
      </div>
      <div
        className={`mt-0.5 text-[14px] font-bold ${
          highlight ? "text-navy" : "text-navy"
        }`}
      >
        {label}
      </div>
      <ul className="mt-3 space-y-1.5">
        {cards.map((op) => (
          <li key={op.id}>
            <button
              onClick={() => onCardClick(op)}
              className="group flex w-full items-start gap-2 border border-ink-border bg-white px-2.5 py-1.5 text-left transition hover:border-navy"
            >
              <span
                role="button"
                aria-label={starred.has(op.id) ? "Unstar" : "Star"}
                onClick={(e) => {
                  e.stopPropagation();
                  onStar(op.id);
                }}
                className="mt-0.5 shrink-0 cursor-pointer"
              >
                <Star filled={starred.has(op.id)} />
              </span>
              <span className="text-[12px] leading-[1.3] text-ink">
                {op.title}
              </span>
            </button>
          </li>
        ))}
        {cards.length === 0 && (
          <li className="text-[11px] italic text-ink-muted">None in this quadrant.</li>
        )}
      </ul>
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill={filled ? "#1F3A5F" : "none"}
      stroke="#1F3A5F"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
