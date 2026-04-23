"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sessionKey, useStarState } from "@/lib/state/stars";
import { useProgressState } from "@/lib/state/progress";
import { usePracticeState } from "@/lib/state/practice";
import { recommend, type RecommendationItem } from "@/lib/personalization/recommend";
import { MODULES } from "@/lib/content/modules";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

/*
  Dashboard home — the view returning users land on. Pulls everything
  from localStorage via hooks; renders a personalized mix of modules,
  use cases, and prompts based on Canvas stars plus the learner's
  role/industry.
*/

const TYPE_LABEL: Record<string, string> = {
  reading: "Reading",
  video: "Video",
  exercise: "Exercise",
  live_workshop: "Live workshop",
  curated_external: "Curated external",
};

export function DashboardHome() {
  const [starState] = useStarState();
  const [progressState] = useProgressState();
  const [practiceState] = usePracticeState();

  const hasCanvas = !!(starState.lastRole && starState.lastIndustry);
  const canvasStars = hasCanvas
    ? starState.stars[sessionKey(starState.lastRole!, starState.lastIndustry!)] ?? []
    : [];
  const starredOps = useMemo(() => {
    const all = Object.values(DEMO_DATA).flat();
    return all.filter((o) => canvasStars.includes(o.id));
  }, [canvasStars]);

  const recs = useMemo(() => {
    if (!hasCanvas || canvasStars.length === 0) return null;
    const completed = new Set(
      Object.entries(progressState.modules)
        .filter(([, v]) => v.state === "completed")
        .map(([id]) => id)
    );
    return recommend(
      starState.lastRole!,
      starState.lastIndustry!,
      canvasStars,
      completed
    );
  }, [hasCanvas, canvasStars, starState, progressState]);

  const inProgressModules = Object.entries(progressState.modules)
    .filter(([, v]) => v.state === "in_progress")
    .map(([id, v]) => ({ m: MODULES.find((mm) => mm.id === id), last: v.last_opened_at }))
    .filter((r) => !!r.m)
    .sort((a, b) => {
      const aT = a.last ? new Date(a.last).getTime() : 0;
      const bT = b.last ? new Date(b.last).getTime() : 0;
      return bT - aT;
    })
    .slice(0, 3);

  const recentPractice = [...practiceState.sessions]
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
    .slice(0, 3);

  return (
    <>
      {/* Your Canvas */}
      <h2 className="section-header mt-8 mb-3">Your Canvas</h2>
      {hasCanvas ? (
        <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-[1fr_auto]">
          <div className="px-5 py-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {starState.lastRole} · {starState.lastIndustry}
            </div>
            <div className="mt-1 text-[16px] font-bold text-navy">
              {canvasStars.length === 0
                ? "Canvas generated — no opportunities starred yet."
                : `${canvasStars.length} opportunities starred.`}
            </div>
            {starredOps.length > 0 && (
              <ul className="mt-2 grid grid-cols-1 gap-0.5 text-[12px] md:grid-cols-2">
                {starredOps.slice(0, 6).map((o) => (
                  <li key={o.id}>
                    <strong>·</strong> {o.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-2 border-t border-ink-border px-5 py-4 md:border-l md:border-t-0">
            <Link href="/canvas" className="btn-secondary text-center">
              Open Canvas
            </Link>
            {canvasStars.length >= 3 && (
              <Link href="/canvas/next" className="btn-primary text-center">
                See what's next →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="callout">
          <p>
            Start by generating your first Canvas. Pick a role and an industry —
            you'll get eight opportunities across three lenses.
          </p>
          <div className="mt-3">
            <Link href="/canvas" className="btn-primary inline-block">
              Build your first Canvas →
            </Link>
          </div>
        </div>
      )}

      {/* Your stars — mini quadrant peek */}
      {starredOps.length > 0 && (
        <>
          <h2 className="section-header mt-10 mb-3">Your starred opportunities</h2>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ width: "14%" }}>Category</th>
                <th>Opportunity</th>
                <th style={{ width: "22%" }}>First experiment</th>
                <th style={{ width: "12%" }}></th>
              </tr>
            </thead>
            <tbody>
              {starredOps.map((op) => (
                <tr key={op.id}>
                  <td>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                      {op.category}
                    </span>
                  </td>
                  <td>
                    <strong>{op.title}</strong>
                    <div className="mt-0.5 text-ink-muted">{op.tagline}</div>
                  </td>
                  <td className="text-[11px] italic text-ink">{op.experiment}</td>
                  <td>
                    <Link
                      href={`/tools/practice?seed=canvas&id=${op.id}`}
                      className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                    >
                      Practice →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Recommended for you */}
      <h2 className="section-header mt-10 mb-3">Recommended for you</h2>
      {recs && recs.topSix.length > 0 ? (
        <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-3">
          {recs.topSix.map((item, idx) => (
            <RecommendCell
              key={`${item.kind}-${item.id}`}
              item={item}
              isLast={(idx + 1) % 3 === 0}
              userRole={starState.lastRole!}
              userIndustry={starState.lastIndustry!}
              starredOps={starredOps}
            />
          ))}
        </div>
      ) : (
        <div className="callout text-[13px]">
          Star opportunities on the Canvas and personalized recommendations appear
          here — a mix of learning modules, use cases, and practice prompts.
        </div>
      )}

      {/* Continue learning */}
      {inProgressModules.length > 0 && (
        <>
          <h2 className="section-header mt-10 mb-3">Continue learning</h2>
          <table className="doc-table">
            <tbody>
              {inProgressModules.map(({ m, last }) => (
                <tr key={m!.id}>
                  <td style={{ width: "12%" }}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                      {TYPE_LABEL[m!.module_type]}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/learning/${m!.slug}`}
                      className="font-bold text-navy hover:underline"
                    >
                      {m!.title}
                    </Link>
                  </td>
                  <td style={{ width: "22%" }} className="text-ink-muted">
                    Last opened {last ? new Date(last).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ width: "10%" }}>
                    <Link
                      href={`/learning/${m!.slug}`}
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

      {/* Recent practice */}
      {recentPractice.length > 0 && (
        <>
          <h2 className="section-header mt-10 mb-3">Recent in Practice</h2>
          <table className="doc-table">
            <tbody>
              {recentPractice.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link
                      href="/tools/practice"
                      className="font-bold text-navy hover:underline"
                    >
                      {s.title}
                    </Link>
                    {s.seed_label && (
                      <div className="mt-0.5 text-ink-muted">Practicing: {s.seed_label}</div>
                    )}
                  </td>
                  <td style={{ width: "18%" }} className="text-ink-muted">
                    {s.messages.length} messages
                  </td>
                  <td style={{ width: "16%" }} className="text-ink-muted">
                    {new Date(s.last_message_at).toLocaleDateString()}
                  </td>
                  <td style={{ width: "10%" }}>
                    <Link
                      href="/tools/practice"
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

      {/* New from ArcticBlue — most recently published */}
      <h2 className="section-header mt-10 mb-3">New from ArcticBlue</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "12%" }}>Type</th>
            <th>Title</th>
            <th style={{ width: "16%" }}>Added</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          {[...MODULES]
            .sort(
              (a, b) =>
                new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
            )
            .slice(0, 4)
            .map((m) => (
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
                </td>
                <td className="text-ink-muted">
                  {new Date(m.published_at).toLocaleDateString()}
                </td>
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

function RecommendCell({
  item,
  isLast,
  userRole,
  userIndustry,
  starredOps,
}: {
  item: RecommendationItem;
  isLast: boolean;
  userRole: string;
  userIndustry: string;
  starredOps: Array<{ id: string; title: string; category: string }>;
}) {
  const kindLabel =
    item.kind === "module" ? "Learning" : item.kind === "use_case" ? "Use Case" : "Prompt";
  const kicker =
    item.kind === "module"
      ? `${kindLabel} · ${TYPE_LABEL[item.module_type]}`
      : item.kind === "use_case"
        ? `${kindLabel} · ${item.anonymized_client_label}`
        : `${kindLabel}`;
  const body =
    item.kind === "module"
      ? item.description
      : item.kind === "use_case"
        ? item.summary
        : item.description;
  const href =
    item.kind === "module"
      ? `/learning/${item.slug}`
      : item.kind === "use_case"
        ? `/use-cases/${item.slug}`
        : `/tools/prompts/${item.slug}`;

  const [justification, setJustification] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [modelLabel, setModelLabel] = useState<string | null>(null);

  const fetchJustification = async () => {
    if (justification || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/recommend/justify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userRole,
          userIndustry,
          starredOpportunities: starredOps.map((o) => ({
            id: o.id,
            title: o.title,
            category: o.category,
          })),
          item: {
            kind: item.kind,
            title: item.title,
            description: body,
            tags: (item as { tags?: unknown }).tags ?? {},
          },
        }),
      });
      const data = await res.json();
      setJustification(data.text);
      setModelLabel(data.modelLabel ?? (data.model === "mock" ? "Mock" : data.model));
    } catch {
      setJustification("[Justification unavailable.]");
    } finally {
      setPending(false);
    }
  };

  return (
    <Link
      href={href}
      onMouseEnter={fetchJustification}
      onFocus={fetchJustification}
      className={`group block bg-bg-card px-5 py-4 transition hover:bg-ice ${
        isLast ? "" : "md:border-r md:border-ink-border"
      } border-b border-ink-border md:border-b-0`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        {kicker}
      </div>
      <div className="mt-1 text-[14px] font-bold text-ink">{item.title}</div>
      <p className="mt-1 line-clamp-3 text-[12px] leading-[1.5] text-ink">{body}</p>
      {justification && (
        <div className="mt-2 border-l-2 border-navy bg-white/60 pl-2 text-[11px] italic leading-[1.4] text-ink">
          {justification}
          {modelLabel && (
            <span className="mt-0.5 block text-[9px] font-bold not-italic uppercase tracking-[0.12em] text-ink-muted">
              {modelLabel}
            </span>
          )}
        </div>
      )}
      {pending && !justification && (
        <div className="mt-2 text-[11px] italic text-ink-muted">Thinking…</div>
      )}
      <div className="mt-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
        <span>Open →</span>
        <span className="text-ink-muted">match {item.score.toFixed(1)}</span>
      </div>
    </Link>
  );
}
