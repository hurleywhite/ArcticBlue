"use client";

import { useState } from "react";
import type { UseCase } from "@/lib/content/types";
import { Markdown } from "@/components/shared/markdown";
import { EditorRow, EditorSection, SaveBar } from "@/components/admin/editor-primitives";

export function UseCaseEditor({ useCase: u }: { useCase: UseCase }) {
  const [state, setState] = useState({
    title: u.title,
    anonymized_client_label: u.anonymized_client_label,
    headline_metric: u.headline_metric,
    summary: u.summary,
    challenge: u.challenge_markdown,
    approach: u.approach_markdown,
    outcome: u.outcome_markdown,
    pitch: u.pitch_30sec,
    one_pager: u.one_pager_available,
    slides: u.slides_available,
    industries: (u.tags.industries ?? []).join(", "),
    roles: (u.tags.roles ?? []).join(", "),
    categories: (u.tags.categories ?? []).join(", "),
    topics: (u.tags.topics ?? []).join(", "),
  });
  const set = <K extends keyof typeof state>(k: K, v: (typeof state)[K]) =>
    setState((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="mt-6">
      <div className="callout">
        <p>
          Use case editor. Minimum for publish: anonymized label, headline metric,
          summary, challenge + approach + outcome markdown, 30-second pitch,
          one-pager PDF uploaded. Slides optional.
        </p>
      </div>

      <EditorSection title="Basics">
        <EditorRow label="Title">
          <input className="input" value={state.title} onChange={(e) => set("title", e.target.value)} />
        </EditorRow>
        <EditorRow label="Anonymized client label" hint="e.g. 'Global insurer' — never the named client unless permission is explicit.">
          <input
            className="input"
            value={state.anonymized_client_label}
            onChange={(e) => set("anonymized_client_label", e.target.value)}
          />
        </EditorRow>
        <EditorRow label="Headline metric" hint="e.g. '83% accuracy', '45% faster', '5 months vs. 18'.">
          <input
            className="input"
            value={state.headline_metric}
            onChange={(e) => set("headline_metric", e.target.value)}
          />
        </EditorRow>
        <EditorRow label="Summary" hint="2–3 sentence narrative summary.">
          <textarea
            className="textarea"
            rows={3}
            value={state.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </EditorRow>
        <EditorRow label="30-second pitch" hint="Memorizable, spoken-aloud version.">
          <textarea
            className="textarea"
            rows={3}
            value={state.pitch}
            onChange={(e) => set("pitch", e.target.value)}
          />
        </EditorRow>
      </EditorSection>

      {/* Story — side-by-side markdown + preview for each of the three sections */}
      <h2 className="section-header mt-8 mb-3">Story</h2>
      {[
        { k: "challenge", label: "The challenge" },
        { k: "approach", label: "The approach" },
        { k: "outcome", label: "The outcome" },
      ].map(({ k, label }) => (
        <div key={k} className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
            {label}
          </div>
          <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-2">
            <div className="border-b border-ink-border md:border-b-0 md:border-r">
              <div className="bg-navy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                Markdown
              </div>
              <textarea
                className="w-full border-0 bg-white p-4 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[12px] leading-[1.55] focus:outline-none"
                style={{ minHeight: 220, resize: "vertical" }}
                value={state[k as "challenge" | "approach" | "outcome"]}
                onChange={(e) => set(k as "challenge" | "approach" | "outcome", e.target.value)}
              />
            </div>
            <div>
              <div className="bg-navy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                Preview
              </div>
              <div className="p-4">
                <Markdown>{state[k as "challenge" | "approach" | "outcome"] || "_Preview appears here._"}</Markdown>
              </div>
            </div>
          </div>
        </div>
      ))}

      <EditorSection title="Form factors">
        <EditorRow label="One-pager PDF" hint="Required for publish. Upload replaces the placeholder PDF preview.">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={state.one_pager}
                onChange={(e) => set("one_pager", e.target.checked)}
              />
              One-pager uploaded
            </label>
            <button className="btn-secondary" type="button">
              Upload PDF
            </button>
          </div>
        </EditorRow>
        <EditorRow label="Slides" hint="Optional. 2–3 slide deck if you have one.">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={state.slides}
                onChange={(e) => set("slides", e.target.checked)}
              />
              Slides uploaded
            </label>
            <button className="btn-secondary" type="button">
              Upload slides
            </button>
          </div>
        </EditorRow>
      </EditorSection>

      <EditorSection title="Tags">
        <EditorRow label="Industries">
          <input className="input" value={state.industries} onChange={(e) => set("industries", e.target.value)} />
        </EditorRow>
        <EditorRow label="Roles">
          <input className="input" value={state.roles} onChange={(e) => set("roles", e.target.value)} />
        </EditorRow>
        <EditorRow label="Opportunity categories">
          <input className="input" value={state.categories} onChange={(e) => set("categories", e.target.value)} />
        </EditorRow>
        <EditorRow label="Topics">
          <input className="input" value={state.topics} onChange={(e) => set("topics", e.target.value)} />
        </EditorRow>
      </EditorSection>

      <SaveBar slug={u.slug} id={u.id} />
    </div>
  );
}
