"use client";

import { useLocalStore } from "./local-store";

export type PracticeMessage = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type PracticeSession = {
  id: string;
  title: string;
  seed_type: "canvas_opportunity" | "module_exercise" | "prompt" | "blank";
  seed_entity_id?: string;
  seed_label?: string; // display label like "Practicing: Claims triage"
  system_prompt?: string;
  messages: PracticeMessage[];
  created_at: string;
  last_message_at: string;
};

export type PracticeState = {
  sessions: PracticeSession[];
};

const KEY = "arcticmind:practice:v1";
const EMPTY: PracticeState = { sessions: [] };

export function usePracticeState() {
  return useLocalStore<PracticeState>(KEY, EMPTY);
}

export function newSessionId() {
  return `ps_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
