"use client";

import { useLocalStore } from "./local-store";

/*
  Canvas star state. Stored per role__industry key so a user can have
  multiple canvases. Also tracks what role+industry was most recently
  opened — that's what drives dashboard recommendations.
*/

export type StarState = {
  // opportunity ids, by role__industry key
  stars: Record<string, string[]>;
  // most recent session
  lastRole?: string;
  lastIndustry?: string;
  lastOpenedAt?: string;
};

const KEY = "arcticmind:stars:v1";
const EMPTY: StarState = { stars: {} };

export function useStarState() {
  return useLocalStore<StarState>(KEY, EMPTY);
}

export function sessionKey(role: string, industry: string) {
  return `${role}__${industry}`;
}
