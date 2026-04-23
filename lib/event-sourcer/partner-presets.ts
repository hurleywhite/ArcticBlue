/*
  Partner presets — one-click form fills for the operators' common
  partners. Editable after selection. Add new partners here as the
  partner team expands.

  Keep the default regional scope, halo cap, etc. soft — operators
  usually tweak session-size / halo per run.
*/

export type PartnerPreset = {
  id: string;
  label: string;
  homeBase: string;
  focus: string;
  audienceTargets: string;
  themeTargets: string;
  regionalScope?: string;
  haloCapPercent?: number;
};

export const PARTNER_PRESETS: PartnerPreset[] = [
  {
    id: "thor-ernstsson",
    label: "Thor Ernstsson",
    homeBase: "Brooklyn, NY",
    focus:
      "Enterprise AI adoption in regulated industries. Speaking engagements that reach CIO, CAIO, and Chief Data Officer audiences.",
    audienceTargets:
      "CIO, CAIO, Chief Data Officer, VP AI Strategy, VP Data & Analytics",
    themeTargets:
      "enterprise AI rollout, AI governance / risk, agentic workflows, data foundations, measurable ROI, operating model change",
    regionalScope: "North America + Europe only",
    haloCapPercent: 10,
  },
  {
    id: "scott-pollack",
    label: "Scott Pollack",
    homeBase: "New York, NY",
    focus:
      "GTM and sales enablement in mid-market B2B SaaS. Sponsorship-focused — prefers events with strong sponsor exhibit + buyer density.",
    audienceTargets:
      "VP Sales, Chief Revenue Officer, VP Marketing, VP Customer Success, Sales Ops lead",
    themeTargets:
      "AI in GTM, sales productivity, revenue operations, pipeline intelligence, deal enablement, mid-market SaaS leadership",
    regionalScope: "North America only",
    haloCapPercent: 0,
  },
];

export function findPreset(id: string | null | undefined) {
  if (!id) return null;
  return PARTNER_PRESETS.find((p) => p.id === id) ?? null;
}
