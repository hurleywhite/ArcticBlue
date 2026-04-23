"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { marked } from "marked";
import type { Lab } from "@/lib/content/labs";
import { useLabState } from "@/lib/state/lab";
import { MODULES } from "@/lib/content/modules";
import { PROMPTS } from "@/lib/content/prompts";

/*
  The "this month" view for a Lab. Renders inside /lab and also inline on
  the Dashboard. RSVP state persists to localStorage (arcticmind:lab:v1)
  until Supabase wiring lands.
*/

export function LabCurrent({ lab }: { lab: Lab }) {
  const [state, setState] = useLabState();
  const rsvp = state.rsvps[lab.id] ?? "no_response";
  const setRsvp = (next: typeof rsvp) => {
    setState((prev) => ({ ...prev, rsvps: { ...prev.rsvps, [lab.id]: next } }));
  };

  const preWorkModules = useMemo(
    () => (lab.pre_work_module_slugs ?? []).map((slug) => MODULES.find((m) => m.slug === slug)).filter(Boolean),
    [lab]
  );
  const preWorkPrompts = useMemo(
    () => (lab.pre_work_prompt_slugs ?? []).map((slug) => PROMPTS.find((p) => p.slug === slug)).filter(Boolean),
    [lab]
  );

  const preWorkHtml = useMemo(
    () => marked.parse(lab.pre_work_markdown ?? "", { async: false }) as string,
    [lab]
  );
  const agendaHtml = useMemo(
    () => marked.parse(lab.agenda_markdown ?? "", { async: false }) as string,
    [lab]
  );

  return (
    <>
      {/* Session band */}
      <div className="border border-navy">
        <div className="flex flex-col gap-3 bg-navy px-6 py-4 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
              {formatLocalDate(lab.session_datetime)} · {lab.session_duration_minutes} min · Facilitator:{" "}
              {lab.facilitator_name}
            </div>
            <div className="mt-0.5 text-[18px] font-bold leading-[1.2]">{lab.title}</div>
          </div>
          <div className="flex items-center gap-2">
            {lab.meeting_url && (
              <a href={lab.meeting_url} className="border border-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-white hover:text-navy">
                Join →
              </a>
            )}
            <RsvpControls current={rsvp} onChange={setRsvp} />
          </div>
        </div>

        <div className="px-6 py-5 bg-white">
          <h3 className="section-header mb-2">This month's challenge</h3>
          <p className="text-[13px] leading-[1.6]">{lab.challenge_brief}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <h3 className="section-header mb-2">Pre-work</h3>
          <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: preWorkHtml }} />

          {(preWorkModules.length > 0 || preWorkPrompts.length > 0) && (
            <div className="mt-4 border border-ink-border">
              {preWorkModules.map((m, i, arr) => (
                <div
                  key={m!.id}
                  className={`grid grid-cols-[80px_1fr_auto] items-start transition hover:bg-bg-card ${
                    i === arr.length - 1 && preWorkPrompts.length === 0 ? "" : "border-b border-ink-border"
                  }`}
                >
                  <div className="bg-navy px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Module
                  </div>
                  <Link href={`/learning/${m!.slug}`} className="block px-4 py-3">
                    <div className="text-[13px] font-bold text-navy">{m!.title}</div>
                    {m!.subtitle && <div className="mt-0.5 text-[12px] text-ink-muted">{m!.subtitle}</div>}
                  </Link>
                  <div className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                    {m!.estimated_minutes} min
                  </div>
                </div>
              ))}
              {preWorkPrompts.map((p, i, arr) => (
                <div
                  key={p!.id}
                  className={`grid grid-cols-[80px_1fr_auto] items-start transition hover:bg-bg-card ${
                    i === arr.length - 1 ? "" : "border-b border-ink-border"
                  }`}
                >
                  <div className="bg-navy px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Prompt
                  </div>
                  <Link href={`/tools/prompts/${p!.slug}`} className="block px-4 py-3">
                    <div className="text-[13px] font-bold text-navy">{p!.title}</div>
                    <div className="mt-0.5 text-[12px] text-ink-muted">{p!.description}</div>
                  </Link>
                  <div className="px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                    Try →
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="section-header mt-8 mb-2">Agenda</h3>
          <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: agendaHtml }} />

          {lab.tools_featured.length > 0 && (
            <>
              <h3 className="section-header mt-8 mb-2">Tools we'll use in the room</h3>
              <table className="doc-table">
                <thead>
                  <tr>
                    <th style={{ width: "28%" }}>Tool</th>
                    <th>Why we picked it</th>
                  </tr>
                </thead>
                <tbody>
                  {lab.tools_featured.map((t) => (
                    <tr key={t.name}>
                      <td>
                        <strong>{t.name}</strong>
                        {t.url && (
                          <div className="mt-0.5">
                            <a
                              href={t.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                            >
                              Open →
                            </a>
                          </div>
                        )}
                      </td>
                      <td>{t.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <aside>
          <h3 className="section-header mb-2">Session details</h3>
          <table className="doc-table">
            <tbody>
              <tr>
                <td><strong>When</strong></td>
                <td>{formatLocalDate(lab.session_datetime)}</td>
              </tr>
              <tr>
                <td><strong>Duration</strong></td>
                <td>{lab.session_duration_minutes} minutes</td>
              </tr>
              <tr>
                <td><strong>Facilitator</strong></td>
                <td>
                  {lab.facilitator_name}
                  <div className="mt-1 text-[11px] text-ink-muted">{lab.facilitator_bio}</div>
                </td>
              </tr>
              <tr>
                <td><strong>Capacity</strong></td>
                <td>Up to 20 teammates</td>
              </tr>
            </tbody>
          </table>

          <h3 className="section-header mt-6 mb-2">Your RSVP</h3>
          <div className="card-surface">
            <div className="text-[11px] text-ink-muted">
              Current:{" "}
              <strong className="text-navy">
                {rsvp === "no_response" ? "No response yet" : labelForRsvp(rsvp)}
              </strong>
            </div>
            <div className="mt-2">
              <RsvpControls current={rsvp} onChange={setRsvp} variant="stacked" />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function RsvpControls({
  current,
  onChange,
  variant = "inline",
}: {
  current: "going" | "maybe" | "declined" | "no_response";
  onChange: (v: "going" | "maybe" | "declined") => void;
  variant?: "inline" | "stacked";
}) {
  const options: Array<{ v: "going" | "maybe" | "declined"; label: string }> = [
    { v: "going", label: "I'm in" },
    { v: "maybe", label: "Maybe" },
    { v: "declined", label: "Can't make it" },
  ];
  return (
    <div className={variant === "stacked" ? "flex flex-col gap-1.5" : "flex items-center gap-1.5"}>
      {options.map((o) => {
        const active = current === o.v;
        const cls = active
          ? "border border-white bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy"
          : variant === "stacked"
            ? "border border-ink-border bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:border-navy"
            : "border border-white/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-white/10";
        return (
          <button key={o.v} onClick={() => onChange(o.v)} className={cls}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function labelForRsvp(r: "going" | "maybe" | "declined"): string {
  return r === "going" ? "Going" : r === "maybe" ? "Maybe" : "Can't make it";
}

function formatLocalDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
}
