"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type {
  Facilitator,
  Focus,
  ExperienceLevel,
} from "@/lib/content/facilitators";
import { Stagger, staggerChild } from "@/components/motion/primitives";

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
      const hay =
        `${f.name} ${f.bio} ${f.city} ${f.country} ${f.current_engagement ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [facilitators, query, focus, level, region]);

  const availableCount = facilitators.filter(
    (f) => !f.current_engagement
  ).length;

  return (
    <>
      <div
        className="grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4"
        style={{ background: "var(--fg-16)" }}
      >
        <Stat label="Total" value={facilitators.length} />
        <Stat label="Available now" value={availableCount} />
        <Stat label="On assignment" value={facilitators.length - availableCount} />
        <Stat label="Regions" value={regions.length} />
      </div>

      <div
        className="mt-6 flex flex-wrap items-center gap-2 px-4 py-3"
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--fg-16)",
          borderRadius: 2,
        }}
      >
        <input
          type="search"
          placeholder="Name, bio, city, engagement…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
          style={{ maxWidth: 320, background: "var(--ink-deep)" }}
        />
        <span className="mx-1 h-4 w-px" style={{ background: "var(--fg-16)" }} />
        <span className="kicker-sm">Focus</span>
        <Chip active={focus === "all"} onClick={() => setFocus("all")}>
          All
        </Chip>
        <Chip
          active={focus === "Facilitation"}
          onClick={() => setFocus("Facilitation")}
        >
          Facilitation
        </Chip>
        <Chip active={focus === "Tech"} onClick={() => setFocus("Tech")}>
          Tech
        </Chip>
        <Chip active={focus === "Both"} onClick={() => setFocus("Both")}>
          Both
        </Chip>
        <span className="mx-1 h-4 w-px" style={{ background: "var(--fg-16)" }} />
        <span className="kicker-sm">Level</span>
        <Chip active={level === "all"} onClick={() => setLevel("all")}>
          All
        </Chip>
        <Chip active={level === "High"} onClick={() => setLevel("High")}>
          High
        </Chip>
        <Chip active={level === "Medium"} onClick={() => setLevel("Medium")}>
          Medium
        </Chip>
        <span className="mx-1 h-4 w-px" style={{ background: "var(--fg-16)" }} />
        <span className="kicker-sm">Region</span>
        <Chip active={region === "all"} onClick={() => setRegion("all")}>
          All
        </Chip>
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
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--frost)" }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <span className="kicker">
          {filtered.length} facilitator{filtered.length === 1 ? "" : "s"}
        </span>
        <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
      </div>

      {filtered.length === 0 ? (
        <div
          className="mt-6 px-5 py-8 text-center italic"
          style={{
            background: "var(--ink-raised)",
            border: "1px solid var(--fg-16)",
            color: "var(--fg-52)",
          }}
        >
          No facilitators match those filters.
        </div>
      ) : (
        <Stagger
          className="mt-6 grid grid-cols-1 gap-px overflow-hidden md:grid-cols-2 lg:grid-cols-3"
          style={{ background: "var(--fg-16)" }}
        >
          {filtered.map((f) => (
            <motion.div key={f.id} variants={staggerChild}>
              <Card facilitator={f} />
            </motion.div>
          ))}
        </Stagger>
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
    <div
      className="group relative flex h-full flex-col"
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
      <div className="flex items-start gap-3 px-5 py-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center font-mono text-[11px] font-medium"
          style={{
            background: "var(--ink-deep)",
            border: "1px solid var(--fg-16)",
            color: "var(--fg-100)",
          }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <div
            className="serif text-[16px] leading-[1.2]"
            style={{ color: "var(--fg-100)" }}
          >
            {f.name}
          </div>
          <div className="mt-1 kicker-sm">
            {f.city}, {f.country}
          </div>
        </div>
        <span
          className="shrink-0 font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
          style={{
            padding: "4px 8px",
            background: available ? "transparent" : "var(--frost)",
            color: available ? "var(--frost)" : "var(--ink-deep)",
            border: `1px solid ${available ? "var(--frost)" : "var(--frost)"}`,
            borderRadius: 2,
          }}
        >
          {available ? "Available" : "Assigned"}
        </span>
      </div>
      <div className="flex flex-col gap-3 px-5 pb-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill>{f.focus}</Pill>
          <Pill>{f.experience_level}</Pill>
          <Pill>{f.region}</Pill>
        </div>
        <p
          className="text-[13px] leading-[1.55]"
          style={{ color: "var(--fg-72)" }}
        >
          {f.bio}
        </p>
        {f.current_engagement && (
          <div
            className="border-t pt-3"
            style={{ borderTopColor: "var(--fg-16)" }}
          >
            <div className="kicker-sm">Current</div>
            <div
              className="mt-1 text-[12px]"
              style={{ color: "var(--fg-100)" }}
            >
              {f.current_engagement}
            </div>
          </div>
        )}
        {f.past_engagements.length > 0 && (
          <div
            className="border-t pt-3"
            style={{ borderTopColor: "var(--fg-16)" }}
          >
            <div className="kicker-sm">Past engagements</div>
            <ul className="m-0 mt-1 list-none p-0">
              {f.past_engagements.slice(0, 3).map((e) => (
                <li
                  key={e}
                  className="text-[12px] leading-[1.45]"
                  style={{ color: "var(--fg-52)" }}
                >
                  · {e}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div
        className="mt-auto flex items-center justify-between border-t px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{
          borderTopColor: "var(--fg-16)",
          background: "var(--ink-deep)",
          color: "var(--fg-52)",
        }}
      >
        <span>{f.region}</span>
        <a
          href={f.linkedin_url}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--frost)" }}
          className="transition-opacity hover:opacity-80"
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
    <button onClick={onClick} className={`chip ${active ? "active" : ""}`}>
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
      style={{
        padding: "3px 7px",
        background: "var(--ink-deep)",
        border: "1px solid var(--fg-16)",
        color: "var(--fg-72)",
        borderRadius: 2,
      }}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-5 py-5" style={{ background: "var(--ink-raised)" }}>
      <div className="kicker-sm">{label}</div>
      <div
        className="serif-tight mt-3 text-[32px] leading-none"
        style={{ color: "var(--fg-100)" }}
      >
        {value}
      </div>
    </div>
  );
}
