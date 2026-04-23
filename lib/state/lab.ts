"use client";

import { useLocalStore } from "./local-store";

export type LabRsvp = "going" | "maybe" | "declined" | "no_response";

export type UserLabArtifact = {
  id: string;
  lab_id: string;
  title: string;
  content_markdown: string;
  shared_to_team: boolean;
  created_at: string;
};

export type LabState = {
  rsvps: Record<string, LabRsvp>; // keyed by lab_id
  artifacts: UserLabArtifact[];
};

const KEY = "arcticmind:lab:v1";
const EMPTY: LabState = { rsvps: {}, artifacts: [] };

export function useLabState() {
  return useLocalStore<LabState>(KEY, EMPTY);
}

export function newArtifactId() {
  return `la_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
