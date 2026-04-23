"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { COMPANIES, OPPORTUNITY_TEMPLATES, resolveCompany, type MirrorCompany, type MirrorOpportunity } from "./data";

/*
  AI Mirror — port of the prototype at app/mirror/prototype (originally
  a single-file React sketch). Preserves the three-screen flow:
    input → scanning → mirror (orbital opportunity field)
  Plus two modals:
    - Satellite detail: scores + experiment + risk + launch-trajectory
    - Branded brief: prioritized roadmap from starred opportunities

  Demo company profiles (Stripe, Autodesk, MetLife, Betterment, Zurich)
  route to curated archetypes. Unknown domains pick a plausible archetype
  so a prospect demo never dead-ends.
*/

type Screen = "input" | "scanning" | "mirror";

export function MirrorApp() {
  const [screen, setScreen] = useState<Screen>("input");
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState<MirrorCompany | null>(null);
  const [opportunities, setOpportunities] = useState<MirrorOpportunity[]>([]);
  const [scanPhase, setScanPhase] = useState(0);
  const [selectedOpp, setSelectedOpp] = useState<MirrorOpportunity | null>(null);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [launchMode, setLaunchMode] = useState<MirrorOpportunity | null>(null);
  const [showBrief, setShowBrief] = useState(false);

  // Starfield — generated once per mount so positions don't jitter
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 4,
      })),
    []
  );

  // Scan sequence — 4 phases, ~900ms apart, then hand off to mirror
  useEffect(() => {
    if (screen !== "scanning") return;
    const phases = [0, 1, 2, 3];
    const timers = phases.map((p, i) => setTimeout(() => setScanPhase(p), i * 900));
    const finale = setTimeout(() => setScreen("mirror"), 3800);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finale);
    };
  }, [screen]);

  const handleScan = async () => {
    const fallback = resolveCompany(domain);
    // Optimistic archetype render while the real scan runs so the
    // animation has something to land on if the API is slow or the
    // Anthropic key isn't set on the server.
    setCompany(fallback);
    setOpportunities(OPPORTUNITY_TEMPLATES[fallback.archetype]);
    setStarred(new Set());
    setScanPhase(0);
    setScreen("scanning");

    try {
      const res = await fetch("/api/mirror/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) return; // Keep the fallback archetype on 501/500.
      const data = (await res.json()) as {
        company: MirrorCompany;
        opportunities: MirrorOpportunity[];
      };
      if (data?.company && Array.isArray(data.opportunities)) {
        setCompany(data.company);
        setOpportunities(data.opportunities);
      }
    } catch (err) {
      console.warn("[mirror] scan API failed, keeping archetype:", err);
    }
  };

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const starredOpps = opportunities
    .filter((o) => starred.has(o.id))
    .sort((a, b) => b.impact + b.readiness - (a.impact + a.readiness));

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Starfield */}
      <div className="stars">
        {stars.map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between border-b border-[#F6F3EC]/10 px-8 py-5">
        <Link href="/" className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" fill="#8BB2ED" />
            <circle cx="12" cy="12" r="9" stroke="#F6F3EC" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx="12" cy="12" r="11" stroke="#F6F3EC" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2 2" />
          </svg>
          <div>
            <div className="serif text-xl leading-none">ArcticMind</div>
            <div className="mono mt-1 text-[10px] uppercase tracking-[0.18em] opacity-50">AI Mirror</div>
          </div>
        </Link>
        {screen === "mirror" && company && (
          <div className="flex items-center gap-4">
            <div className="mono text-[10px] uppercase tracking-[0.18em] opacity-50">
              {company.name} · {company.industry}
            </div>
            <button
              onClick={() => {
                setScreen("input");
                setDomain("");
              }}
              className="mono text-[10px] uppercase tracking-[0.15em] opacity-60 transition hover:opacity-100"
            >
              New scan
            </button>
          </div>
        )}
      </header>

      {screen === "input" && (
        <InputScreen domain={domain} setDomain={setDomain} onScan={handleScan} />
      )}

      {screen === "scanning" && company && (
        <ScanningScreen company={company} scanPhase={scanPhase} />
      )}

      {screen === "mirror" && company && (
        <MirrorStage
          company={company}
          opportunities={opportunities}
          starred={starred}
          selectedOpp={selectedOpp}
          setSelectedOpp={setSelectedOpp}
          onShowBrief={() => setShowBrief(true)}
        />
      )}

      {selectedOpp && (
        <SatelliteModal
          opp={selectedOpp}
          launchMode={launchMode}
          starred={starred}
          onToggleStar={toggleStar}
          onLaunch={() => setLaunchMode(selectedOpp)}
          onBack={() => setLaunchMode(null)}
          onClose={() => {
            setSelectedOpp(null);
            setLaunchMode(null);
          }}
        />
      )}

      {showBrief && company && (
        <BriefModal
          company={company}
          starredOpps={starredOpps}
          onClose={() => setShowBrief(false)}
        />
      )}
    </div>
  );
}

function InputScreen({
  domain,
  setDomain,
  onScan,
}: {
  domain: string;
  setDomain: (v: string) => void;
  onScan: () => void;
}) {
  return (
    <main className="relative z-10 mx-auto max-w-5xl px-8 pb-20 pt-24">
      <div className="rise" style={{ animationDelay: "0.1s" }}>
        <div className="mono mb-6 text-[11px] uppercase tracking-[0.2em] opacity-50">
          An instrument for seeing AI opportunity
        </div>
      </div>
      <h1 className="serif rise mb-12 text-7xl leading-[0.95]" style={{ animationDelay: "0.2s" }}>
        Every company has an<br />
        <span className="italic opacity-90">opportunity field</span>.<br />
        We show you theirs.
      </h1>

      <div className="rise max-w-2xl" style={{ animationDelay: "0.4s" }}>
        <div className="mono mb-4 text-[11px] uppercase tracking-[0.2em] opacity-50">
          Enter a company domain
        </div>
        <div className="flex items-end gap-6 border-b border-[#F6F3EC]/30 pb-3 transition focus-within:border-[#F6F3EC]">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && domain.trim() && onScan()}
            placeholder="stripe.com"
            autoFocus
            className="serif flex-1 bg-transparent pb-2 text-5xl focus:outline-none"
          />
          <button
            onClick={onScan}
            disabled={!domain.trim()}
            className={`group inline-flex items-center gap-3 rounded-sm px-6 py-3 transition ${
              domain.trim() ? "btn-primary" : "cursor-not-allowed bg-[#F6F3EC]/10 opacity-30"
            }`}
          >
            <span className="mono text-[11px] uppercase tracking-[0.2em]">Scan</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="transition group-hover:translate-x-1">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="mono mr-1 pt-1 text-[10px] uppercase tracking-[0.18em] opacity-40">Try:</span>
          {Object.keys(COMPANIES).map((d) => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className="mono rounded-sm border border-[#F6F3EC]/15 px-3 py-1.5 text-[11px] transition hover:border-[#F6F3EC]/50 hover:bg-[#F6F3EC]/5"
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="rise mt-28 grid grid-cols-3 gap-12 border-t border-[#F6F3EC]/10 pt-10" style={{ animationDelay: "0.6s" }}>
        <InfoBlock n="01" verb="See" title="The field" body="Eight AI opportunities, sized by impact, positioned by readiness — specific to this company." />
        <InfoBlock n="02" verb="Select" title="What matters" body="Star the opportunities worth pursuing. Each reveals an experiment, a risk, and a 90-day trajectory." />
        <InfoBlock n="03" verb="Launch" title="The plan" body="Export a branded brief. Walk out of the meeting with a sequenced plan you helped shape." />
      </div>
    </main>
  );
}

function InfoBlock({ n, verb, title, body }: { n: string; verb: string; title: string; body: string }) {
  return (
    <div>
      <div className="mono mb-3 text-[10px] uppercase tracking-[0.2em] opacity-40">
        {n} · {verb}
      </div>
      <h3 className="serif mb-2 text-2xl">{title}</h3>
      <p className="text-sm leading-relaxed opacity-65">{body}</p>
    </div>
  );
}

function ScanningScreen({ company, scanPhase }: { company: MirrorCompany; scanPhase: number }) {
  const steps = [
    { label: "Resolving firmographics", detail: `${company.industry} · ${company.size}` },
    { label: "Detecting technology stack", detail: company.stack.slice(0, 4).join(" · ") },
    { label: "Reading recent signals", detail: company.signal },
    { label: "Mapping opportunity field", detail: "Eight specific opportunities plotted" },
  ];

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-8 pb-20 pt-24">
      <div className="fade-in">
        <div className="mono mb-4 text-[11px] uppercase tracking-[0.2em] opacity-50">Scanning</div>
        <h2 className="serif mb-12 text-6xl leading-tight">{company.name}</h2>

        <div className="max-w-2xl space-y-4">
          {steps.map((step, i) => {
            const done = scanPhase >= i;
            return (
              <div
                key={i}
                className={`flex items-start gap-5 border-b border-[#F6F3EC]/10 py-4 transition-all duration-500 ${
                  done ? "opacity-100" : "opacity-30"
                }`}
              >
                <div className="mono mt-1 w-8 text-[10px] opacity-50">0{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{step.label}</span>
                    {done && scanPhase === i && (
                      <span className="flex h-3 items-end gap-0.5">
                        <span className="dot-1 h-1 w-1 rounded-full bg-[#8BB2ED]" />
                        <span className="dot-2 h-1 w-1 rounded-full bg-[#8BB2ED]" />
                        <span className="dot-3 h-1 w-1 rounded-full bg-[#8BB2ED]" />
                      </span>
                    )}
                    {done && scanPhase > i && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8BB2ED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {done && <div className="mono fade-in mt-1 text-xs tracking-wide opacity-50">{step.detail}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function MirrorStage({
  company,
  opportunities,
  starred,
  selectedOpp,
  setSelectedOpp,
  onShowBrief,
}: {
  company: MirrorCompany;
  opportunities: MirrorOpportunity[];
  starred: Set<string>;
  selectedOpp: MirrorOpportunity | null;
  setSelectedOpp: (o: MirrorOpportunity) => void;
  onShowBrief: () => void;
}) {
  return (
    <main className="relative z-10 w-full" style={{ minHeight: "calc(100vh - 69px)" }}>
      {/* Top context */}
      <div className="fade-in px-8 pb-4 pt-6">
        <div className="mx-auto flex max-w-7xl items-start justify-between">
          <div>
            <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] opacity-50">Opportunity field</div>
            <h2 className="serif text-5xl leading-none">{company.name}</h2>
            <div className="mt-3 max-w-xl text-sm italic opacity-70">{company.signal}</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="mono text-[10px] uppercase tracking-[0.2em] opacity-50">Stack detected</div>
            <div className="flex max-w-md flex-wrap justify-end gap-1.5">
              {company.stack.map((s) => (
                <span key={s} className="mono rounded-sm border border-[#F6F3EC]/15 px-2 py-1 text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orbital stage */}
      <div className="relative mx-auto" style={{ height: "620px", maxWidth: "1100px" }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="coreGrad">
              <stop offset="0%" stopColor="#8BB2ED" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#8BB2ED" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8BB2ED" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[140, 180, 220, 260].map((r, i) => (
            <ellipse
              key={r}
              cx="50%"
              cy="50%"
              rx={r}
              ry={r * 0.55}
              fill="none"
              stroke="#F6F3EC"
              strokeOpacity={0.08 - i * 0.015}
              strokeWidth="1"
              strokeDasharray={i % 2 === 0 ? "2 6" : "0"}
            />
          ))}
          {opportunities.map((opp) => {
            const x = 50 + Math.cos((opp.angle * Math.PI) / 180) * (opp.radius / 11);
            const y = 50 + Math.sin((opp.angle * Math.PI) / 180) * (opp.radius / 22);
            return (
              <line
                key={`line-${opp.id}`}
                x1="50%"
                y1="50%"
                x2={`${x}%`}
                y2={`${y}%`}
                stroke={opp.color}
                strokeOpacity={starred.has(opp.id) ? 0.45 : 0.15}
                strokeWidth={starred.has(opp.id) ? "1.5" : "0.75"}
                className="pulse-line"
              />
            );
          })}
        </svg>

        {/* Core */}
        <div className="scale-in absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: "0.2s" }}>
          <div className="relative">
            <div
              className="core-pulse relative flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background: "radial-gradient(circle, #8BB2ED 0%, #3E6CB0 60%, #1E3A6F 100%)",
              }}
            >
              <div className="text-center">
                <div className="serif text-lg leading-none">
                  {company.name.length > 10 ? company.name.slice(0, 8) + "…" : company.name}
                </div>
                <div className="mono mt-1 text-[8px] uppercase tracking-[0.15em] opacity-80">Core</div>
              </div>
            </div>
          </div>
        </div>

        {/* Satellites */}
        {opportunities.map((opp, i) => {
          const x = 50 + Math.cos((opp.angle * Math.PI) / 180) * (opp.radius / 11);
          const y = 50 + Math.sin((opp.angle * Math.PI) / 180) * (opp.radius / 22);
          const size = 12 + (opp.impact / 100) * 22;
          const isFocused = selectedOpp?.id === opp.id;
          return (
            <div
              key={opp.id}
              className="scale-in absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                animationDelay: `${0.4 + i * 0.08}s`,
                zIndex: starred.has(opp.id) ? 15 : 5,
              }}
            >
              <button
                onClick={() => setSelectedOpp(opp)}
                className={`satellite block rounded-full ${starred.has(opp.id) ? "starred" : ""}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  background: opp.color,
                  boxShadow: `0 0 ${size}px ${opp.color}40`,
                }}
              />
              <div
                className={`pointer-events-none absolute left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-300 ${
                  isFocused ? "opacity-100" : "opacity-70"
                }`}
                style={{ top: `${size}px` }}
              >
                <div className="text-center text-[11px] font-medium" style={{ color: opp.color }}>
                  {opp.title}
                </div>
                <div className="mono mt-0.5 text-center text-[9px] uppercase tracking-[0.15em] opacity-50">
                  {opp.readiness}% ready · {opp.horizon}d
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="mono absolute bottom-4 left-6 space-y-1 text-[10px] uppercase tracking-[0.15em] opacity-40">
          <div>Distance from core = time to value</div>
          <div>Satellite size = strategic impact</div>
          <div>Color = opportunity category</div>
        </div>

        {/* Star count + Brief CTA */}
        <div className="absolute right-6 top-4 flex items-center gap-3">
          <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-60">
            <Star size={13} filled={starred.size > 0} className={starred.size > 0 ? "text-[#FFD074]" : "opacity-40"} />
            {starred.size} starred
          </div>
          {starred.size > 0 && (
            <button onClick={onShowBrief} className="btn-primary scale-in inline-flex items-center gap-2 rounded-sm px-4 py-2">
              <Download size={12} />
              <span className="mono text-[10px] uppercase tracking-[0.18em]">Build brief</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function SatelliteModal({
  opp,
  launchMode,
  starred,
  onToggleStar,
  onLaunch,
  onBack,
  onClose,
}: {
  opp: MirrorOpportunity;
  launchMode: MirrorOpportunity | null;
  starred: Set<string>;
  onToggleStar: (id: string) => void;
  onLaunch: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fade-in fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(6, 15, 34, 0.75)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scale-in relative w-full max-w-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(17, 37, 75, 0.95) 0%, rgba(11, 30, 63, 0.98) 100%)",
          border: `1px solid ${opp.color}40`,
          borderRadius: "4px",
          boxShadow: `0 0 80px ${opp.color}30, 0 20px 60px rgba(0,0,0,0.4)`,
        }}
      >
        <button onClick={onClose} className="absolute right-5 top-5 z-10 opacity-60 transition hover:opacity-100">
          <Close size={18} />
        </button>

        {!launchMode ? (
          <div className="p-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ background: opp.color }} />
              <div className="mono text-[10px] uppercase tracking-[0.2em] opacity-60">{opp.category}</div>
            </div>
            <h3 className="serif mb-2 text-4xl leading-tight">{opp.title}</h3>
            <p className="mb-8 text-lg italic leading-snug opacity-75">{opp.insight}</p>

            <div className="mb-8 grid grid-cols-3 gap-4">
              <ScorePip label="Readiness" value={opp.readiness} color={opp.color} />
              <ScorePip label="Impact" value={opp.impact} color={opp.color} />
              <ScorePip label="Effort" value={opp.effort} color={opp.color} invert />
            </div>

            <div className="space-y-5 border-t border-[#F6F3EC]/10 pt-6">
              <div>
                <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] opacity-60">Smallest experiment</div>
                <p className="leading-relaxed">{opp.experiment}</p>
              </div>
              <div>
                <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] opacity-60">Primary risk</div>
                <p className="leading-relaxed opacity-85">{opp.risk}</p>
              </div>
              <div>
                <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] opacity-60">Time horizon</div>
                <p className="leading-relaxed">
                  First signal in <span className="serif text-xl">{opp.horizon}</span> days. Full deployment in{" "}
                  <span className="serif text-xl">{Math.round(opp.horizon * 2.2)}</span>–
                  <span className="serif text-xl">{Math.round(opp.horizon * 3)}</span> days.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#F6F3EC]/10 pt-6">
              <button
                onClick={() => onToggleStar(opp.id)}
                className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 transition ${
                  starred.has(opp.id) ? "btn-primary" : "btn-ghost"
                }`}
              >
                <Star size={13} filled={starred.has(opp.id)} />
                <span className="mono text-[11px] uppercase tracking-[0.15em]">
                  {starred.has(opp.id) ? "Starred" : "Star this"}
                </span>
              </button>
              <button
                onClick={onLaunch}
                className="inline-flex items-center gap-2 rounded-sm px-5 py-2.5 transition"
                style={{ background: opp.color, color: "#0B1E3F" }}
              >
                <Rocket size={13} />
                <span className="mono text-[11px] uppercase tracking-[0.15em]">Launch trajectory</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ background: opp.color }} />
              <div className="mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                90-day trajectory · {opp.title}
              </div>
            </div>
            <h3 className="serif mb-8 text-3xl leading-tight">
              What the first <span className="italic">90 days</span> look like.
            </h3>

            <div className="relative">
              <svg className="pointer-events-none absolute inset-0 w-full" height="100%" style={{ overflow: "visible", zIndex: 0 }}>
                <line
                  x1="2%"
                  y1="30"
                  x2="98%"
                  y2="30"
                  stroke={opp.color}
                  strokeOpacity="0.3"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="trajectory"
                />
              </svg>

              <div className="relative grid grid-cols-3 gap-4">
                {[
                  { label: "Weeks 1–3", title: "Frame + align", detail: "Define the hypothesis. Identify data + team. Set success metric.", delay: "0.1s" },
                  { label: "Weeks 4–8", title: "Run experiment", detail: opp.experiment.split(".")[0] + ".", delay: "0.3s" },
                  { label: "Weeks 9–13", title: "Read signal", detail: "Measure outcome. Decide scale, kill, or pivot. Document learning.", delay: "0.5s" },
                ].map((phase, i) => (
                  <div key={i} className="traj-box" style={{ animationDelay: phase.delay, zIndex: 1 }}>
                    <div
                      className="relative z-10 mx-auto mb-3 h-4 w-4 rounded-full"
                      style={{ background: opp.color, boxShadow: `0 0 16px ${opp.color}` }}
                    />
                    <div className="text-center">
                      <div className="mono mb-1 text-[10px] uppercase tracking-[0.2em] opacity-60">{phase.label}</div>
                      <div className="serif mb-2 text-xl">{phase.title}</div>
                      <p className="text-xs leading-relaxed opacity-75">{phase.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-[#F6F3EC]/10 pt-6">
              <div className="mono mb-3 text-[10px] uppercase tracking-[0.2em] opacity-60">What ArcticBlue brings</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {["Experimentation methodology", "Hands-on prototyping team", "Executive + team enablement"].map((c, i) => (
                  <div key={i} className="rounded-sm border border-[#F6F3EC]/15 p-3 leading-relaxed">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={onBack} className="btn-ghost rounded-sm px-4 py-2">
                <span className="mono text-[11px] uppercase tracking-[0.15em]">← Back</span>
              </button>
              <button
                onClick={() => {
                  onToggleStar(opp.id);
                  onBack();
                  onClose();
                }}
                className="btn-primary inline-flex items-center gap-2 rounded-sm px-5 py-2.5"
              >
                <Star size={13} filled />
                <span className="mono text-[11px] uppercase tracking-[0.15em]">Add to brief</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BriefModal({
  company,
  starredOpps,
  onClose,
}: {
  company: MirrorCompany;
  starredOpps: MirrorOpportunity[];
  onClose: () => void;
}) {
  return (
    <div
      className="fade-in fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(6, 15, 34, 0.8)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scale-in relative max-h-[88vh] w-full max-w-3xl overflow-y-auto"
        style={{
          background: "#F6F3EC",
          color: "#0B1E3F",
          borderRadius: "4px",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
        }}
      >
        <button onClick={onClose} className="absolute right-5 top-5 z-10 opacity-60 transition hover:opacity-100">
          <Close size={18} />
        </button>

        <div className="p-12">
          <div className="mb-2 flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="#0B1E3F" />
              <circle cx="12" cy="12" r="9" stroke="#0B1E3F" strokeOpacity="0.3" strokeWidth="1" />
            </svg>
            <div className="mono text-[10px] uppercase tracking-[0.2em] opacity-60">ArcticBlue AI · Opportunity brief</div>
          </div>
          <h3 className="serif mb-2 mt-3 text-5xl leading-tight">
            {company.name}
            <br />
            <span className="italic opacity-80">a prioritized map.</span>
          </h3>
          <p className="mb-10 opacity-70">
            {company.industry} · {company.size} · Prepared{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="mb-10 space-y-5">
            {starredOpps.map((op, idx) => (
              <div
                key={op.id}
                className="traj-box flex gap-5 border-b border-[#0B1E3F]/10 pb-5 last:border-b-0"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-16 shrink-0">
                  <div className="mono text-[10px] uppercase tracking-[0.2em] opacity-50">
                    Phase {Math.floor(idx / 2) + 1}
                  </div>
                  <div className="serif mt-1 text-3xl leading-none">{String(idx + 1).padStart(2, "0")}</div>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: op.color }} />
                    <div className="mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                      {op.category} · {op.readiness}% ready · {op.horizon}d horizon
                    </div>
                  </div>
                  <h4 className="serif mb-1 text-2xl leading-tight">{op.title}</h4>
                  <p className="mb-2 text-sm italic opacity-75">{op.insight}</p>
                  <p className="text-sm opacity-80">
                    <span className="mono text-[10px] uppercase tracking-[0.15em] opacity-60">Experiment: </span>
                    {op.experiment}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#0B1E3F]/10 pt-6">
            <div className="mono mb-3 text-[10px] uppercase tracking-[0.2em] opacity-60">How ArcticBlue would engage</div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-sm border border-[#0B1E3F]/15 p-3 leading-relaxed">
                <div className="serif mb-1 text-base">01 · Frame</div>
                Two-week discovery to pressure-test the top three opportunities against your constraints.
              </div>
              <div className="rounded-sm border border-[#0B1E3F]/15 p-3 leading-relaxed">
                <div className="serif mb-1 text-base">02 · Experiment</div>
                Six- to eight-week experiments on the two highest-conviction bets, run by our team + yours.
              </div>
              <div className="rounded-sm border border-[#0B1E3F]/15 p-3 leading-relaxed">
                <div className="serif mb-1 text-base">03 · Scale</div>
                Enablement layer so what works compounds across your team, not just our engagement.
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-[#0B1E3F]/10 pt-6">
            <div className="mono text-[9px] uppercase tracking-[0.2em] opacity-50">
              arcticblue.ai · Generated {new Date().toLocaleDateString()}
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-sm bg-[#0B1E3F] px-5 py-2.5 text-[#F6F3EC] transition hover:bg-[#1E3A6F]"
            >
              <Download size={13} />
              <span className="mono text-[11px] uppercase tracking-[0.15em]">Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScorePip({
  label,
  value,
  color,
  invert,
}: {
  label: string;
  value: number;
  color: string;
  invert?: boolean;
}) {
  const displayValue = invert ? 100 - value : value;
  return (
    <div>
      <div className="mono mb-2 text-[9px] uppercase tracking-[0.2em] opacity-50">{label}</div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="serif text-3xl leading-none" style={{ color }}>
          {value}
        </span>
        <span className="mono text-[10px] opacity-50">/ 100</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#F6F3EC]/10">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${displayValue}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ── Tiny inline icons so the component is self-contained ── */

function Star({ size = 16, filled = false, className = "" }: { size?: number; filled?: boolean; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function Close({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18 M6 6l12 12" />
    </svg>
  );
}
function Rocket({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
function Download({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
