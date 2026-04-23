"use client";

/*
  Accounts store (localStorage, Supabase later).

  The seeded ACCOUNTS in lib/content/accounts.ts act as the starting
  set. This store lets the user add new accounts, edit notes and
  stage, log activity entries, and delete. Stored values *overlay*
  the seed — a user edit on a seeded account persists the edit
  without mutating the shipped content.

  Shape:
    overlays[id] = partial Account fields that win over the seed
    deleted: set of seed ids the user has removed
    custom: Accounts created in-app (not in the seed)
*/

import { useLocalStore } from "./local-store";
import type { Account, AccountStage } from "@/lib/content/accounts";
import { ACCOUNTS as SEED_ACCOUNTS } from "@/lib/content/accounts";

export type ActivityEntry = {
  id: string;
  account_id: string;
  kind: "note" | "meeting" | "email" | "stage_change" | "brief_generated" | "followup_drafted";
  body: string;
  created_at: string; // ISO
};

export type AccountOverlay = Partial<Omit<Account, "id">> & { id: string };

export type AccountsStoreState = {
  overlays: Record<string, Partial<Account>>;
  deleted: string[]; // seed ids user hid
  custom: Account[];
  activity: ActivityEntry[];
};

const KEY = "arcticmind:accounts:v1";
const EMPTY: AccountsStoreState = {
  overlays: {},
  deleted: [],
  custom: [],
  activity: [],
};

export function useAccountsStore() {
  return useLocalStore<AccountsStoreState>(KEY, EMPTY);
}

export function newAccountId() {
  return `acct_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newActivityId() {
  return `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/*
  Merge seed + overlays + custom − deleted into a single live account list.
  Pure so it can be called from components without re-subscribing.
*/
export function resolveAccounts(state: AccountsStoreState): Account[] {
  const seedById = new Map(SEED_ACCOUNTS.map((a) => [a.id, a]));
  const live: Account[] = [];
  for (const [id, seed] of seedById) {
    if (state.deleted.includes(id)) continue;
    const overlay = state.overlays[id];
    live.push(overlay ? { ...seed, ...overlay } : seed);
  }
  for (const custom of state.custom) {
    if (state.deleted.includes(custom.id)) continue;
    live.push(custom);
  }
  // Sort by next-meeting time (upcoming first), then updated_at desc
  return live.sort((a, b) => {
    const aWhen = a.next_meeting?.when ? new Date(a.next_meeting.when).getTime() : Infinity;
    const bWhen = b.next_meeting?.when ? new Date(b.next_meeting.when).getTime() : Infinity;
    if (aWhen !== bWhen) return aWhen - bWhen;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export function resolveAccountById(
  state: AccountsStoreState,
  id: string
): Account | undefined {
  return resolveAccounts(state).find((a) => a.id === id);
}

export function emptyAccountDraft(): Account {
  const now = new Date().toISOString();
  return {
    id: newAccountId(),
    company_name: "",
    domain: "",
    industry: "",
    size: "",
    stage: "cold" as AccountStage,
    poc_name: "",
    poc_title: "",
    poc_email: "",
    notes: "",
    updated_at: now,
  };
}
