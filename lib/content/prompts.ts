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
    id: "pr-02",
    slug: "customer-interview-synthesis",
    title: "Customer interview synthesis",
    description:
      "Turn raw interview notes into a structured synthesis with themes, quotes, and decisions.",
    prompt_body: `You are synthesizing customer interview notes for a {{deliverable}}.

**Audience for this synthesis:** {{audience}}

**Interviews conducted:** {{n_interviews}} total.

**Notes (one interview per section, delimited):**
---
{{interview_notes}}
---

**Task:** Produce a synthesis with three sections:

1. **Themes** — 3–5 themes that showed up in 2+ interviews. Each theme is a single declarative sentence, followed by 1–2 short supporting quotes from the interviews (keep quotes verbatim).
2. **Contradictions** — points where interviews disagreed. Be specific about who said what.
3. **Decisions this should unblock** — what can the team now decide that they couldn't before these interviews?

Do not hedge. If the interviews didn't answer something clearly, say so.`,
    variables: [
      {
        name: "deliverable",
        label: "What this will inform",
        placeholder: "Product brief / GTM plan / positioning update",
        type: "text",
      },
      {
        name: "audience",
        label: "Audience",
        placeholder: "CMO and product leadership",
        type: "text",
      },
      { name: "n_interviews", label: "Number of interviews", placeholder: "6", type: "text" },
      {
        name: "interview_notes",
        label: "Interview notes",
        placeholder: "Paste raw interview notes, one per section, separated by '---'",
        type: "textarea",
      },
    ],
    author_name: "Priya Menon",
    tags: {
      roles: ["Head of Product", "Head of Strategy", "Chief Marketing Officer"],
      categories: ["Research"],
      topics: ["customer-research"],
    },
    published_at: "2026-03-15",
  },
  {
    id: "pr-03",
    slug: "product-brief-draft",
    title: "Product brief first draft",
    description:
      "Produce a focused product brief from a problem statement, user segment, and success criteria.",
    prompt_body: `You are drafting a product brief for an internal team.

**Problem statement:** {{problem_statement}}

**Target user segment:** {{user_segment}}

**Success criteria (what must be true for this to be a good brief):** {{success_criteria}}

**Task:** Produce a product brief with the following sections. No fluff. Every section should take a specific position.

1. **What we are shipping and why now** (4 sentences max)
2. **Who this is for** (2 sentences — the segment and the job-to-be-done)
3. **What success looks like in 6 months** (3 bullets, each with a specific metric if possible)
4. **What we are explicitly not doing** (3 bullets — the anti-scope)
5. **Biggest risk and how we'll know it's coming true** (2 sentences)

Length: maximum 400 words total.`,
    variables: [
      {
        name: "problem_statement",
        label: "Problem statement",
        placeholder: "One paragraph describing the problem we're solving and for whom.",
        type: "textarea",
      },
      {
        name: "user_segment",
        label: "User segment",
        placeholder: "Mid-market sales operations managers at SaaS companies with 200–1000 employees",
        type: "textarea",
      },
      {
        name: "success_criteria",
        label: "Success criteria",
        placeholder: "What must be true for this to feel like a great brief?",
        type: "textarea",
      },
    ],
    tags: {
      roles: ["Head of Product", "VP of Engineering"],
      categories: ["Ops"],
      topics: ["product", "writing"],
    },
    published_at: "2026-03-17",
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
    id: "pr-06",
    slug: "data-exploration-prompt",
    title: "Data exploration start-from-scratch",
    description:
      "When you've been handed a dataset you don't understand, this prompts structured exploration.",
    prompt_body: `You are helping me understand a dataset I've just been given.

**Dataset context:** {{dataset_context}}

**What I'm trying to decide or learn:** {{goal}}

**Data I can share with you (paste a sample or describe the schema):**
---
{{data_sample}}
---

**Task:** Walk me through a structured exploration:

1. **First questions.** List the 5 questions I should answer first to orient myself. Order them.
2. **Suspected shapes.** Based on the schema/sample, what distributions or relationships do you expect? Be specific about what would surprise you.
3. **Data quality flags.** What specific things in this data look suspicious or worth double-checking?
4. **A draft analysis plan.** Outline the sequence of cuts I should produce (group-bys, time series, segmentation) to answer the goal above.

Be direct. If the dataset is too small or not structured for the goal, say so.`,
    variables: [
      {
        name: "dataset_context",
        label: "Dataset context",
        placeholder: "What is this data? Where did it come from?",
        type: "textarea",
      },
      {
        name: "goal",
        label: "Goal",
        placeholder: "What decision are you trying to inform?",
        type: "textarea",
      },
      {
        name: "data_sample",
        label: "Sample or schema",
        placeholder: "Paste header row + 5 rows, or describe the columns.",
        type: "textarea",
      },
    ],
    tags: {
      roles: ["Head of Strategy", "VP of Engineering"],
      categories: ["Research", "Ops"],
      topics: ["data", "analysis"],
    },
    published_at: "2026-03-22",
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
    id: "pr-09",
    slug: "user-research-questions",
    title: "User research question generator",
    description:
      "Given a hypothesis and a user segment, generate focused, non-leading research questions.",
    prompt_body: `You are helping me design a user research session.

**Hypothesis I am testing:** {{hypothesis}}

**User segment I am interviewing:** {{segment}}

**Session length:** {{session_length}} minutes.

**Task:** Produce a research question guide with three sections:

1. **Warm-up (2 questions)** — light, conversational, grounding the participant.
2. **Core questions (6–8 questions)** — designed to test my hypothesis without leading the participant. Each question followed by 1–2 follow-up probes.
3. **Close-out (2 questions)** — anything-else-we-missed and willingness-to-continue.

Non-leading is not optional. Red-flag any question that assumes the answer.

Keep the full guide under 500 words.`,
    variables: [
      {
        name: "hypothesis",
        label: "Hypothesis",
        placeholder: "Sales reps at mid-market companies don't trust AI-generated competitor briefs.",
        type: "textarea",
      },
      {
        name: "segment",
        label: "User segment",
        placeholder: "Mid-market B2B SaaS sales reps, 3+ years experience",
        type: "textarea",
      },
      { name: "session_length", label: "Session length (min)", placeholder: "45", type: "text" },
    ],
    tags: {
      roles: ["Head of Product"],
      categories: ["Research"],
      topics: ["customer-research"],
    },
    published_at: "2026-03-29",
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
    id: "pr-11",
    slug: "code-explanation-non-technical",
    title: "Explain code to a non-technical audience",
    description:
      "Translate a code snippet or engineering decision into language a business stakeholder can evaluate.",
    prompt_body: `You are translating a technical artifact into language a {{audience}} can evaluate.

**Technical artifact (code, architecture decision, technical memo):**
---
{{artifact}}
---

**What the audience needs to decide:** {{decision}}

**Task:** Produce an explanation with three sections:

1. **What this is, in one paragraph** — using metaphor if helpful, but not so much metaphor that it becomes inaccurate.
2. **Why the team built it this way** — the trade-off they made, and what they traded against.
3. **What the audience should watch for** — the three things that would signal the decision is paying off or not.

Do not flatten the technical substance. If something is genuinely uncertain, say so. Do not invent certainty the team doesn't have.`,
    variables: [
      {
        name: "audience",
        label: "Audience",
        placeholder: "Head of Sales / CFO / board member",
        type: "text",
      },
      {
        name: "artifact",
        label: "Technical artifact",
        placeholder: "Code snippet, architecture diagram text, or engineering decision memo.",
        type: "textarea",
      },
      {
        name: "decision",
        label: "Decision the audience needs to make",
        placeholder: "Whether to approve Phase 2 engineering spend.",
        type: "textarea",
      },
    ],
    tags: {
      roles: ["VP of Engineering", "Chief Technology Officer"],
      categories: ["Ops"],
      topics: ["engineering", "writing"],
    },
    published_at: "2026-04-03",
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
