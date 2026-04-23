"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sessionKey, useStarState } from "@/lib/state/stars";
import { useProgressState } from "@/lib/state/progress";
import { usePracticeState } from "@/lib/state/practice";
import { useLabState } from "@/lib/state/lab";
import { getCurrentLab, getPastLabs, formatMonth } from "@/lib/content/labs";
import { MODULES } from "@/lib/content/modules";
import { PROMPTS } from "@/lib/content/prompts";
import { recommend, type RecommendationItem } from "@/lib/personalization/recommend";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

/*
  Dashboard home — the view returning users land on. The hero is this
  month's Lab. Canvas / Learning / Practice are secondary support
  surfaces below it. That ordering matters: the buyer paid for a
  monthly live session, and everything the app shows should remind
  them of it.
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
  const [labState] = useLabState();

  const currentLab = getCurrentLab();
  const pastLabs = getPastLabs();

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
    return recommend(starState.lastRole!, starState.lastIndustry!, canvasStars, completed);
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

  const rsvp = currentLab ? labState.rsvps[currentLab.id] ?? "no_response" : "no_response";
  const preWorkModules = useMemo(() => {
    if (!currentLab) return [];
    return (currentLab.pre_work_module_slugs ?? [])
      .map((slug) => MODULES.find((m) => m.slug === slug))
      .filter(Boolean);
  }, [currentLab]);
  const preWorkPrompts = useMemo(() => {
    if (!currentLab) return [];
    return (currentLab.pre_work_prompt_slugs ?? [])
      .map((slug) => PROMPTS.find((p) => p.slug === slug))
      .filter(Boolean);
  }, [currentLab]);

  const lastLab = pastLabs[0];

  return (
    <>
      {/* HERO — This month's Lab */}
      {currentLab ? (
        <>
          <h2 className="section-header mt-8 mb-3">
            This month's Lab · {formatMonth(currentLab.month)}
          </h2>
          <div className="border border-navy">
            <div className="flex flex-col gap-3 bg-navy px-6 py-4 text-white md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
                  {new Date(currentLab.session_datetime).toLocaleString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                    hour: "numeric", minute: "2-digit",
                  })}{" "}
                  · {currentLab.session_duration_minutes} min · Facilitator: {currentLab.facilitator_name}
                </div>
                <div className="mt-0.5 text-[18px] font-bold leading-[1.2]">
                  {currentLab.title}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RsvpBadge rsvp={rsvp} />
                <Link
                  href="/lab"
                  className="border border-white bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:bg-ice"
                >
                  Open Lab →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-0 bg-white md:grid-cols-[1fr_280px]">
              <div className="border-b border-ink-border px-6 py-5 md:border-b-0 md:border-r">
                <h3 className="section-header mb-2">The challenge</h3>
                <p className="text-[13px] leading-[1.6]">{currentLab.challenge_brief}</p>
              </div>
              <div className="px-5 py-4">
                <h3 className="section-header mb-2">Pre-work</h3>
                {preWorkModules.length === 0 && preWorkPrompts.length === 0 ? (
                  <p className="text-[12px] text-ink-muted">
                    No specific pre-work this month. Open the Lab for the full brief.
                  </p>
                ) : (
                  <ul className="m-0 list-none space-y-2 p-0">
                    {preWorkModules.map((m) => (
                      <li key={m!.id}>
                        <Link
                          href={`/learning/${m!.slug}`}
                          className="block border border-ink-border bg-bg-card px-3 py-2 transition hover:border-navy"
                        >
                          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                            Module · {TYPE_LABEL[m!.module_type]} · {m!.estimated_minutes} min
                          </div>
                          <div className="mt-0.5 text-[12px] font-bold">{m!.title}</div>
                        </Link>
                      </li>
                    ))}
                    {preWorkPrompts.map((p) => (
                      <li key={p!.id}>
                        <Link
                          href={`/tools/prompts/${p!.slug}`}
                          className="block border border-ink-border bg-bg-card px-3 py-2 transition hover:border-navy"
                        >
                          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                            Prompt
                          </div>
                          <div className="mt-0.5 text-[12px] font-bold">{p!.title}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {lastLab && (
            <div className="mt-4 border border-ink-border bg-bg-card px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    Last session — {formatMonth(lastLab.month)}
                  </div>
                  <div className="mt-0.5 text-[14px] font-bold">{lastLab.title}</div>
                  <p className="mt-1 text-[12px] text-ink-muted">
                    {lastLab.artifacts.length} shared artifact{lastLab.artifacts.length === 1 ? "" : "s"}
                    {lastLab.attendance && (
                      <> · {lastLab.attendance.attended} of {lastLab.attendance.invited} attended</>
                    )}
                  </p>
                </div>
                <Link
                  href={`/lab/${lastLab.month.slice(0, 7)}`}
                  className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                >
                  Open recap →
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="callout mt-8">
          <p>
            No Lab scheduled yet. Labs are the monthly live working sessions — up to 20
            teammates, 90 minutes, real work. Your facilitator will schedule the next one
            and it'll land here.
          </p>
        </div>
      )}

      {/* Between-session homework */}
      {inProgressModules.length > 0 && (
        <>
          <h2 className="section-header mt-10 mb-3">Continue learning (between sessions)</h2>
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
                    <Link href={`/learning/${m!.slug}`} className="font-bold text-navy hover:underline">
                      {m!.title}
                    </Link>
                  </td>
                  <td style={{ width: "22%" }} className="text-ink-muted">
                    Last opened {last ? new Date(last).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ width: "10%" }}>
                    <Link href={`/learning/${m!.slug}`} className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline">
                      Resume →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {recentPractice.length > 0 && (
        <>
          <h2 className="section-header mt-10 mb-3">Recent Practice sessions</h2>
          <table className="doc-table">
            <tbody>
              {recentPractice.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href="/tools/practice" className="font-bold text-navy hover:underline">
                      {s.title}
                    </Link>
                    {s.seed_label && <div className="mt-0.5 text-ink-muted">Practicing: {s.seed_label}</div>}
                  </td>
                  <td style={{ width: "18%" }} className="text-ink-muted">{s.messages.length} messages</td>
                  <td style={{ width: "16%" }} className="text-ink-muted">{new Date(s.last_message_at).toLocaleDateString()}</td>
                  <td style={{ width: "10%" }}>
                    <Link href="/tools/practice" className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline">
                      Resume →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Between-session tools — Canvas, Analyzer, etc. — demoted to support */}
      <h2 className="section-header mt-10 mb-3">Between-session tools</h2>
      <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-5">
        <SupportCell
          kicker="Mirror"
          title="A company's opportunity field"
          body="Domain in → orbital map of 8 AI opportunities, sized by impact, positioned by readiness."
          href="/mirror"
        />
        <SupportCell
          kicker="Canvas"
          title="Role-specific opportunities"
          body={hasCanvas
            ? `${canvasStars.length} starred · ${starState.lastRole} in ${starState.lastIndustry}`
            : "Pick a role and industry to map opportunities you can bring to the next Lab."}
          href="/canvas"
        />
        <SupportCell
          kicker="Analyzer"
          title="Inspect a company's AI posture"
          body="Domain in → firmographics, tech stack, AI adoption signals, recent news."
          href="/analyzer"
        />
        <SupportCell
          kicker="Practice"
          title="Try a workflow before the session"
          body="Seeded chat sandbox. Bring output to the Lab or share as an artifact."
          href="/tools/practice"
        />
        <SupportCell
          kicker="Use Cases"
          title="How ArcticBlue clients did it"
          body="Seven anonymized case studies — story, one-pager, slides."
          href="/use-cases"
          last
        />
      </div>

      {/* Recommendations — only if Canvas stars exist */}
      {recs && recs.topSix.length > 0 && (
        <>
          <h2 className="section-header mt-10 mb-3">Recommended for your next session</h2>
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
        </>
      )}
    </>
  );
}

function RsvpBadge({ rsvp }: { rsvp: "going" | "maybe" | "declined" | "no_response" }) {
  if (rsvp === "going") {
    return (
      <span className="border border-white bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        You're in
      </span>
    );
  }
  if (rsvp === "maybe") {
    return (
      <span className="border border-white/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
        Maybe
      </span>
    );
  }
  if (rsvp === "declined") {
    return (
      <span className="border border-white/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
        Declined
      </span>
    );
  }
  return (
    <span className="border border-white/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">
      Not yet RSVP'd
    </span>
  );
}

function SupportCell({
  kicker,
  title,
  body,
  href,
  last,
}: {
  kicker: string;
  title: string;
  body: string;
  href: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block bg-bg-card px-5 py-4 transition hover:bg-ice ${
        last ? "" : "md:border-r md:border-ink-border"
      } border-b border-ink-border md:border-b-0`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">{kicker}</div>
      <div className="mt-1 text-[14px] font-bold text-ink">{title}</div>
      <p className="mt-1 text-[12px] leading-[1.5] text-ink">{body}</p>
      <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
        Open →
      </div>
    </Link>
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
    item.kind === "module" ? item.description : item.kind === "use_case" ? item.summary : item.description;
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
          starredOpportunities: starredOps.map((o) => ({ id: o.id, title: o.title, category: o.category })),
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
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">{kicker}</div>
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
