"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Stagger, staggerChild } from "@/components/motion/primitives";
import type { LibraryItem, LibraryKind } from "./page";

const KIND_LABEL: Record<LibraryKind, string> = {
  prompt: "Prompt",
  template: "Template",
  case: "Use case",
  resource: "Resource",
  module: "Module",
};

export function LibraryBrowser({
  items,
  counts,
}: {
  items: LibraryItem[];
  counts: Record<LibraryKind | "collection", number>;
}) {
  const [kind, setKind] = useState<LibraryKind | "all">("all");
  const [topic, setTopic] = useState<string>("");

  const topics = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.topics.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (kind !== "all" && i.kind !== kind) return false;
      if (topic && !i.topics.includes(topic)) return false;
      return true;
    });
  }, [items, kind, topic]);

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3"
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--fg-16)",
          borderRadius: 2,
        }}
      >
        <span className="kicker-sm">Kind</span>
        <Chip active={kind === "all"} onClick={() => setKind("all")}>
          All · {items.length}
        </Chip>
        <Chip active={kind === "prompt"} onClick={() => setKind("prompt")}>
          Prompts · {counts.prompt}
        </Chip>
        <Chip active={kind === "template"} onClick={() => setKind("template")}>
          Templates · {counts.template}
        </Chip>
        <Chip active={kind === "case"} onClick={() => setKind("case")}>
          Cases · {counts.case}
        </Chip>
        <Chip active={kind === "resource"} onClick={() => setKind("resource")}>
          Resources · {counts.resource}
        </Chip>
        <Chip active={kind === "module"} onClick={() => setKind("module")}>
          Modules · {counts.module}
        </Chip>
        <span className="mx-1 h-4 w-px" style={{ background: "var(--fg-16)" }} />
        <span className="kicker-sm">Topic</span>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="select"
          style={{ width: "auto", background: "var(--ink-deep)" }}
        >
          <option value="">Any topic</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {(kind !== "all" || topic) && (
          <button
            onClick={() => {
              setKind("all");
              setTopic("");
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
          {filtered.length} item{filtered.length === 1 ? "" : "s"}
        </span>
        <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
      </div>

      <Stagger
        className="mt-6 divide-y"
        style={{
          borderTop: "1px solid var(--fg-16)",
          borderBottom: "1px solid var(--fg-16)",
        }}
      >
        {filtered.map((it) => (
          <motion.div key={`${it.kind}-${it.id}`} variants={staggerChild}>
            <LibraryRow item={it} />
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div
            className="px-5 py-8 text-center italic"
            style={{ color: "var(--fg-52)" }}
          >
            No matches. Loosen the filters.
          </div>
        )}
      </Stagger>
    </>
  );
}

function LibraryRow({ item }: { item: LibraryItem }) {
  const [copied, setCopied] = useState(false);
  const citeText = buildCite(item);

  const cite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(citeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <Link
      href={item.href}
      className="group relative grid items-start gap-6 px-1 py-6 md:grid-cols-[140px_1fr_160px_180px]"
      style={{
        borderBottomColor: "var(--fg-16)",
        transition: "background 200ms cubic-bezier(0.2, 0.7, 0.2, 1)",
      }}
    >
      <div className="flex items-start">
        <span className="kicker">{KIND_LABEL[item.kind]}</span>
      </div>
      <div>
        <div
          className="serif text-[20px] leading-[1.15] transition-colors group-hover:text-[color:var(--frost)]"
          style={{ color: "var(--fg-100)" }}
        >
          {item.title}
        </div>
        <p
          className="mt-2 text-[13px] leading-[1.55]"
          style={{ color: "var(--fg-52)" }}
        >
          {item.description}
        </p>
        {item.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.topics.slice(0, 5).map((t) => (
              <span
                key={t}
                className="font-mono text-[9px] font-medium uppercase tracking-[0.14em]"
                style={{
                  padding: "3px 7px",
                  border: "1px solid var(--fg-16)",
                  color: "var(--fg-52)",
                  borderRadius: 2,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div
        className="font-mono text-[11px] uppercase tracking-[0.16em]"
        style={{ color: "var(--fg-72)" }}
      >
        {item.stat}
      </div>
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={cite}
          className="font-mono text-[10px] uppercase tracking-[0.18em] transition-colors"
          style={{ color: copied ? "var(--frost)" : "var(--fg-52)" }}
        >
          {copied ? "Copied" : "Cite"}
        </button>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em] transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: "var(--frost)" }}
        >
          Open →
        </span>
      </div>
    </Link>
  );
}

function buildCite(item: LibraryItem): string {
  const kindLabel = KIND_LABEL[item.kind];
  const base = `${kindLabel} · ${item.title}
${item.description}`;
  const tail = `Ref: arcticmind.vercel.app${item.href}`;
  if (item.kind === "case") {
    return `${base}
Headline metric: ${item.stat}
${tail}`;
  }
  return `${base}
${item.stat}
${tail}`;
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
