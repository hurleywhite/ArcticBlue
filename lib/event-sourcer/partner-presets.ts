import type { PromptKey } from "./system-prompts";

/*
  Partner presets — one-click form fills. Add new partners here.

  Two shapes:

  - hardcoded: true   — the partner profile (audience / themes /
    sector lens / region / exclusions) lives inside a partner-specific
    system prompt. The UI only collects runtime inputs (dates, home
    base, session size; clients for Joe). `focus` / `audienceTargets`
    / `themeTargets` on this preset are descriptive only — shown on
    the compact card, not sent as runtime inputs.

  - hardcoded: false  — generic/Thor flow. Preset fills the form's
    Focus / Audience / Themes fields which then get composed into the
    generic BASE_SYSTEM_PROMPT's RUNTIME INPUTS block.
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
  // Partner-specific-prompt partners
  hardcoded: boolean;
  promptKey: PromptKey;
  // Compact blurb shown on the collapsed partner card
  summary?: string;
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
    hardcoded: false,
    promptKey: "generic",
  },
  {
    id: "anuraag-verma",
    label: "Anuraag Verma",
    homeBase: "",
    focus:
      "Regulated-industry enterprise AI — compliance, transformation, ROI. Global: US, EMEA, Middle East, APAC.",
    audienceTargets:
      "Chief AI Officer, CIO, CTO, CDO, Chief Risk Officer, public sector AI leaders",
    themeTargets:
      "enterprise AI rollout, governance (NIST AI RMF / EU AI Act / ISO 42001), measurable ROI, AWS ecosystem, public sector AI",
    regionalScope: "Global",
    haloCapPercent: 10,
    hardcoded: true,
    promptKey: "anuraag",
    summary:
      "Regulated-industry enterprise AI · FSI / Insurance / Healthcare / Gov · Global rooms where senior enterprise buyers make AI decisions.",
  },
  {
    id: "scott-pollack",
    label: "Scott Pollack",
    homeBase: "New York, NY",
    focus:
      "Workforce + GTM + curation. US-first, London selective. Host / curator / co-host ranks over speaker.",
    audienceTargets:
      "CHRO, CPO, CLO, Heads of L&D, CRO, VP GTM, founders, GTM-tech investors",
    themeTargets:
      "AI literacy, future of work, GTM community building, intimate curated gatherings, HR tech + L&D transformation",
    regionalScope: "North America only",
    haloCapPercent: 15,
    hardcoded: true,
    promptKey: "scott",
    summary:
      "People + relationships + human-side AI · US-first, London selective · Host / curator routes rank over speaker.",
  },
  {
    id: "jerome-wouters",
    label: "Jerome Wouters",
    homeBase: "London, UK",
    focus:
      "European enterprise AI — relationship-before-transaction. Invitation-only CxO roundtables rank highest.",
    audienceTargets:
      "European CIO / CTO / CAIO / CDO, Heads of Innovation, European VC / PE",
    themeTargets:
      "European enterprise AI adoption, EU AI Act, operating model change, Antler-adjacent networks",
    regionalScope: "Europe only (rare N. Africa exception)",
    haloCapPercent: 10,
    hardcoded: true,
    promptKey: "jerome",
    summary:
      "Europe only (rare N. Africa exceptions) · invitation-only CxO formats rank highest · London-based tiebreaker.",
  },
  {
    id: "joe-lalley",
    label: "Joe Lalley",
    homeBase: "",
    focus:
      "Facilitation + adult learning + AI adoption programming. US-primary L&D circuit. Attends for curriculum / recruitment / delivery / client context.",
    audienceTargets:
      "Heads of L&D, CLOs, instructional designers, facilitators, change-management leaders, ArcticBlue client-industry leaders",
    themeTargets:
      "L&D methodology, facilitation craft, AI adoption + change management, workforce transformation, client-industry context",
    regionalScope: "US primary, Europe secondary, client-regions tertiary",
    haloCapPercent: 10,
    hardcoded: true,
    promptKey: "joe",
    summary:
      "Facilitation + adult learning + AI adoption · US L&D circuit primary · Events judged by curriculum / recruitment / delivery / client-context purpose.",
  },
];

export function findPreset(id: string | null | undefined) {
  if (!id) return null;
  return PARTNER_PRESETS.find((p) => p.id === id) ?? null;
}
