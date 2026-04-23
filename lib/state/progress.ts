"use client";

import { useLocalStore } from "./local-store";

export type ModuleState = "not_started" | "in_progress" | "completed";

export type ProgressState = {
  modules: Record<
    string,
    {
      state: ModuleState;
      last_opened_at?: string;
      completed_at?: string;
      progress_seconds?: number;
    }
  >;
};

const KEY = "arcticmind:progress:v1";
const EMPTY: ProgressState = { modules: {} };

export function useProgressState() {
  return useLocalStore<ProgressState>(KEY, EMPTY);
}
