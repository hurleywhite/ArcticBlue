import type { Module } from "./types";

/*
  Seeded Learning Hub modules. Ten modules across all five types,
  tagged so the personalization layer in lib/personalization/score.ts
  has real matches to work with. Reading modules include real body
  markdown so the renderer has content to show.

  When Supabase is wired, modules flow from the modules table instead.
*/

export const MODULES: Module[] = [
  {
    id: "mod-01",
    slug: "experimentation-method",
    title: "The ArcticBlue experimentation method",
    subtitle: "Why we run small bets first — and how we scope them.",
    description:
      "The core framework ArcticBlue uses on every engagement. How to choose an experiment that answers a decision in under four weeks, what 'minimum viable evidence' means, and the four failure modes that kill AI pilots before they ship.",
    module_type: "reading",
    estimated_minutes: 18,
    author_name: "Joe Nussbaum",
    author_role: "Principal, ArcticBlue AI",
    body_markdown: `## Why most AI pilots die in the meeting that scopes them

Enterprise AI pilots fail in one of four ways, and three of those failures happen before a single line of code gets written. You can usually spot it in the scoping meeting.

- **Too ambitious**. The team picks a problem that would take nine months to solve even if the AI worked perfectly. Nothing ships.
- **Too vague**. The success criteria read like a mission statement. No one can tell whether the pilot worked.
- **Wrong decision-maker**. The team picks a problem whose answer depends on a VP who won't be in the room for the readout.
- **Unfalsifiable**. The pilot is structured so that it "succeeded" regardless of what the model actually did.

The fix is the same in every case: scope the experiment to answer a specific decision, on a specific timeline, with a specific person in the room.

## What "minimum viable evidence" means

At ArcticBlue we ask three questions when scoping any pilot:

1. **What decision are we making at the end of this?** If the answer is "we'll think about what to do next," stop. That isn't a decision, and the pilot will drift.
2. **What evidence would change our mind?** If you can't name the evidence up front, the pilot is unfalsifiable. Name it.
3. **What is the smallest experiment that produces that evidence?** Smallest means cheapest, fastest, narrowest scope. Not the best version of the experiment — the smallest version that still answers the question.

The output is usually a 3-4 week pilot on a single workflow or product line, with a named decision-maker and a named success criterion.

## The four-week default

ArcticBlue defaults to four weeks for a reason. Shorter than that and the team doesn't have time to observe second-order effects. Longer and the organization's attention drifts — and the pilot becomes a zombie project that neither fails nor succeeds.

Four weeks forces scope discipline. It kills the temptation to add one more feature, one more workflow, one more integration. What ships is whatever fits.

## What this looks like on the Canvas

The Canvas's "Smallest experiment" field on every opportunity card is not decoration. It is the single most important line on the card — because it's what turns a strategic opportunity into a bounded, scopeable pilot.

When you star an opportunity and build a roadmap, the experiment lines get sequenced into phases. Each phase is one ArcticBlue-style bet: a decision, evidence criteria, and a four-week horizon.

That is the method. Every module that follows teaches a sub-skill this method depends on.
`,
    tags: {
      roles: ["all"],
      categories: ["all"],
      topics: ["experimentation", "methodology", "scoping"],
      skill_level: "intro",
    },
    published_at: "2026-03-10",
  },
  {
    id: "mod-02",
    slug: "prompt-engineering-foundations",
    title: "Prompting foundations for enterprise work",
    subtitle: "Why clarity beats cleverness, and how to structure a prompt that holds up.",
    description:
      "The prompt patterns that survive review cycles and scale across a team. Role-context-task-format structure, worked examples, constraints and refusals, and when to break the rules.",
    module_type: "reading",
    estimated_minutes: 22,
    author_name: "Dana Rivera",
    author_role: "Facilitator, ArcticBlue AI",
    body_markdown: `## Why most prompts are bad

Most prompts written inside enterprises are bad in the same way: they over-direct the surface and under-specify the substance. A prompt says "write a professional email" but never says what decision the email is asking for, who the recipient is, what they already know, or what tone the sender usually uses.

The model fills the gaps with defaults. The defaults are almost always wrong for a specific business context.

## The four-part structure that holds up

Every prompt that survives more than one use has four things in it, in some order:

1. **Role** — who the model is playing. "You are an analyst reviewing first-pass draft memos for a chief of staff." Short. Specific.
2. **Context** — what the model needs to know that it wouldn't otherwise. The company, the audience, the prior decisions, the constraints. Include actual text — don't describe it.
3. **Task** — what to do. One sentence. If you need more than one sentence, split it into a sequence.
4. **Format** — what the output should look like. Length, sections, markdown, JSON. Be explicit or get burned.

This isn't a rule. It's a checklist that prevents the most common failures.

## Worked example: competitor brief

### Bad

> Summarize our top competitors.

### Why it fails

No definition of "top," no format, no audience, no length. You get a Wikipedia-flavored paragraph.

### Better

> You are writing for our CMO, who sees 40 of these briefs a quarter.
>
> **Context:** We sell mid-market CRM software. Our three most-watched competitors are [A, B, C]. Source material: the attached press-release digest from the last 30 days.
>
> **Task:** For each competitor, name the single most important move they made in the last 30 days and explain why it matters to our positioning.
>
> **Format:** Three bullets per competitor. Under 80 words per competitor. No hedge language.

The second version gets a usable brief on the first pass.

## When to break the rules

Short exploratory prompts — "what else should I consider?" — don't need this structure. Use it when the output has a specific job. Use it especially when the output will be read by someone who wasn't in the room when you wrote the prompt.

## The test that tells you a prompt is ready

Hand your prompt to a teammate. Ask them to guess what the output is supposed to look like. If they can't picture it within 15 seconds, the prompt is under-specified.
`,
    tags: {
      roles: ["all"],
      topics: ["prompting", "writing"],
      skill_level: "intro",
    },
    published_at: "2026-03-14",
  },
  {
    id: "mod-03",
    slug: "canvas-walkthrough",
    title: "How to read your Canvas",
    subtitle: "A short video walkthrough of the Opportunity Canvas.",
    description:
      "Joe walks through a live Canvas for a CFO in Financial Services — what the quadrants mean, how to re-frame with a different lens, and how to decide which three opportunities to star.",
    module_type: "video",
    estimated_minutes: 8,
    author_name: "Joe Nussbaum",
    author_role: "Principal, ArcticBlue AI",
    video_mux_playback_id: "placeholder",
    tags: {
      roles: ["all"],
      topics: ["canvas", "methodology"],
      skill_level: "intro",
    },
    published_at: "2026-03-20",
  },
  {
    id: "mod-04",
    slug: "exercise-scope-your-first-pilot",
    title: "Exercise · Scope your first pilot",
    subtitle: "Apply the ArcticBlue method to one opportunity you starred.",
    description:
      "A hands-on exercise. Pick one starred opportunity, draft the three scoping questions (decision, evidence, smallest experiment), then practice the draft in Tools. 25 minutes end to end.",
    module_type: "exercise",
    estimated_minutes: 25,
    author_name: "Dana Rivera",
    author_role: "Facilitator, ArcticBlue AI",
    exercise_prompt: `You are scoping an AI pilot using the ArcticBlue method.

Take one opportunity the learner starred on their Opportunity Canvas and produce:

1. The **decision** this pilot exists to answer (one sentence, names a specific person).
2. The **evidence** that would change the decision-maker's mind (two bullet points, one if yes and one if no).
3. The **smallest experiment** that could produce that evidence in four weeks (three bullet points: scope, method, owner).

Push back hard on anything that's too vague or too ambitious. Name failure modes explicitly. Keep the total response under 350 words.`,
    tags: {
      roles: ["all"],
      topics: ["experimentation", "scoping"],
      skill_level: "intro",
    },
    published_at: "2026-03-22",
  },
  {
    id: "mod-05",
    slug: "reading-ai-for-marketers",
    title: "Where AI actually helps marketing teams",
    subtitle: "Five use-cases that ArcticBlue has seen work — and two that don't.",
    description:
      "A sharply-opinionated reading module. The marketing functions where AI is table-stakes today (content ops, localization, attribution), the ones worth an experiment (synthetic audiences, VoC synthesis), and the ones most CMOs get wrong (generic personalization at scale, agentic sales outreach).",
    module_type: "reading",
    estimated_minutes: 16,
    author_name: "Joe Nussbaum",
    author_role: "Principal, ArcticBlue AI",
    body_markdown: `## What's table-stakes in marketing today

Three marketing workflows have crossed into "the laggard is the one not doing this" territory:

1. **Content operations.** Translation, localization, brand-compliant copy generation at catalog scale. Mature tech, proven workflow, pays back in weeks.
2. **Voice-of-customer synthesis.** Weekly theme extraction from support calls, reviews, and chat logs. Most teams have the data and no synthesis layer — that's the bottleneck, not the models.
3. **Attribution rebuild.** Replacing last-click with probabilistic multi-touch attribution. Politically expensive, technically straightforward. Typically a 20–30% reallocation of spend.

If your marketing organization is not doing at least two of these by mid-2026, you're behind.

## What's worth an experiment

Two use-cases have real promise but need honest evaluation before a full rollout:

1. **Synthetic audience testing.** Testing creative concepts against modeled customer segments before spend. Directionally excellent; validate against live panels before you make big decisions on its output.
2. **Agentic competitor intel.** Weekly automated briefs on a defined competitor set. Works when the source list is curated. Fails when it's "the whole internet."

Pilot these for a quarter, evaluate against current baseline, decide.

## What most teams get wrong

Two patterns show up in pilot after pilot that don't work:

1. **Generic personalization at scale.** "Let's personalize every touchpoint for every user." The math doesn't work. The complexity of that pipeline eats the gains it produces. Pick three cohorts and personalize for them, not 10,000.
2. **Agentic outbound sales.** Fully autonomous cold outreach. The deliverability and brand risks have dwarfed the gains every time we've evaluated it. Use AI to make human outbound better, not to replace it.

## The pattern

The table-stakes workflows share one thing: they take existing data the team already has, and they do synthesis or execution work that was volume-limited by human time. That's the pattern to look for. Anything that requires generating net-new judgment (not synthesis) is where you should be skeptical.
`,
    tags: {
      roles: ["Chief Marketing Officer", "Chief Revenue Officer", "Head of Strategy"],
      categories: ["Growth", "Ops"],
      topics: ["marketing", "use-cases"],
      skill_level: "intermediate",
    },
    published_at: "2026-03-27",
  },
  {
    id: "mod-06",
    slug: "reading-operations-ai",
    title: "AI in operations: where the money is",
    subtitle: "Claims, underwriting, document intake, fraud — the operations wins.",
    description:
      "An operations-focused deep-read. Where AI has delivered measurable ROI in insurance, logistics, and back-office workflows. Decision support vs. decision automation — and why the distinction matters legally.",
    module_type: "reading",
    estimated_minutes: 19,
    author_name: "Priya Menon",
    author_role: "Facilitator, ArcticBlue AI",
    body_markdown: `## Operations is where AI earns out fastest

Three operations workflows are delivering measurable ROI at scale right now:

- **Document intake and extraction.** OCR plus structured extraction from policy docs, medical records, and third-party reports. 9/10 on tech maturity. Integration effort is the long pole, not the ML.
- **Claims triage.** Routing and first-pass assessment. 30–45% reduction in first-touch time in insurance.
- **Fraud detection.** Ensemble approaches — pattern detection + anomaly flagging + network analysis. 5–10% fraud rate across claims translates to real savings.

What they share: existing volume-constrained work where the bottleneck was human time, and where a model failure degrades gracefully (flagging for human review, not auto-approving).

## Decision support vs. decision automation

The single most important design question in operations AI is: **does the AI decide, or does it help a human decide?**

Decision support keeps the human in the loop. The AI surfaces precedents, flags anomalies, summarizes documents. A human makes the call and carries the accountability.

Decision automation removes the human. The AI approves, denies, routes without review.

In regulated industries — insurance, healthcare, financial services — the legal exposure of decision automation is often larger than the ROI. Most mature operations AI deployments are decision support. This isn't a limitation; it's a design choice that survives audit.

## The pilot pattern that works

ArcticBlue-style pilots in operations follow one pattern:

1. Pick a low-complexity subset of the workflow.
2. Run AI-augmented vs. baseline in parallel for four weeks.
3. Measure cycle time, accuracy, and exception rate.
4. Decide: roll out, iterate, or kill.

That's it. Don't over-engineer the pilot. The first decision is whether to iterate, not whether to deploy.
`,
    tags: {
      roles: ["VP of Operations", "Chief Technology Officer"],
      industries: ["Insurance", "Healthcare", "Financial Services"],
      categories: ["Ops"],
      topics: ["operations", "use-cases"],
      skill_level: "intermediate",
    },
    published_at: "2026-04-02",
  },
  {
    id: "mod-07",
    slug: "workshop-april",
    title: "Practical Labs · April session",
    subtitle: "Monthly 90-minute live lab. This month: scoping a product brief with AI.",
    description:
      "Live, facilitated 90-minute lab. Bring a real in-flight deliverable. We work it with current tools in real time, with peers and an ArcticBlue facilitator. No slides.",
    module_type: "live_workshop",
    estimated_minutes: 90,
    author_name: "Dana Rivera",
    author_role: "Facilitator, ArcticBlue AI",
    workshop_date: "2026-04-29T17:00:00Z",
    workshop_registration_url: "https://arcticblue.ai/labs/april",
    tags: {
      roles: ["Head of Product", "Chief Marketing Officer", "Chief Revenue Officer"],
      topics: ["product", "writing"],
      skill_level: "intermediate",
    },
    published_at: "2026-04-01",
  },
  {
    id: "mod-08",
    slug: "external-anthropic-docs",
    title: "Anthropic's tool-use docs",
    subtitle: "A curated external reference, with our POV on why you should read it.",
    description:
      "Anthropic's official tool-use documentation is the clearest public write-up of how to give a model reliable access to functions. Start at the Overview, then Tool Result Schema, then skim the Streaming section.",
    module_type: "curated_external",
    estimated_minutes: 25,
    author_name: "Hurley White",
    author_role: "ArcticBlue AI",
    external_url: "https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview",
    body_markdown: `**Why this matters.** If you're thinking about agentic workflows — competitor monitoring, document pipelines, research synthesis — tool use is how the model stops being a chat partner and starts being a participant in your systems. Most agentic pilots fail because the team didn't design the tool schema carefully. This doc gets that right.

**What to skim and what to read.**
- *Read* the Overview and Tool Result Schema sections end to end.
- *Skim* Streaming and Parallel Tool Use — return to them when you're implementing.
- *Skip* the model-specific pricing tables — ArcticBlue engagements usually reason about cost at a different granularity.

**Where this fits.** Pair this with the Prompting Foundations module — a well-structured tool-use prompt is a well-structured prompt plus a tool contract.`,
    tags: {
      roles: ["Chief Technology Officer", "VP of Engineering", "Head of Product"],
      topics: ["agents", "tool-use", "engineering"],
      skill_level: "advanced",
    },
    published_at: "2026-04-08",
  },
  {
    id: "mod-09",
    slug: "exercise-prompt-a-competitor-brief",
    title: "Exercise · Write a weekly competitor brief prompt",
    subtitle: "Apply the four-part prompt structure to a real recurring task.",
    description:
      "Design a prompt that produces a reusable weekly competitor brief. You pick the industry and the competitors; Practice helps you iterate on role, context, task, and format until the output is readout-ready.",
    module_type: "exercise",
    estimated_minutes: 30,
    author_name: "Dana Rivera",
    exercise_prompt: `You are helping the learner draft a weekly competitor brief prompt they can hand off to a junior analyst (or automate).

Walk them through the four-part prompt structure:

1. **Role** — who the model is playing for this task.
2. **Context** — the specific competitors and source material.
3. **Task** — what to produce each week (be concrete about what "a brief" means).
4. **Format** — length, bullets vs. prose, structure per competitor.

Write a draft. Then ask the learner: "what's missing?" Iterate at least twice. Stop when the prompt would produce a usable brief without any clarifying questions.`,
    tags: {
      roles: ["Chief Marketing Officer", "Head of Strategy", "Head of Product"],
      topics: ["prompting", "competitive-intelligence"],
      skill_level: "intermediate",
    },
    published_at: "2026-04-10",
  },
  {
    id: "mod-10",
    slug: "reading-governance-basics",
    title: "AI governance for teams that ship",
    subtitle: "The minimum governance posture that keeps pilots moving.",
    description:
      "Governance done badly blocks every pilot. Governance done well is invisible. The lightweight controls that keep legal, security, and compliance aligned without slowing the team to a crawl.",
    module_type: "reading",
    estimated_minutes: 14,
    author_name: "Priya Menon",
    author_role: "Facilitator, ArcticBlue AI",
    body_markdown: `## Governance is a speed feature, not a brake

Teams that treat governance as an afterthought get blocked at the deploy step. Teams that treat governance as the whole conversation never ship anything. The work is in the middle — the minimum set of controls that keep legal, security, and compliance aligned without slowing the team to a crawl.

## The five things to agree on before the pilot starts

- **Data classification.** Which tier of data is this pilot allowed to touch? Get an explicit answer from the CISO or their delegate, in writing, before kickoff.
- **Model and vendor selection.** Which models are already approved under enterprise agreements? Which need review? Don't pick a model mid-pilot.
- **Human review.** Where in the workflow does a human sign off? Document it on the process diagram, not in a memo.
- **Audit trail.** What's logged? Who can query it? For how long is it retained? One-page runbook, not a policy document.
- **Incident response.** If the model generates something harmful or wrong, who's paged? What's the rollback?

This is five decisions. They take two meetings. You do them up-front or you do them under duress.

## Frameworks worth citing

ArcticBlue defaults to three external frames when talking to enterprise legal teams:

- **EU AI Act** — useful for risk classification even if you don't operate in the EU
- **ISO 42001** — the AI management system standard; enterprise-friendly vocabulary
- **NIST AI Risk Management Framework** — the US federal default

Name the frames. Legal teams relax when they know the vocabulary you're using is theirs.

## The common governance failure

The most common failure is not under-governance — it's governance that's calibrated for the wrong risk tier. A low-stakes internal summarization tool does not need the same controls as an external customer-facing recommender. Both need governance; the controls are different.

If every pilot gets the same governance posture, no pilot moves fast enough.
`,
    tags: {
      roles: ["Chief Technology Officer", "VP of Operations", "Head of Strategy"],
      topics: ["governance", "risk", "compliance"],
      skill_level: "intermediate",
    },
    published_at: "2026-04-15",
  },
];

export function getModuleBySlug(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}
