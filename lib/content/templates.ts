import type { Template } from "./types";

/*
  6 seeded templates — structured output scaffolding for common
  enterprise deliverables. Distinct from prompts: prompts are AI input,
  templates are the target output structure. Variables fill inline.
*/

export const TEMPLATES: Template[] = [
  {
    id: "tpl-01",
    slug: "weekly-competitor-brief",
    title: "Weekly competitor brief",
    description:
      "The output format for the weekly competitor brief prompt. Pair with the prompt of the same name.",
    template_type: "brief",
    body_markdown: `# Weekly competitor brief — {{week_of}}

**Prepared for:** {{audience}}
**Competitors tracked:** {{competitors}}

---

## {{competitor_1_name}}

- **Move:** [specific move, verbatim where possible, one sentence]
- **Why it matters:** [one sentence on implication for us]
- **Suggested response:** [one sentence, or "no action this week"]

## {{competitor_2_name}}

- **Move:**
- **Why it matters:**
- **Suggested response:**

## {{competitor_3_name}}

- **Move:**
- **Why it matters:**
- **Suggested response:**

---

## Pattern this week

[1–2 sentences on the pattern that connects these moves, if one exists. "No pattern this week" is an acceptable answer.]

## What to watch next week

- [specific thing to watch, named]
- [specific thing to watch, named]`,
    variables: [
      { name: "week_of", label: "Week of", placeholder: "April 22, 2026", type: "text" },
      { name: "audience", label: "Audience", placeholder: "CMO + PMM leadership", type: "text" },
      {
        name: "competitors",
        label: "Competitors (comma-separated)",
        placeholder: "Acme, Beta, Gamma",
        type: "text",
      },
      { name: "competitor_1_name", label: "Competitor 1", placeholder: "Acme", type: "text" },
      { name: "competitor_2_name", label: "Competitor 2", placeholder: "Beta", type: "text" },
      { name: "competitor_3_name", label: "Competitor 3", placeholder: "Gamma", type: "text" },
    ],
    tags: {
      roles: ["Chief Marketing Officer", "Head of Strategy"],
      categories: ["Ops"],
      topics: ["competitive-intelligence"],
    },
    published_at: "2026-03-15",
  },
  {
    id: "tpl-02",
    slug: "post-meeting-actions-email",
    title: "Post-meeting actions email",
    description:
      "The email sent immediately after a working meeting that makes decisions and actions explicit.",
    template_type: "email",
    body_markdown: `**Subject:** {{meeting_name}} — decisions, actions, open questions

Team,

Quick recap from {{meeting_name}} today.

**Decisions made**

- {{decision_1}}
- {{decision_2}}

**Actions and owners**

| Action | Owner | Due |
|---|---|---|
| {{action_1}} | {{owner_1}} | {{due_1}} |
| {{action_2}} | {{owner_2}} | {{due_2}} |
| {{action_3}} | {{owner_3}} | {{due_3}} |

**Open questions to resolve by next sync**

- {{open_question_1}}
- {{open_question_2}}

Next sync: {{next_sync}}.

— {{sender_name}}`,
    variables: [
      { name: "meeting_name", label: "Meeting name", placeholder: "Q2 GTM sync", type: "text" },
      { name: "decision_1", label: "Decision 1", placeholder: "", type: "text" },
      { name: "decision_2", label: "Decision 2", placeholder: "", type: "text" },
      { name: "action_1", label: "Action 1", placeholder: "", type: "text" },
      { name: "owner_1", label: "Owner 1", placeholder: "", type: "text" },
      { name: "due_1", label: "Due 1", placeholder: "", type: "text" },
      { name: "action_2", label: "Action 2", placeholder: "", type: "text" },
      { name: "owner_2", label: "Owner 2", placeholder: "", type: "text" },
      { name: "due_2", label: "Due 2", placeholder: "", type: "text" },
      { name: "action_3", label: "Action 3", placeholder: "", type: "text" },
      { name: "owner_3", label: "Owner 3", placeholder: "", type: "text" },
      { name: "due_3", label: "Due 3", placeholder: "", type: "text" },
      { name: "open_question_1", label: "Open question 1", placeholder: "", type: "text" },
      { name: "open_question_2", label: "Open question 2", placeholder: "", type: "text" },
      { name: "next_sync", label: "Next sync", placeholder: "Tue Apr 29, 10am", type: "text" },
      { name: "sender_name", label: "Your name", placeholder: "First name", type: "text" },
    ],
    tags: {
      roles: ["all"],
      categories: ["Ops"],
      topics: ["meetings"],
    },
    published_at: "2026-03-16",
  },
  {
    id: "tpl-03",
    slug: "product-concept-one-pager",
    title: "Product concept one-pager",
    description:
      "A tight, opinionated one-pager for proposing a new product concept to internal stakeholders.",
    template_type: "brief",
    body_markdown: `# {{concept_name}}

**Stage:** Concept · Seeking feedback
**Proposed by:** {{proposer}}
**Date:** {{date}}

---

## The opportunity

[Two paragraphs. First: what's changing in the world or market that makes this worth doing now. Second: what specific segment is underserved and why.]

## What we'd build

[One paragraph. The concrete thing, described as though it already exists. Avoid hedging language.]

## Why us

[Three bullets. What about our position or capability makes us right for this. If the honest answer is "nothing specific," say so.]

## Success in 12 months

- [Specific measurable outcome]
- [Specific measurable outcome]
- [Specific measurable outcome]

## What we are not doing

- [Scope boundary]
- [Scope boundary]
- [Scope boundary]

## Biggest risk

[One paragraph. The specific risk most likely to kill this, plus the earliest signal we'd see it coming true.]

## Asks

- [Specific thing — budget, headcount, time — and from whom]
- [Specific thing]`,
    variables: [
      { name: "concept_name", label: "Concept name", placeholder: "", type: "text" },
      { name: "proposer", label: "Proposed by", placeholder: "", type: "text" },
      { name: "date", label: "Date", placeholder: "2026-04-22", type: "text" },
    ],
    tags: {
      roles: ["Head of Product", "Head of Strategy"],
      categories: ["Research", "Ops"],
      topics: ["product", "writing"],
    },
    published_at: "2026-03-19",
  },
  {
    id: "tpl-04",
    slug: "interview-synthesis-framework",
    title: "Customer interview synthesis framework",
    description:
      "The structured output format for turning customer interview notes into a synthesis.",
    template_type: "analysis",
    body_markdown: `# Customer interview synthesis — {{study_name}}

**Interviews completed:** {{n_interviews}}
**Segment:** {{segment}}
**Synthesis by:** {{author}} · {{date}}

---

## Themes

### Theme 1 · [One-sentence statement of the theme]

Appeared in [X] of [Y] interviews.

> "[Verbatim quote, shortest representative example]" — Interview [N]

> "[Second quote from a different interview]" — Interview [N]

### Theme 2 · [One-sentence statement]

Appeared in [X] of [Y] interviews.

> "[Quote]" — Interview [N]

### Theme 3 · [One-sentence statement]

Appeared in [X] of [Y] interviews.

> "[Quote]" — Interview [N]

## Contradictions

- [Specific contradiction, with who said what]
- [Specific contradiction, with who said what]

## What this unblocks

- [Specific decision that can now be made]
- [Specific decision]

## What we still don't know

- [Open question for the next round]
- [Open question]`,
    variables: [
      { name: "study_name", label: "Study name", placeholder: "", type: "text" },
      { name: "n_interviews", label: "# interviews", placeholder: "6", type: "text" },
      { name: "segment", label: "Segment", placeholder: "", type: "text" },
      { name: "author", label: "Author", placeholder: "", type: "text" },
      { name: "date", label: "Date", placeholder: "2026-04-22", type: "text" },
    ],
    tags: {
      roles: ["Head of Product", "Chief Marketing Officer"],
      categories: ["Research"],
      topics: ["customer-research"],
    },
    published_at: "2026-03-23",
  },
  {
    id: "tpl-05",
    slug: "pilot-scoping-doc",
    title: "AI pilot scoping doc",
    description:
      "The ArcticBlue pilot scoping format. Decision, evidence, smallest experiment, owners, timeline.",
    template_type: "plan",
    body_markdown: `# Pilot scoping · {{pilot_name}}

**Sponsor:** {{sponsor}}
**Team:** {{team}}
**Scoping date:** {{date}}
**Timeline:** 4 weeks (target)

---

## 1. The decision we're making

[One sentence. Names a specific person who will make the call.]

## 2. Evidence that would change our mind

**If yes:** [The specific observation that would tell us this is worth investing in.]

**If no:** [The specific observation that would tell us to kill this.]

## 3. Smallest experiment

- **Scope:** [What we will and won't touch. Be narrow.]
- **Method:** [How we'll run it. 3–5 sentences.]
- **Owner:** [Single named person, not "the team."]

## 4. What "done" looks like

- A written readout for {{sponsor}}
- A go / no-go / iterate decision
- [Any artifact that would persist even if we kill this — e.g., calibration data, benchmark, playbook]

## 5. Risks and guardrails

- **Biggest risk:** [Specific. Include what would signal it coming true.]
- **Compliance / legal review:** [Who signs off before launch. When.]
- **Rollback:** [How we turn it off if it misbehaves.]

## 6. Timeline

| Week | Milestone |
|---|---|
| 1 | |
| 2 | |
| 3 | |
| 4 | Readout, decision |`,
    variables: [
      { name: "pilot_name", label: "Pilot name", placeholder: "", type: "text" },
      { name: "sponsor", label: "Executive sponsor", placeholder: "", type: "text" },
      { name: "team", label: "Team", placeholder: "", type: "text" },
      { name: "date", label: "Scoping date", placeholder: "2026-04-22", type: "text" },
    ],
    tags: {
      roles: ["all"],
      categories: ["Ops"],
      topics: ["experimentation", "scoping"],
    },
    published_at: "2026-03-28",
  },
  {
    id: "tpl-06",
    slug: "quarterly-ai-readout",
    title: "Quarterly AI readout",
    description:
      "The quarterly update stakeholders expect — what shipped, what's in flight, what we learned.",
    template_type: "plan",
    body_markdown: `# AI enablement readout · Q{{quarter}} {{year}}

**Prepared for:** {{audience}}
**Prepared by:** {{author}}
**Date:** {{date}}

---

## Executive summary

[Three bullets, total. The three things the reader should remember if they only read this section.]

## What shipped this quarter

| Initiative | Status | Outcome |
|---|---|---|
| [Initiative 1] | Shipped | [Specific outcome] |
| [Initiative 2] | Shipped | [Specific outcome] |
| [Initiative 3] | Killed | [What we learned by killing it] |

## What's in flight

| Initiative | Stage | Next milestone |
|---|---|---|
| [Initiative 4] | Pilot | [Specific milestone, date] |
| [Initiative 5] | Scoping | [Specific milestone, date] |

## What we learned

- [Specific lesson, named]
- [Specific lesson, named]
- [Specific lesson, named]

## What we're asking

- [Specific ask — budget, decision, time, alignment]
- [Specific ask]`,
    variables: [
      { name: "quarter", label: "Quarter", placeholder: "2", type: "text" },
      { name: "year", label: "Year", placeholder: "2026", type: "text" },
      { name: "audience", label: "Audience", placeholder: "Executive committee", type: "text" },
      { name: "author", label: "Author", placeholder: "", type: "text" },
      { name: "date", label: "Date", placeholder: "2026-06-30", type: "text" },
    ],
    tags: {
      roles: ["Head of Strategy", "Chief Technology Officer"],
      categories: ["Ops"],
      topics: ["reporting", "writing"],
    },
    published_at: "2026-04-01",
  },
];

export function getTemplateBySlug(slug: string) {
  return TEMPLATES.find((t) => t.slug === slug);
}
