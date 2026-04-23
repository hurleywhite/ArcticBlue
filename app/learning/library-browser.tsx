"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Module, ModuleType, SkillLevel } from "@/lib/content/types";

/*
  Client-side filter chips over the full module library. All filters
  are applied in-browser since the library is small and we want instant
  feedback. Switches to server-side filtering when the DB wires up.
*/

const TYPE_OPTIONS: Array<{ value: ModuleType; label: string }> = [
  { value: "reading", label: "Reading" },
  { value: "video", label: "Video" },
  { value: "exercise", label: "Exercise" },
  { value: "live_workshop", label: "Live workshop" },
  { value: "curated_external", label: "Curated external" },
];

const LEVEL_OPTIONS: Array<{ value: SkillLevel; label: string }> = [
  { value: "intro", label: "Intro" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function LibraryBrowser({ modules }: { modules: Module[] }) {
  const [types, setTypes] = useState<Set<ModuleType>>(new Set());
  const [levels, setLevels] = useState<Set<SkillLevel>>(new Set());
  const [topic, setTopic] = useState<string>("");

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    modules.forEach((m) => m.tags.topics?.forEach((t) => topics.add(t)));
    return Array.from(topics).sort();
  }, [modules]);

  const filtered = useMemo(() => {
    return modules.filter((m) => {
      if (types.size > 0 && !types.has(m.module_type)) return false;
      if (levels.size > 0) {
        const level = m.tags.skill_level;
        if (!level || !levels.has(level)) return false;
      }
      if (topic && !(m.tags.topics ?? []).includes(topic)) return false;
      return true;
    });
  }, [modules, types, levels, topic]);

  const toggle = <T,>(set: Set<T>, v: T, apply: (n: Set<T>) => void) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    apply(n);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border border-ink-border bg-bg-card px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Type
        </span>
        {TYPE_OPTIONS.map((t) => (
          <Chip
            key={t.value}
            active={types.has(t.value)}
            onClick={() => toggle(types, t.value, setTypes)}
          >
            {t.label}
          </Chip>
        ))}
        <span className="mx-2 h-4 w-px bg-ink-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Level
        </span>
        {LEVEL_OPTIONS.map((l) => (
          <Chip
            key={l.value}
            active={levels.has(l.value)}
            onClick={() => toggle(levels, l.value, setLevels)}
          >
            {l.label}
          </Chip>
        ))}
        <span className="mx-2 h-4 w-px bg-ink-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Topic
        </span>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="select"
          style={{ width: "auto" }}
        >
          <option value="">Any topic</option>
          {allTopics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {(types.size > 0 || levels.size > 0 || topic) && (
          <button
            onClick={() => {
              setTypes(new Set());
              setLevels(new Set());
              setTopic("");
            }}
            className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <table className="doc-table mt-4">
        <thead>
          <tr>
            <th style={{ width: "12%" }}>Type</th>
            <th>Title</th>
            <th style={{ width: "22%" }}>Author</th>
            <th style={{ width: "10%" }}>Length</th>
            <th style={{ width: "8%" }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.id}>
              <td>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  {TYPE_OPTIONS.find((t) => t.value === m.module_type)?.label}
                </span>
              </td>
              <td>
                <Link
                  href={`/learning/${m.slug}`}
                  className="font-bold text-navy hover:underline"
                >
                  {m.title}
                </Link>
                {m.subtitle && (
                  <div className="mt-0.5 text-ink-muted">{m.subtitle}</div>
                )}
              </td>
              <td className="text-ink-muted">{m.author_name}</td>
              <td className="text-ink-muted">{m.estimated_minutes} min</td>
              <td>
                <Link
                  href={`/learning/${m.slug}`}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                >
                  Open →
                </Link>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center italic text-ink-muted">
                No modules match those filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
