import type { Prompt } from "./types";

/*
  12 seeded prompts spanning the common enterprise workflows per
  PROJECT.md section 7.6.2. Variables use {{variable_name}} syntax;
  renderers replace with fill values or leave bracketed for copy.
*/

export const PROMPTS: Prompt[] = [
  {
    id: "pr-01",
    slug: "competitor-brief-weekly",
    title: "Weekly competitor brief",
    description:
      "A reusable prompt that produces a readout-ready competitor brief from a pasted source dump.",
    prompt_body: `You are writing a weekly competitor brief for the {{role}} at a {{industry}} company.

**Competitors to track:** {{competitors}}

**Source material:** the text block below. Use only this text. Do not speculate beyond it.

---
{{source_dump}}
---

**Task:** For each competitor above, identify the single most important move they made in the last 30 days and explain why it matters to our positioning.

**Format:**
- Three bullet points per competitor, maximum 80 words per competitor.
- Lead with the move, then the implication for us.
- No hedge language. No "it remains to be seen."
- If there is no meaningful news for a competitor, say so in one line and move on.`,
    variables: [
      { name: "role", label: "Role", placeholder: "Chief Marketing Officer", type: "text" },
      { name: "industry", label: "Industry", placeholder: "Financial Services", type: "text" },
      {
        name: "competitors",
        label: "Competitors (comma-separated)",
        placeholder: "Acme Corp, Beta Inc, Gamma Co",
        type: "text",
      },
      {
        name: "source_dump",
        label: "Source material",
        placeholder: "Paste press releases, news clippings, earnings call snippets…",
        type: "textarea",
      },
    ],
    author_name: "Dana Rivera",
    tags: {
      roles: ["Chief Marketing Officer", "Head of Strategy"],
      categories: ["Ops", "Research"],
      topics: ["competitive-intelligence"],
    },
    published_at: "2026-03-12",
  },
  {
    id: "pr-04",
    slug: "meeting-notes-to-actions",
    title: "Meeting notes to action items",
    description:
      "Convert raw meeting notes into a structured summary with decisions, owners, and dates.",
    prompt_body: `You are turning raw meeting notes into a structured summary.

**Meeting:** {{meeting_name}}
**Date:** {{meeting_date}}
**Attendees:** {{attendees}}

**Notes:**
---
{{raw_notes}}
---

**Task:** Produce a structured summary with three sections:

1. **Decisions made** — each one phrased as a complete sentence that makes sense out of context. Include who decided it if knowable.
2. **Action items** — table format: *Action · Owner · Due date*. Only include actions where an owner and a date can be inferred from the notes. If one is missing, include the row but mark the missing field as "TBD — needs confirmation."
3. **Open questions** — things the meeting raised that were not resolved.

Do not invent content. If the notes don't say something, it doesn't appear in the summary.`,
    variables: [
      { name: "meeting_name", label: "Meeting name", placeholder: "Q2 GTM sync", type: "text" },
      {
        name: "meeting_date",
        label: "Meeting date",
        placeholder: "2026-04-22",
        type: "text",
      },
      {
        name: "attendees",
        label: "Attendees",
        placeholder: "First names or initials",
        type: "text",
      },
      {
        name: "raw_notes",
        label: "Raw notes",
        placeholder: "Paste Otter transcript, Granola output, or raw handwritten notes.",
        type: "textarea",
      },
    ],
    tags: {
      roles: ["all"],
      categories: ["Ops"],
      topics: ["meetings", "operations"],
    },
    published_at: "2026-03-18",
  },
  {
    id: "pr-05",
    slug: "strategy-memo-first-draft",
    title: "Strategy memo first draft",
    description:
      "A Bezos-style memo draft that argues for a specific decision with evidence and a recommendation.",
    prompt_body: `You are drafting a 6-page strategy memo for the {{audience}}.

**Decision this memo is asking for:** {{decision}}

**Key evidence available:** {{evidence}}

**Constraint:** The audience will read this in 20 minutes. They value clarity over comprehensiveness and expect a specific recommendation at the end.

**Task:** Produce the memo with these sections:

1. **Executive summary** (3 bullets max — the recommendation + the two most important reasons)
2. **Background** (what the reader needs to know to evaluate the recommendation — keep tight)
3. **Options considered** (the full option set, including the ones you rejected, and why you rejected them)
4. **Recommendation** (the specific choice and why)
5. **Risks and mitigations** (2–3 risks, each with a mitigation)
6. **Next steps and asks** (who does what by when)

Length: aim for 1,400–1,700 words. Use full sentences, not bullet fragments, except where noted.`,
    variables: [
      {
        name: "audience",
        label: "Audience",
        placeholder: "Executive committee / CEO + CFO / Board",
        type: "text",
      },
      {
        name: "decision",
        label: "Decision the memo asks for",
        placeholder: "Whether to commit to acquiring Acme vs. building in-house vs. neither.",
        type: "textarea",
      },
      {
        name: "evidence",
        label: "Evidence available",
        placeholder: "Bullet the key data points, research findings, and analysis you have.",
        type: "textarea",
      },
    ],
    tags: {
      roles: ["Chief Financial Officer", "Head of Strategy", "Chief Revenue Officer"],
      categories: ["Ops"],
      topics: ["strategy", "writing"],
    },
    published_at: "2026-03-20",
  },
  {
    id: "pr-07",
    slug: "slide-outline-generator",
    title: "Slide outline generator",
    description:
      "Produce a presentation outline — section by section, bullet by bullet — ready to hand to design.",
    prompt_body: `You are producing a slide outline for a {{duration}}-minute presentation to {{audience}}.

**Topic:** {{topic}}

**What I want the audience to take away:** {{takeaway}}

**Task:** Produce a slide-by-slide outline. For each slide:

- **Slide title** (headline-style, no punctuation at the end)
- **Three bullets maximum** on what goes on the slide
- **Speaker note** — one sentence on what the presenter should emphasize

Include:
- An opening slide that grounds the audience in what this is about and why now
- A single decision or ask slide at the end
- No more than {{max_slides}} slides total

Do not invent statistics. If you need evidence, mark "[evidence needed]" and move on.`,
    variables: [
      { name: "duration", label: "Duration (minutes)", placeholder: "20", type: "text" },
      { name: "audience", label: "Audience", placeholder: "Executive committee", type: "text" },
      { name: "topic", label: "Topic", placeholder: "Q3 AI investment plan", type: "textarea" },
      {
        name: "takeaway",
        label: "One-sentence takeaway",
        placeholder: "Approve the three pilots on slide 9.",
        type: "textarea",
      },
      { name: "max_slides", label: "Maximum slides", placeholder: "15", type: "text" },
    ],
    tags: {
      roles: ["all"],
      categories: ["Ops"],
      topics: ["presentations", "writing"],
    },
    published_at: "2026-03-25",
  },
  {
    id: "pr-08",
    slug: "rfp-analysis",
    title: "RFP / contract analysis",
    description:
      "Extract the risks, requirements, and hidden commitments from a long RFP or contract document.",
    prompt_body: `You are analyzing an RFP (or similar contract document) for {{my_side}}.

**Document:**
---
{{document}}
---

**Task:** Produce a structured analysis with four sections:

1. **Mandatory requirements** — every "must" statement, listed verbatim with its location in the document.
2. **Evaluation criteria** — the explicit scoring rubric or evaluation approach.
3. **Hidden commitments and risks** — language that creates obligations not obvious on first reading (indemnities, exclusivity, termination clauses, penalty structures, etc.). Be thorough. Cite specific paragraphs.
4. **Questions we should ask before we respond** — the five most important questions, ordered by impact on our bid.

Do not try to recommend a response. This is diagnostic only.`,
    variables: [
      {
        name: "my_side",
        label: "Which side are you on?",
        placeholder: "Responder / Issuer",
        type: "text",
      },
      {
        name: "document",
        label: "Document text",
        placeholder: "Paste the full RFP or contract text.",
        type: "textarea",
      },
    ],
    tags: {
      roles: ["Chief Revenue Officer", "Head of Strategy", "VP of Operations"],
      categories: ["Ops"],
      topics: ["procurement", "legal"],
    },
    published_at: "2026-03-27",
  },
  {
    id: "pr-10",
    slug: "exec-summary-from-long-doc",
    title: "Executive summary from a long document",
    description:
      "Condense a long document (research report, regulatory filing, whitepaper) into a readout-ready exec summary.",
    prompt_body: `You are writing an executive summary of the document below for {{audience}}.

**The reader has:** {{reader_context}}

**Document:**
---
{{document}}
---

**Task:** Write the exec summary. Constraints:

- **Length:** 250 words or fewer.
- **Structure:** three labeled sections — *What this is*, *What matters for us*, *What I recommend we do.*
- **Specificity:** name specific numbers, dates, or parties where the document does. Do not paraphrase specific figures.
- **Tone:** direct. The reader has 3 minutes.

Do not add recommendations that aren't supported by the document. If the document doesn't support a recommendation, the third section is "What I recommend we investigate next."`,
    variables: [
      { name: "audience", label: "Audience", placeholder: "CFO and board", type: "text" },
      {
        name: "reader_context",
        label: "Reader context",
        placeholder: "What does the reader already know or care about?",
        type: "textarea",
      },
      {
        name: "document",
        label: "Document text",
        placeholder: "Paste the full document.",
        type: "textarea",
      },
    ],
    tags: {
      roles: ["all"],
      categories: ["Ops"],
      topics: ["writing", "synthesis"],
    },
    published_at: "2026-04-01",
  },
  {
    id: "pr-12",
    slug: "swot-style-analysis",
    title: "SWOT-style analysis for a strategic option",
    description:
      "Produce a rigorous strengths/weaknesses/opportunities/threats analysis of a specific strategic option.",
    prompt_body: `You are analyzing a specific strategic option for {{company_context}}.

**The option:** {{option}}

**The alternative options on the table:** {{alternatives}}

**What the team has decided is true:** {{assumptions}}

**Task:** Produce a SWOT-style analysis — but hold it to a higher standard than most SWOTs. Specifically:

- **Strengths** must be strengths relative to the alternatives, not generic positives.
- **Weaknesses** must include the one weakness most likely to kill this option, clearly marked.
- **Opportunities** must be things that get unlocked if this option is chosen, not things that exist regardless.
- **Threats** must be threats specific to this option, not things that would threaten any choice.

Keep each section to 3–4 bullets. At the end, add a paragraph: "If I were forced to choose, I'd pick [X] because [specific reason]." Do not hedge.`,
    variables: [
      {
        name: "company_context",
        label: "Company context",
        placeholder: "A mid-market B2B SaaS company with 300 employees in regulated industries.",
        type: "textarea",
      },
      {
        name: "option",
        label: "The option being analyzed",
        placeholder: "Acquire Acme vs. build in-house.",
        type: "textarea",
      },
      {
        name: "alternatives",
        label: "Alternative options",
        placeholder: "Partner with Acme; do nothing; build in-house with Acme as a reference.",
        type: "textarea",
      },
      {
        name: "assumptions",
        label: "Known assumptions the team holds",
        placeholder: "What has the team already decided is true?",
        type: "textarea",
      },
    ],
    tags: {
      roles: ["Head of Strategy", "Chief Financial Officer", "Chief Revenue Officer"],
      categories: ["Research", "Ops"],
      topics: ["strategy", "analysis"],
    },
    published_at: "2026-04-05",
  },
];

export function getPromptBySlug(slug: string) {
  return PROMPTS.find((p) => p.slug === slug);
}
