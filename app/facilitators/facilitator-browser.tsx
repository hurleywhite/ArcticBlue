"use client";

import { useMemo, useState } from "react";
import type { Facilitator, Focus, ExperienceLevel } from "@/lib/content/facilitators";

/*
  Facilitator pool browser — search + filter + card grid.
  Each card shows focus, experience, region, current engagement, past
  engagements. LinkedIn link preserved from the source prototype.
*/

type Region = Facilitator["region"];

export function FacilitatorBrowser({
  facilitators,
}: {
  facilitators: Facilitator[];
}) {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<Focus | "all">("all");
  const [level, setLevel] = useState<ExperienceLevel | "all">("all");
  const [region, setRegion] = useState<Region | "all">("all");

  const regions = useMemo(
    () => Array.from(new Set(facilitators.map((f) => f.region))).sort(),
    [facilitators]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return facilitators.filter((f) => {
      if (focus !== "all" && f.focus !== focus) return false;
      if (level !== "all" && f.experience_level !== level) return false;
      if (region !== "all" && f.region !== region) return false;
      if (!q) return true;
      const hay = `${f.name} ${f.bio} ${f.city} ${f.country} ${f.current_engagement ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [facilitators, query, focus, level, region]);

  const availableCount = facilitators.filter((f) => !f.current_engagement).length;

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-0 border border-ink-border md:grid-cols-4">
        <Stat label="Total" value={facilitators.length} />
        <Stat label="Available now" value={availableCount} />
        <Stat label="On assignment" value={facilitators.length - availableCount} />
        <Stat label="Regions" value={regions.length} last />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border border-ink-border bg-bg-card px-4 py-3">
        <input
          type="search"
          placeholder="Name, bio, city, engagement…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
          style={{ maxWidth: 320 }}
        />
        <span className="mx-2 h-4 w-px bg-ink-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Focus
        </span>
        <Chip active={focus === "all"} onClick={() => setFocus("all")}>All</Chip>
        <Chip active={focus === "Facilitation"} onClick={() => setFocus("Facilitation")}>
          Facilitation
        </Chip>
        <Chip active={focus === "Tech"} onClick={() => setFocus("Tech")}>
          Tech
        </Chip>
        <Chip active={focus === "Both"} onClick={() => setFocus("Both")}>
          Both
        </Chip>
        <span className="mx-2 h-4 w-px bg-ink-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Level
        </span>
        <Chip active={level === "all"} onClick={() => setLevel("all")}>All</Chip>
        <Chip active={level === "High"} onClick={() => setLevel("High")}>
          High
        </Chip>
        <Chip active={level === "Medium"} onClick={() => setLevel("Medium")}>
          Medium
        </Chip>
        <span className="mx-2 h-4 w-px bg-ink-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Region
        </span>
        <Chip active={region === "all"} onClick={() => setRegion("all")}>All</Chip>
        {regions.map((r) => (
          <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
            {r}
          </Chip>
        ))}
        {(query || focus !== "all" || level !== "all" || region !== "all") && (
          <button
            onClick={() => {
              setQuery("");
              setFocus("all");
              setLevel("all");
              setRegion("all");
            }}
            className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <h2 className="section-header mt-6 mb-3">
        {filtered.length} facilitator{filtered.length === 1 ? "" : "s"}
      </h2>

      {filtered.length === 0 ? (
        <div className="border border-ink-border bg-white px-5 py-6 text-center italic text-ink-muted">
          No facilitators match those filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <Card key={f.id} facilitator={f} />
          ))}
        </div>
      )}
    </>
  );
}

function Card({ facilitator: f }: { facilitator: Facilitator }) {
  const available = !f.current_engagement;
  const initials = f.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex flex-col border border-ink-border bg-white">
      <div className="flex items-start gap-3 bg-navy px-4 py-3 text-white">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/30 bg-white/10 text-[12px] font-bold">
          {initials}
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-bold leading-[1.2]">{f.name}</div>
          <div className="mt-0.5 text-[11px] opacity-80">
            {f.city}, {f.country}
          </div>
        </div>
        <span
          className={
            available
              ? "shrink-0 border border-white/40 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
              : "shrink-0 border border-white bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-navy"
          }
        >
          {available ? "Available" : "Assigned"}
        </span>
      </div>
      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Pill>{f.focus}</Pill>
          <Pill>{f.experience_level} experience</Pill>
          <Pill>{f.region}</Pill>
        </div>
        <p className="text-[12px] leading-[1.55] text-ink">{f.bio}</p>
        {f.current_engagement && (
          <div className="border-t border-ink-border pt-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-navy">
              Current engagement
            </div>
            <div className="mt-0.5 text-[12px] text-ink">{f.current_engagement}</div>
          </div>
        )}
        {f.past_engagements.length > 0 && (
          <div className="border-t border-ink-border pt-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-navy">
              Past engagements
            </div>
            <ul className="m-0 mt-1 list-none p-0 text-[11px] text-ink-muted">
              {f.past_engagements.slice(0, 3).map((e) => (
                <li key={e}>· {e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-auto border-t border-ink-border bg-bg-card px-4 py-2 text-right">
        <a
          href={f.linkedin_url}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
        >
          LinkedIn →
        </a>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "border border-navy bg-navy px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
          : "border border-ink-border bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
      }
    >
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-ink-border bg-bg-card px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  last,
}: {
  label: string;
  value: number;
  last?: boolean;
}) {
  return (
    <div
      className={`bg-bg-card px-5 py-4 ${
        last ? "" : "md:border-r md:border-ink-border"
      } border-b border-ink-border md:border-b-0`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-bold text-navy">{value}</div>
    </div>
  );
}
