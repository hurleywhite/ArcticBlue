"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LibraryItem, LibraryKind } from "./page";

/*
  Library browser. Filter by kind + topic, live count, cite-this per row.
  Keep it editorial — table-like rows, no decorative card chrome.
*/

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
      {/* Kind summary + filter bar */}
      <h2 className="section-header mt-10 mb-3">{filtered.length} items</h2>
      <div className="flex flex-wrap items-center gap-2 border border-ink-border bg-bg-card px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Kind</span>
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
        <span className="mx-2 h-4 w-px bg-ink-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Topic</span>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="select"
          style={{ width: "auto" }}
        >
          <option value="">Any topic</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {(kind !== "all" || topic) && (
          <button
            onClick={() => {
              setKind("all");
              setTopic("");
            }}
            className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <table className="doc-table mt-4">
        <thead>
          <tr>
            <th style={{ width: "12%" }}>Kind</th>
            <th>Title</th>
            <th style={{ width: "18%" }}>Stat</th>
            <th style={{ width: "22%" }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it) => (
            <LibraryRow key={`${it.kind}-${it.id}`} item={it} />
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center italic text-ink-muted">
                No matches. Loosen the filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
    <tr>
      <td>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
          {KIND_LABEL[item.kind]}
        </span>
      </td>
      <td>
        <Link href={item.href} className="font-bold text-navy hover:underline">
          {item.title}
        </Link>
        <div className="mt-0.5 text-ink-muted">{item.description}</div>
        {item.topics.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.topics.slice(0, 5).map((t) => (
              <span
                key={t}
                className="border border-ink-border bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </td>
      <td>
        <span className="font-bold text-navy">{item.stat}</span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <button
            onClick={cite}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
          >
            {copied ? "Copied" : "Cite this"}
          </button>
          <span className="text-ink-muted">·</span>
          <Link
            href={item.href}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
          >
            Open →
          </Link>
        </div>
      </td>
    </tr>
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
