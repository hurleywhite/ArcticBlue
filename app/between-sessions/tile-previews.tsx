"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/*
  Interactive mini-previews for the Between Sessions showcase.
  Each tile is a compact, live demonstration of the tool it links to —
  not a generic card with a description. Keeps the page client-ready
  (things move, things are tangible) without cluttering it with real
  product chrome.

  Every tile is keyboard-focusable and links to the full tool on click.
*/

export function CanvasMiniTile() {
  const [lens, setLens] = useState(0);
  const quadrants = [
    ["Transformational Bets", "Strategic Quick Wins", "Defer", "Operational Gains"],
    ["High-Stakes Plays", "Efficient Winners", "Avoid", "Easy Wins"],
    ["Emerging but Ready", "Ship Now", "Not Yet Viable", "Tech Ahead of Org"],
  ];
  const dots = [
    { q: 0, x: 30, y: 42 }, { q: 0, x: 52, y: 68 },
    { q: 1, x: 25, y: 30 }, { q: 1, x: 60, y: 50 }, { q: 1, x: 40, y: 72 },
    { q: 2, x: 48, y: 54 },
    { q: 3, x: 30, y: 58 }, { q: 3, x: 65, y: 40 },
  ];
  const lensLabels = ["Speed × Impact", "Cost × Return", "Readiness"];
  const [active, setActive] = useState<number | null>(null);

  return (
    <Tile href="/canvas" kicker="Canvas" title="Role × industry opportunity map" stat="3 templates">
      <div className="flex gap-2 mb-3">
        {lensLabels.map((l, i) => (
          <button
            key={l}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLens(i); }}
            className={
              i === lens
                ? "border border-navy bg-navy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white"
                : "border border-ink-border bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
            }
          >
            {l}
          </button>
        ))}
      </div>
      <div className="relative border border-ink-border" style={{ aspectRatio: "2 / 1" }}>
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
          {[0, 1, 2, 3].map((q) => (
            <div
              key={q}
              className={
                q === 1
                  ? "relative bg-ice border-ink-border border-r border-b"
                  : "relative bg-white border-ink-border " +
                    (q === 0 ? "border-r border-b" : q === 2 ? "border-r" : "")
              }
            >
              <div className="absolute top-1.5 left-1.5 pointer-events-none text-[8px] font-bold uppercase tracking-[0.12em] text-navy">
                {quadrants[lens][q]}
              </div>
            </div>
          ))}
        </div>
        {dots.map((d, i) => (
          <button
            key={i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={(e) => e.preventDefault()}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy transition hover:scale-125"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: active === i ? 10 : 6,
              height: active === i ? 10 : 6,
            }}
          />
        ))}
      </div>
    </Tile>
  );
}

export function MirrorMiniTile() {
  // 4 satellite dots around a core, subtly rotating
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setAngle((a) => (a + 1.5) % 360), 80);
    return () => clearInterval(id);
  }, []);
  const sats = [
    { angle: 20, dist: 42, color: "#1F3A5F", size: 10 },
    { angle: 110, dist: 52, color: "#1F3A5F", size: 7 },
    { angle: 195, dist: 38, color: "#1F3A5F", size: 9 },
    { angle: 295, dist: 48, color: "#1F3A5F", size: 6 },
  ];
  return (
    <Tile href="/mirror" kicker="Mirror" title="A company's opportunity field" stat="Demo mode">
      <div className="relative mx-auto" style={{ width: 240, height: 120 }}>
        {/* orbit rings */}
        <svg className="absolute inset-0 h-full w-full" viewBox="-60 -60 240 240" style={{ overflow: "visible" }}>
          {[40, 55, 70].map((r) => (
            <ellipse key={r} cx="60" cy="60" rx={r} ry={r * 0.55} fill="none" stroke="#1F3A5F" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2 3" />
          ))}
        </svg>
        {/* core */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy"
          style={{ width: 22, height: 22 }}
        />
        {/* satellites */}
        {sats.map((s, i) => {
          const a = ((s.angle + angle) * Math.PI) / 180;
          const x = 120 + Math.cos(a) * s.dist;
          const y = 60 + Math.sin(a) * s.dist * 0.55;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: x,
                top: y,
                width: s.size,
                height: s.size,
                background: s.color,
                opacity: 0.85,
              }}
            />
          );
        })}
      </div>
      <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        Size = impact · Distance = time to value
      </div>
    </Tile>
  );
}

const DEMO_COMPANIES = [
  {
    name: "Stripe",
    domain: "stripe.com",
    industry: "Financial infrastructure",
    size: "8,500",
    stack: ["Ruby", "Go", "React", "Snowflake", "Kafka"],
    adoption: "Agentic commerce push. Strong docs corpus for retrieval-based support.",
  },
  {
    name: "Autodesk",
    domain: "autodesk.com",
    industry: "Design software",
    size: "14,000",
    stack: ["C++", "Python", "AWS", "Databricks", "React"],
    adoption: "Generative design across AEC + Manufacturing. Core product surface.",
  },
  {
    name: "MetLife",
    domain: "metlife.com",
    industry: "Insurance",
    size: "45,000",
    stack: ["Java", "SAP", "Azure", "Guidewire", "Snowflake"],
    adoption: "Underwriting modernization + synthetic customer research.",
  },
];

export function AnalyzerMiniTile() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % DEMO_COMPANIES.length), 4500);
    return () => clearInterval(id);
  }, []);
  const c = DEMO_COMPANIES[idx];
  return (
    <Tile href="/analyzer" kicker="Analyzer" title="Inspect any company's AI posture" stat="Apollo + Exa + Claude">
      <div className="border border-ink-border bg-white px-4 py-3" style={{ minHeight: 120 }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {c.domain}
            </div>
            <div className="mt-0.5 text-[14px] font-bold text-navy">{c.name}</div>
            <div className="text-[11px] text-ink-muted">
              {c.industry} · {c.size} employees
            </div>
          </div>
          <span className="border border-navy bg-ice px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-navy">
            Sample
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {c.stack.map((t) => (
            <span
              key={t}
              className="border border-ink-border bg-bg-card px-1.5 py-0.5 text-[10px] text-navy"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-[1.45] text-ink">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-navy">
            AI adoption ·{" "}
          </span>
          {c.adoption}
        </p>
      </div>
      <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        Live sample · real analyzer runs against the domain you enter
      </div>
    </Tile>
  );
}

export function PracticeMiniTile() {
  const [stage, setStage] = useState(0); // 0=blank, 1=asking, 2=streaming, 3=done
  const lines = [
    "",
    "Help me scope a pilot to synthesize customer interviews with AI.",
    "The ArcticBlue method says: name the decision first. Who on your team will make the call at the readout?",
    "The ArcticBlue method says: name the decision first. Who on your team will make the call at the readout? What evidence would change their mind?",
  ];
  const user = "You";
  const assistant = "Claude Sonnet 4.6";

  useEffect(() => {
    const steps = [1400, 1800, 1600, 2500];
    const id = setTimeout(() => setStage((s) => (s + 1) % 4), steps[stage]);
    return () => clearTimeout(id);
  }, [stage]);

  return (
    <Tile href="/tools/practice" kicker="Practice" title="Try a workflow before the Lab" stat="Claude Sonnet 4.6">
      <div className="border border-ink-border bg-white px-4 py-3" style={{ minHeight: 140 }}>
        {stage >= 1 && (
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {user}
            </div>
            <div className="mt-0.5 text-[12px]">{lines[1]}</div>
          </div>
        )}
        {stage >= 2 && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                {assistant}
              </span>
              {stage === 2 && (
                <span className="flex items-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-1 w-1 rounded-full bg-navy"
                      style={{
                        animation: `tile-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[12px] leading-[1.5]">{lines[stage]}</div>
          </div>
        )}
      </div>
      <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        Seeded sandbox · text only · exports to artifact
      </div>
      <style jsx>{`
        @keyframes tile-dot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </Tile>
  );
}

/*
  Shared tile chrome — navy kicker bar, title, stat, click-through to
  the full tool. Wraps the live preview children the caller provides.
*/
function Tile({
  href,
  kicker,
  title,
  stat,
  children,
}: {
  href: string;
  kicker: string;
  title: string;
  stat: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block border border-ink-border bg-white transition hover:border-navy"
    >
      <div className="flex items-center justify-between bg-navy px-4 py-2 text-white">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
            {kicker}
          </div>
          <div className="mt-0.5 text-[13px] font-bold">{title}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
            {stat}
          </div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] opacity-80 group-hover:underline">
            Open →
          </div>
        </div>
      </div>
      <div className="bg-bg-card p-4">{children}</div>
    </Link>
  );
}
