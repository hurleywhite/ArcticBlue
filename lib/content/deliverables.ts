/*
  Deliverables — run-to-output workflows that produce client-ready
  artifacts. Each deliverable definition declares its structured
  intake form, a Claude drafting prompt, and the export treatment.

  Different from prompts in /library: prompts are reference material
  that users run manually. Deliverables are guided workflows with
  steps, validation, branded output, and a referral loop.
*/

export type IntakeFieldType = "text" | "textarea" | "select" | "multi-line-list";

export type IntakeField = {
  name: string;
  label: string;
  help?: string;
  placeholder?: string;
  type: IntakeFieldType;
  required?: boolean;
  options?: string[]; // for select
  rows?: number; // for textarea
};

export type DeliverableType =
  | "interview-synthesis"
  | "meeting-recap"
  | "pilot-scoping"
  | "discovery-brief"
  | "competitive-brief";

export type DeliverableDef = {
  id: DeliverableType;
  slug: DeliverableType; // same as id for routing
  title: string;
  category: string;
  summary: string;
  output_label: string; // e.g. "Interview synthesis deck" or "Follow-up email"
  usage_hint: string; // "Use this after you've conducted X"
  intake: IntakeField[];
  // Short descriptors that appear on the gallery card.
  when_to_use: string;
  produces: string;
  // Estimated time end-to-end.
  minutes: number;
};

export const DELIVERABLES: DeliverableDef[] = [
  {
    id: "interview-synthesis",
    slug: "interview-synthesis",
    title: "Customer interview synthesis",
    category: "Research",
    summary:
      "Turn raw customer interview notes into a board-ready synthesis — themes, contradictions, decisions, verbatim quotes. The output lands as a branded PDF you can hand to your client.",
    output_label: "Interview synthesis brief",
    usage_hint:
      "Use this after you've run 4–8 customer interviews and need to produce a deliverable for your client.",
    when_to_use: "After 4–8 customer interviews",
    produces: "Themes, contradictions, and named decisions",
    minutes: 8,
    intake: [
      {
        name: "client_name",
        label: "Client name",
        help: "Who this synthesis is for. Goes on the cover page.",
        placeholder: "Glacier Financial",
        type: "text",
        required: true,
      },
      {
        name: "decision_to_inform",
        label: "Decision this synthesis will inform",
        help: "Name the specific decision. If it's vague, the synthesis will be vague too.",
        placeholder:
          "Whether to ship the new advisor-facing AI dashboard to all 14 regional offices this quarter, or pilot in two first.",
        type: "textarea",
        rows: 3,
        required: true,
      },
      {
        name: "audience",
        label: "Who reads this",
        help: "The audience shapes tone. Executives want decisions; product teams want themes with examples.",
        placeholder: "COO + Head of Client Service + Product Lead",
        type: "text",
      },
      {
        name: "segment_description",
        label: "Interview segment",
        help: "Who did we interview? Role, seniority, context.",
        placeholder:
          "Senior advisors across 6 regional offices; 10+ years tenure; a mix of early adopters and holdouts",
        type: "textarea",
        rows: 2,
      },
      {
        name: "interview_notes",
        label: "Interview notes",
        help: "Paste raw notes or transcripts. Separate each interview with a line of three dashes: ---",
        placeholder:
          "Interview 1 — Maya, Senior Advisor, Pacific region:\n- Currently spends 40% of prep time searching for client history…\n- Feels the new tool is too fast to trust; wants a review step…\n\n---\n\nInterview 2 — Devon, Senior Advisor, Northeast:\n…",
        type: "textarea",
        rows: 12,
        required: true,
      },
    ],
  },
  {
    id: "meeting-recap",
    slug: "meeting-recap",
    title: "Meeting recap",
    category: "Operations",
    summary:
      "Transform meeting notes into a structured recap — decisions, owned action items, open questions — ready to send as the post-meeting note.",
    output_label: "Meeting recap",
    usage_hint:
      "Use this immediately after a meeting you ran. Transcripts from Otter, Granola, or your own notes all work.",
    when_to_use: "Right after a meeting",
    produces: "Decisions, action items with owners, open questions",
    minutes: 4,
    intake: [
      {
        name: "meeting_name",
        label: "Meeting",
        placeholder: "Q2 GTM sync",
        type: "text",
        required: true,
      },
      {
        name: "meeting_date",
        label: "Date",
        placeholder: "2026-04-23",
        type: "text",
      },
      {
        name: "attendees",
        label: "Attendees",
        placeholder: "First names or initials, comma-separated",
        type: "text",
      },
      {
        name: "raw_notes",
        label: "Raw notes or transcript",
        help: "Paste Otter/Granola output or your own bullet notes. Model will extract decisions, actions, and questions.",
        placeholder: "Paste transcript or notes…",
        type: "textarea",
        rows: 10,
        required: true,
      },
    ],
  },
  {
    id: "pilot-scoping",
    slug: "pilot-scoping",
    title: "Pilot scoping doc",
    category: "Strategy",
    summary:
      "ArcticBlue's pilot scoping format: decision, evidence, smallest experiment, owners, timeline, risks. Produces a one-page scoping doc your client can sign off on.",
    output_label: "Pilot scoping doc",
    usage_hint:
      "Use this before a pilot kicks off. Gets the three core scoping questions answered in writing.",
    when_to_use: "Before a pilot kicks off",
    produces: "A one-page scoping doc for sign-off",
    minutes: 10,
    intake: [
      {
        name: "pilot_name",
        label: "Pilot name",
        placeholder: "Advisor dashboard rollout — Pacific region",
        type: "text",
        required: true,
      },
      {
        name: "sponsor",
        label: "Executive sponsor",
        placeholder: "Maya Okonkwo, COO",
        type: "text",
      },
      {
        name: "team",
        label: "Team",
        placeholder: "Head of Client Service, Product Lead, 3 advisors",
        type: "text",
      },
      {
        name: "decision",
        label: "The decision this pilot answers",
        help: "Name a specific decision and a specific person who'll make it.",
        placeholder:
          "Whether Maya signs off on rolling the advisor dashboard to all 14 regions at end of Q2.",
        type: "textarea",
        rows: 2,
        required: true,
      },
      {
        name: "evidence",
        label: "Evidence that would change her mind",
        help: "Two observations — one for 'yes, ship it' and one for 'no, hold'.",
        placeholder:
          "Yes: advisors in pilot report that >70% of their time saved goes to higher-value client work. No: compliance flags >2 uses/week that need manual review.",
        type: "textarea",
        rows: 3,
        required: true,
      },
      {
        name: "context",
        label: "Context",
        help: "Anything the model should know — constraints, prior attempts, political considerations.",
        placeholder:
          "Previous attempt failed due to poor advisor adoption. Legal has signed off on current data posture. 3 regions eligible for pilot.",
        type: "textarea",
        rows: 3,
      },
    ],
  },
];

export function getDeliverable(slug: string): DeliverableDef | undefined {
  return DELIVERABLES.find((d) => d.slug === slug);
}
