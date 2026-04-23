"use client";

import { useState } from "react";
import type { Module } from "@/lib/content/types";
import { Markdown } from "@/components/shared/markdown";

/*
  Module editor — shell UI. Mirrors every field in the schema. All save
  actions show a confirmation banner but don't yet persist — they'll
  post to a Supabase-backed route once DB credentials are wired.

  This matches PROJECT.md §7.7 editor shape: Basics, Content (type-specific),
  Tags, Status. Sticky save bar at the bottom.
*/

export function ModuleEditor({ module: m }: { module: Module }) {
  const [saved, setSaved] = useState<null | "draft" | "publish">(null);
  const [state, setState] = useState({
    title: m.title,
    subtitle: m.subtitle ?? "",
    description: m.description,
    author_name: m.author_name,
    author_role: m.author_role ?? "",
    estimated_minutes: m.estimated_minutes,
    module_type: m.module_type,
    body_markdown: m.body_markdown ?? "",
    video_mux_playback_id: m.video_mux_playback_id ?? "",
    external_url: m.external_url ?? "",
    exercise_prompt: m.exercise_prompt ?? "",
    workshop_date: m.workshop_date ?? "",
    workshop_registration_url: m.workshop_registration_url ?? "",
    topics: (m.tags.topics ?? []).join(", "),
    roles: (m.tags.roles ?? []).join(", "),
    industries: (m.tags.industries ?? []).join(", "),
    categories: (m.tags.categories ?? []).join(", "),
    skill_level: m.tags.skill_level ?? "intro",
  });

  const set = <K extends keyof typeof state>(k: K, v: (typeof state)[K]) =>
    setState((prev) => ({ ...prev, [k]: v }));

  const announce = (kind: "draft" | "publish") => {
    setSaved(kind);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="mt-6">
      {saved && (
        <div className="callout mb-4">
          <p>
            <strong>{saved === "draft" ? "Draft saved" : "Published"}</strong> ·
            persistence wires into Supabase once credentials are in .env.local.
            No data is lost in the meantime — form state is preserved on this page.
          </p>
        </div>
      )}

      <h2 className="section-header mb-3">Basics</h2>
      <table className="doc-table">
        <tbody>
          <Row label="Title">
            <input className="input" value={state.title} onChange={(e) => set("title", e.target.value)} />
          </Row>
          <Row label="Subtitle">
            <input className="input" value={state.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </Row>
          <Row label="Description">
            <textarea
              className="textarea"
              rows={3}
              value={state.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Row>
          <Row label="Type">
            <select
              className="select"
              value={state.module_type}
              onChange={(e) => set("module_type", e.target.value as Module["module_type"])}
            >
              <option value="reading">Reading</option>
              <option value="video">Video</option>
              <option value="exercise">Exercise</option>
              <option value="live_workshop">Live workshop</option>
              <option value="curated_external">Curated external</option>
            </select>
          </Row>
          <Row label="Estimated minutes">
            <input
              className="input"
              type="number"
              value={state.estimated_minutes}
              onChange={(e) => set("estimated_minutes", Number(e.target.value))}
              style={{ maxWidth: 160 }}
            />
          </Row>
          <Row label="Author · name">
            <input
              className="input"
              value={state.author_name}
              onChange={(e) => set("author_name", e.target.value)}
            />
          </Row>
          <Row label="Author · role">
            <input
              className="input"
              value={state.author_role}
              onChange={(e) => set("author_role", e.target.value)}
            />
          </Row>
        </tbody>
      </table>

      {/* Content section — varies by type */}
      <h2 className="section-header mt-8 mb-3">Content</h2>

      {state.module_type === "video" && (
        <table className="doc-table">
          <tbody>
            <Row label="Mux playback ID">
              <input
                className="input"
                value={state.video_mux_playback_id}
                onChange={(e) => set("video_mux_playback_id", e.target.value)}
              />
              <div className="mt-1 text-[11px] text-ink-muted">
                Upload via Mux dashboard, paste the playback ID here.
              </div>
            </Row>
          </tbody>
        </table>
      )}

      {state.module_type === "reading" && (
        <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-2">
          <div className="border-b border-ink-border p-0 md:border-b-0 md:border-r">
            <div className="bg-navy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Markdown source
            </div>
            <textarea
              className="w-full border-0 bg-white p-4 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[12px] leading-[1.55] focus:outline-none"
              style={{ minHeight: 480, resize: "vertical" }}
              value={state.body_markdown}
              onChange={(e) => set("body_markdown", e.target.value)}
              placeholder="## A heading…"
            />
          </div>
          <div>
            <div className="bg-navy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Live preview
            </div>
            <div className="p-5">
              <Markdown>{state.body_markdown || "_Preview appears here._"}</Markdown>
            </div>
          </div>
        </div>
      )}

      {state.module_type === "exercise" && (
        <table className="doc-table">
          <tbody>
            <Row label="Exercise prompt">
              <textarea
                className="textarea"
                rows={10}
                value={state.exercise_prompt}
                onChange={(e) => set("exercise_prompt", e.target.value)}
              />
              <div className="mt-1 text-[11px] text-ink-muted">
                This becomes the system prompt when the learner clicks "Practice this in Tools."
              </div>
            </Row>
          </tbody>
        </table>
      )}

      {state.module_type === "live_workshop" && (
        <table className="doc-table">
          <tbody>
            <Row label="Date and time (ISO)">
              <input
                className="input"
                value={state.workshop_date}
                onChange={(e) => set("workshop_date", e.target.value)}
                placeholder="2026-04-29T17:00:00Z"
              />
            </Row>
            <Row label="Registration URL">
              <input
                className="input"
                value={state.workshop_registration_url}
                onChange={(e) => set("workshop_registration_url", e.target.value)}
              />
            </Row>
          </tbody>
        </table>
      )}

      {state.module_type === "curated_external" && (
        <table className="doc-table">
          <tbody>
            <Row label="External URL">
              <input
                className="input"
                value={state.external_url}
                onChange={(e) => set("external_url", e.target.value)}
              />
            </Row>
            <Row label="Our POV on this (markdown)">
              <textarea
                className="textarea"
                rows={6}
                value={state.body_markdown}
                onChange={(e) => set("body_markdown", e.target.value)}
                placeholder="Why this matters. What to skim and what to read."
              />
            </Row>
          </tbody>
        </table>
      )}

      <h2 className="section-header mt-8 mb-3">Tags</h2>
      <table className="doc-table">
        <tbody>
          <Row label="Topics (comma-separated)">
            <input className="input" value={state.topics} onChange={(e) => set("topics", e.target.value)} />
          </Row>
          <Row label="Roles (comma-separated)">
            <input
              className="input"
              value={state.roles}
              onChange={(e) => set("roles", e.target.value)}
              placeholder="Chief Marketing Officer, Head of Strategy, or 'all'"
            />
          </Row>
          <Row label="Industries (comma-separated)">
            <input
              className="input"
              value={state.industries}
              onChange={(e) => set("industries", e.target.value)}
            />
          </Row>
          <Row label="Opportunity categories">
            <input
              className="input"
              value={state.categories}
              onChange={(e) => set("categories", e.target.value)}
              placeholder="Growth, Ops, Research, Service, People, Finance"
            />
          </Row>
          <Row label="Skill level">
            <select
              className="select"
              value={state.skill_level}
              onChange={(e) => set("skill_level", e.target.value as "intro" | "intermediate" | "advanced")}
            >
              <option value="intro">Intro</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Row>
        </tbody>
      </table>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 mt-8 flex items-center justify-between border-t border-ink-border bg-white px-4 py-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Slug: <code>{m.slug}</code> · ID: <code>{m.id}</code>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => announce("draft")} className="btn-secondary">
            Save draft
          </button>
          <button onClick={() => announce("publish")} className="btn-primary">
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td style={{ width: "22%", verticalAlign: "top" }}>
        <strong>{label}</strong>
      </td>
      <td>{children}</td>
    </tr>
  );
}
