"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sessionKey, useStarState } from "@/lib/state/stars";
import { useProgressState } from "@/lib/state/progress";
import { recommend } from "@/lib/personalization/recommend";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

type Tab = "learning" | "use_cases" | "practice";

export function NextSteps() {
  const [starState] = useStarState();
  const [progressState] = useProgressState();
  const [tab, setTab] = useState<Tab>("learning");

  const recs = useMemo(() => {
    if (!starState.lastRole || !starState.lastIndustry) return null;
    const starIds =
      starState.stars[sessionKey(starState.lastRole, starState.lastIndustry)] ?? [];
    const completed = new Set(
      Object.entries(progressState.modules)
        .filter(([, v]) => v.state === "completed")
        .map(([id]) => id)
    );
    return recommend(starState.lastRole, starState.lastIndustry, starIds, completed);
  }, [starState, progressState]);

  const starredOps = useMemo(() => {
    if (!starState.lastRole || !starState.lastIndustry) return [];
    const ids =
      starState.stars[sessionKey(starState.lastRole, starState.lastIndustry)] ?? [];
    const all = Object.values(DEMO_DATA).flat();
    return all.filter((o) => ids.includes(o.id));
  }, [starState]);

  if (!recs || starredOps.length === 0) {
    return (
      <div className="callout mt-6">
        <p>
          Star at least one opportunity on the{" "}
          <Link href="/canvas" className="underline">
            Canvas
          </Link>{" "}
          first. This page surfaces the learning modules, use cases, and practice
          prompts that match what you starred.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 border border-ink-border">
        <div className="border-b border-ink-border bg-bg-card px-5 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            You starred {starredOps.length} opportunities as {starState.lastRole} in{" "}
            {starState.lastIndustry}
          </div>
          <ul className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
            {starredOps.map((op) => (
              <li key={op.id} className="text-[12px]">
                <strong>{op.title}</strong>{" "}
                <span className="text-ink-muted">· {op.category}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex border-b border-ink-border">
          <TabBtn active={tab === "learning"} onClick={() => setTab("learning")}>
            Learning ({recs.modules.length})
          </TabBtn>
          <TabBtn active={tab === "use_cases"} onClick={() => setTab("use_cases")}>
            Use Cases ({recs.useCases.length})
          </TabBtn>
          <TabBtn active={tab === "practice"} onClick={() => setTab("practice")}>
            Practice ({recs.prompts.length} prompts + {starredOps.length} from Canvas)
          </TabBtn>
        </div>

        {tab === "learning" && (
          <table className="doc-table m-0 border-0">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Type</th>
                <th>Module</th>
                <th style={{ width: "14%" }}>Match</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {recs.modules.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                      {m.module_type}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/learning/${m.slug}`}
                      className="font-bold text-navy hover:underline"
                    >
                      {m.title}
                    </Link>
                    <div className="mt-0.5 text-ink-muted">{m.description}</div>
                  </td>
                  <td>
                    <ScoreBar score={m.score} />
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
        )}

        {tab === "use_cases" && (
          <table className="doc-table m-0 border-0">
            <thead>
              <tr>
                <th style={{ width: "18%" }}>Client</th>
                <th>Case</th>
                <th style={{ width: "14%" }}>Match</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {recs.useCases.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.anonymized_client_label}</strong>
                    <div className="mt-0.5 text-ink-muted">{u.headline_metric}</div>
                  </td>
                  <td>
                    <Link
                      href={`/use-cases/${u.slug}`}
                      className="font-bold text-navy hover:underline"
                    >
                      {u.title}
                    </Link>
                    <div className="mt-0.5 text-ink-muted">{u.summary}</div>
                  </td>
                  <td>
                    <ScoreBar score={u.score} />
                  </td>
                  <td>
                    <Link
                      href={`/use-cases/${u.slug}`}
                      className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "practice" && (
          <>
            <div className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-navy border-b border-ink-border bg-bg-card">
              Practice directly from a starred opportunity
            </div>
            <table className="doc-table m-0 border-0">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th style={{ width: "14%" }}>Category</th>
                  <th style={{ width: "14%" }}></th>
                </tr>
              </thead>
              <tbody>
                {starredOps.map((op) => (
                  <tr key={op.id}>
                    <td>
                      <strong>{op.title}</strong>
                      <div className="mt-0.5 text-ink-muted">{op.tagline}</div>
                    </td>
                    <td>{op.category}</td>
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
            <div className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-navy border-t border-b border-ink-border bg-bg-card">
              Curated prompts matched to your stars
            </div>
            <table className="doc-table m-0 border-0">
              <thead>
                <tr>
                  <th>Prompt</th>
                  <th style={{ width: "14%" }}>Match</th>
                  <th style={{ width: "10%" }}></th>
                </tr>
              </thead>
              <tbody>
                {recs.prompts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link
                        href={`/tools/prompts/${p.slug}`}
                        className="font-bold text-navy hover:underline"
                      >
                        {p.title}
                      </Link>
                      <div className="mt-0.5 text-ink-muted">{p.description}</div>
                    </td>
                    <td>
                      <ScoreBar score={p.score} />
                    </td>
                    <td>
                      <Link
                        href={`/tools/prompts/${p.slug}`}
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
        )}
      </div>
    </>
  );
}

function TabBtn({
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
          ? "border-b-2 border-navy bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-navy -mb-px"
          : "bg-bg-card px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted hover:text-navy"
      }
    >
      {children}
    </button>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 border border-ink-border">
        <div
          className="h-full bg-navy"
          style={{ width: `${Math.min(100, score * 15)}%` }}
        />
      </div>
      <span className="font-bold text-navy">{score.toFixed(1)}</span>
    </div>
  );
}
