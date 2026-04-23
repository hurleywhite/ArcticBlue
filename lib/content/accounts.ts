/*
  Sales pipeline — accounts ArcticBlue is pursuing.

  Seeded so the Workbench has something to live against until a real
  CRM/Supabase-backed store lands. Each account carries enough context
  for the meeting-prep flow to feel real: who we're meeting, what they
  care about, which case studies we'd cite.
*/

export type AccountStage =
  | "cold"
  | "discovery"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type Account = {
  id: string;
  company_name: string;
  domain: string;
  industry: string;
  size: string;
  stage: AccountStage;
  poc_name: string;
  poc_title: string;
  poc_email: string;
  next_meeting?: {
    title: string;
    when: string; // ISO
    duration_minutes: number;
    attendees: string[];
    location: string;
  };
  notes: string;
  target_opportunity_category?: string;
  relevant_case_slugs?: string[];
  last_touch?: string; // ISO
  updated_at: string;
};

export const ACCOUNTS: Account[] = [
  {
    id: "acct-001",
    company_name: "Glacier Financial",
    domain: "glacierfinancial.example",
    industry: "Financial Services · Wealth Management",
    size: "2,400 employees",
    stage: "discovery",
    poc_name: "Maya Okonkwo",
    poc_title: "Chief Operating Officer",
    poc_email: "maya.okonkwo@glacierfinancial.example",
    next_meeting: {
      title: "Discovery — AI enablement scope",
      when: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
      duration_minutes: 45,
      attendees: ["Maya Okonkwo (COO)", "Devon Marsh (Head of Client Service)", "Scott Alworth (ArcticBlue)"],
      location: "Zoom",
    },
    notes:
      "Third meeting. Maya's concern: advisor-facing AI tools are uneven across the 14 regional offices. Wants a program that compounds, not a one-off workshop. Budget signal on table; legal reviewing MSA.",
    target_opportunity_category: "Service",
    relevant_case_slugs: [
      "insurer-synthetic-personas",
      "healthcare-call-resolution",
      "government-executive-upskilling",
    ],
    last_touch: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "acct-002",
    company_name: "Cedar Logistics",
    domain: "cedarlogistics.example",
    industry: "Logistics · Supply Chain",
    size: "9,200 employees",
    stage: "proposal",
    poc_name: "Henrik Voss",
    poc_title: "VP of Operations",
    poc_email: "henrik.voss@cedarlogistics.example",
    next_meeting: {
      title: "Proposal walkthrough — Practical Labs × Ops",
      when: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
      duration_minutes: 60,
      attendees: ["Henrik Voss (VP Ops)", "Luisa Pena (Chief of Staff)", "Joe Nussbaum (ArcticBlue)"],
      location: "Cedar HQ · Denver",
    },
    notes:
      "Henrik has bought in. Need Luisa (COS) to sign on the procurement side. Proposal delivered last week; they're comparing to one internal-build option. Our edge: the snowball effect and the facilitator bench.",
    target_opportunity_category: "Ops",
    relevant_case_slugs: ["edtech-sales-enrichment", "nonprofit-vetting-workflow"],
    last_touch: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "acct-003",
    company_name: "Brightline Health",
    domain: "brightlinehealth.example",
    industry: "Healthcare · Integrated Delivery",
    size: "42,000 employees",
    stage: "cold",
    poc_name: "Priya Agarwal",
    poc_title: "Chief Digital Officer",
    poc_email: "priya.agarwal@brightlinehealth.example",
    notes:
      "Inbound from a shared board member. Cold email sent yesterday. If they reply, priority is a 30-minute intro framed around the call-center efficiency use case — that's what the board member flagged as their pain.",
    target_opportunity_category: "Service",
    relevant_case_slugs: ["healthcare-call-resolution"],
    last_touch: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
  {
    id: "acct-004",
    company_name: "Pinecroft Industrials",
    domain: "pinecroft.example",
    industry: "Manufacturing · Industrial Components",
    size: "6,800 employees",
    stage: "negotiation",
    poc_name: "Grace Tan",
    poc_title: "Chief People Officer",
    poc_email: "grace.tan@pinecroft.example",
    notes:
      "Grace wants to start with a single cohort of 20, 3-month engagement, with a go/no-go on Q2 renewal. Aligned on scope; last open item is whether the facilitator bench is fixed or named per session (she wants named).",
    target_opportunity_category: "People",
    relevant_case_slugs: ["government-executive-upskilling"],
    last_touch: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "acct-005",
    company_name: "Summit Insurance",
    domain: "summitinsurance.example",
    industry: "Insurance · P&C",
    size: "18,500 employees",
    stage: "won",
    poc_name: "Thomas Reed",
    poc_title: "Chief Technology Officer",
    poc_email: "thomas.reed@summitinsurance.example",
    notes:
      "Signed. Kickoff next Monday. First Lab challenge: underwriter decision support — they want synthetic precedent lookup for the complex commercial book.",
    target_opportunity_category: "Ops",
    relevant_case_slugs: ["insurer-synthetic-personas", "insurer-launch-compression"],
    last_touch: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
];

export const STAGE_LABEL: Record<AccountStage, string> = {
  cold: "Cold",
  discovery: "Discovery",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const STAGE_ORDER: AccountStage[] = [
  "cold",
  "discovery",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export function getAccountById(id: string) {
  return ACCOUNTS.find((a) => a.id === id);
}

export function getNextMeetingAccount(): Account | undefined {
  const upcoming = ACCOUNTS.filter(
    (a) => a.next_meeting && new Date(a.next_meeting.when).getTime() > Date.now()
  );
  upcoming.sort(
    (a, b) =>
      new Date(a.next_meeting!.when).getTime() - new Date(b.next_meeting!.when).getTime()
  );
  return upcoming[0];
}

export function formatMeetingWhen(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffHours = (date.getTime() - now) / (1000 * 60 * 60);
  const relative =
    diffHours < 1
      ? "Starting soon"
      : diffHours < 24
        ? `In ${Math.round(diffHours)}h`
        : diffHours < 24 * 7
          ? `In ${Math.round(diffHours / 24)}d`
          : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const absolute = date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${relative} · ${absolute}`;
}
