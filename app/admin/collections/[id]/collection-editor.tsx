"use client";

import { useState } from "react";
import type { Collection, Module } from "@/lib/content/types";
import { EditorRow, EditorSection, SaveBar } from "@/components/admin/editor-primitives";

const TYPE_LABEL: Record<string, string> = {
  reading: "Reading",
  video: "Video",
  exercise: "Exercise",
  live_workshop: "Live workshop",
  curated_external: "Curated external",
};

export function CollectionEditor({
  collection,
  allModules,
}: {
  collection: Collection;
  allModules: Module[];
}) {
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description);
  const [selected, setSelected] = useState<string[]>(collection.module_slugs);
  const [topics, setTopics] = useState((collection.tags.topics ?? []).join(", "));

  const pool = allModules.filter((m) => !selected.includes(m.slug));

  const move = (idx: number, dir: -1 | 1) => {
    setSelected((prev) => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const remove = (slug: string) =>
    setSelected((prev) => prev.filter((s) => s !== slug));
  const add = (slug: string) => setSelected((prev) => [...prev, slug]);

  const totalMin = selected.reduce((sum, s) => {
    const m = allModules.find((mm) => mm.slug === s);
    return sum + (m?.estimated_minutes ?? 0);
  }, 0);

  return (
    <div className="mt-6">
      <EditorSection title="Basics">
        <EditorRow label="Title">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </EditorRow>
        <EditorRow label="Description">
          <textarea
            className="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </EditorRow>
      </EditorSection>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="section-header mb-0">
          Sequence · {selected.length} modules · {totalMin} min
        </h2>
      </div>
      <table className="doc-table mt-2">
        <thead>
          <tr>
            <th style={{ width: "6%" }}>#</th>
            <th style={{ width: "14%" }}>Type</th>
            <th>Module</th>
            <th style={{ width: "10%" }}>Length</th>
            <th style={{ width: "16%" }}>Move</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((slug, idx) => {
            const m = allModules.find((mm) => mm.slug === slug);
            return (
              <tr key={slug}>
                <td className="font-bold text-navy">{String(idx + 1).padStart(2, "0")}</td>
                <td>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    {m ? TYPE_LABEL[m.module_type] : "—"}
                  </span>
                </td>
                <td>
                  <strong>{m?.title ?? slug}</strong>
                </td>
                <td>{m?.estimated_minutes ?? "—"} min</td>
                <td>
                  <button
                    onClick={() => move(idx, -1)}
                    className="mr-2 text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    className="mr-2 text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => remove(slug)}
                    className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted hover:text-navy"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
          {selected.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center italic text-ink-muted">
                No modules in this collection yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="section-header mt-8 mb-2">Add from library</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "14%" }}>Type</th>
            <th>Module</th>
            <th style={{ width: "10%" }}>Length</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          {pool.map((m) => (
            <tr key={m.slug}>
              <td>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  {TYPE_LABEL[m.module_type]}
                </span>
              </td>
              <td>
                <strong>{m.title}</strong>
                {m.subtitle && <div className="mt-0.5 text-ink-muted">{m.subtitle}</div>}
              </td>
              <td>{m.estimated_minutes} min</td>
              <td>
                <button
                  onClick={() => add(m.slug)}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                >
                  + Add
                </button>
              </td>
            </tr>
          ))}
          {pool.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center italic text-ink-muted">
                Every published module is already in this collection.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <EditorSection title="Tags">
        <EditorRow label="Topics">
          <input className="input" value={topics} onChange={(e) => setTopics(e.target.value)} />
        </EditorRow>
      </EditorSection>

      <SaveBar slug={collection.slug} id={collection.id} />
    </div>
  );
}
