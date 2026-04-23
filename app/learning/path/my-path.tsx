"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStarState, sessionKey } from "@/lib/state/stars";
import { useProgressState } from "@/lib/state/progress";
import { recommend } from "@/lib/personalization/recommend";
import { MODULES } from "@/lib/content/modules";

const TYPE_LABEL: Record<string, string> = {
  reading: "Reading",
  video: "Video",
  exercise: "Exercise",
  live_workshop: "Live workshop",
  curated_external: "Curated external",
};

export function MyPath() {
  const [starState] = useStarState();
  const [progressState] = useProgressState();

  const hasStars =
    starState.lastRole &&
    starState.lastIndustry &&
    (starState.stars[sessionKey(starState.lastRole, starState.lastIndustry)] ?? []).length > 0;

  const recommended = useMemo(() => {
    if (!starState.lastRole || !starState.lastIndustry) return [];
    const starIds =
      starState.stars[sessionKey(starState.lastRole, starState.lastIndustry)] ?? [];
    const completed = new Set(
      Object.entries(progressState.modules)
        .filter(([, v]) => v.state === "completed")
        .map(([id]) => id)
    );
    const r = recommend(
      starState.lastRole,
      starState.lastIndustry,
      starIds,
      completed
    );
    return r.modules;
  }, [starState, progressState]);

  const inProgress = Object.entries(progressState.modules)
    .filter(([, v]) => v.state === "in_progress")
    .map(([id]) => MODULES.find((m) => m.id === id))
    .filter(Boolean) as typeof MODULES;

  if (!hasStars) {
    return (
      <div className="callout mt-6">
        <p>
          Star a few opportunities on the <Link href="/canvas" className="underline">Canvas</Link> and
          your path appears here — modules matched against what you starred,
          what your role is, and what industry you operate in.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="callout mt-6">
        <p>
          Ranked from your <strong>{starState.lastRole}</strong> Canvas for{" "}
          <strong>{starState.lastIndustry}</strong>. Personalization uses direct
          tag matches on your starred opportunities plus role and industry. Phase
          1F re-ranks with a narrative explanation.
        </p>
      </div>

      {inProgress.length > 0 && (
        <>
          <h2 className="section-header mt-10 mb-3">Continue</h2>
          <table className="doc-table">
            <tbody>
              {inProgress.map((m) => (
                <tr key={m.id}>
                  <td style={{ width: "12%" }}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                      {TYPE_LABEL[m.module_type]}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/learning/${m.slug}`}
                      className="font-bold text-navy hover:underline"
                    >
                      {m.title}
                    </Link>
                  </td>
                  <td style={{ width: "10%" }} className="text-ink-muted">
                    {m.estimated_minutes} min
                  </td>
                  <td style={{ width: "10%" }}>
                    <Link
                      href={`/learning/${m.slug}`}
                      className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                    >
                      Resume →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2 className="section-header mt-10 mb-3">Recommended from your stars</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "12%" }}>Type</th>
            <th>Module</th>
            <th style={{ width: "14%" }}>Match score</th>
            <th style={{ width: "10%" }}>Length</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          {recommended.map((m) => (
            <tr key={m.id}>
              <td>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  {TYPE_LABEL[m.module_type]}
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
              <td>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-14 border border-ink-border">
                    <div
                      className="h-full bg-navy"
                      style={{ width: `${Math.min(100, m.score * 15)}%` }}
                    />
                  </div>
                  <span className="font-bold text-navy">{m.score.toFixed(1)}</span>
                </div>
              </td>
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
        </tbody>
      </table>
    </>
  );
}
