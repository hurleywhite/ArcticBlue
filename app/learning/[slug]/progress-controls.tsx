"use client";

import { useEffect } from "react";
import { useProgressState } from "@/lib/state/progress";

export function ModuleProgressControls({ moduleId }: { moduleId: string }) {
  const [state, setState] = useProgressState();
  const entry = state.modules[moduleId];
  const status = entry?.state ?? "not_started";

  // Mark "in_progress" on first render of any module detail page.
  useEffect(() => {
    if (!entry) {
      const now = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: { state: "in_progress", first_opened_at: now, last_opened_at: now },
        },
      }));
    } else {
      setState((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: { ...prev.modules[moduleId], last_opened_at: new Date().toISOString() },
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const markComplete = () => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleId]: {
          ...(prev.modules[moduleId] ?? {}),
          state: "completed",
          completed_at: now,
          last_opened_at: now,
        },
      },
    }));
  };

  const markIncomplete = () => {
    setState((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleId]: { ...prev.modules[moduleId], state: "in_progress", completed_at: undefined },
      },
    }));
  };

  return (
    <div className="border border-ink-border bg-bg-card px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
        Progress
      </div>
      <div className="mt-1 text-[12px]">
        {status === "completed" ? (
          <span className="font-bold text-navy">Completed</span>
        ) : status === "in_progress" ? (
          <span>In progress</span>
        ) : (
          <span className="text-ink-muted">Not started</span>
        )}
      </div>
      <div className="mt-3">
        {status === "completed" ? (
          <button onClick={markIncomplete} className="btn-secondary w-full">
            Mark incomplete
          </button>
        ) : (
          <button onClick={markComplete} className="btn-primary w-full">
            Mark complete
          </button>
        )}
      </div>
    </div>
  );
}
