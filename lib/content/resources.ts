/*
  Resources library — curated reference material. Maintained the same way
  as modules, but treated differently in the UI: compact cards with
  direct links, grouped into Frameworks, Glossary, and Playbooks.
*/

export type Resource = {
  id: string;
  slug: string;
  title: string;
  category: "framework" | "glossary" | "playbook";
  kind: string; // human label: "Regulation", "Standard", "Term", "Playbook"
  jurisdiction?: string;
  summary: string;
  body_markdown: string;
  external_url?: string;
  published_at: string;
};

export const RESOURCES: Resource[] = [
  {
    id: "res-eu-ai-act",
    slug: "eu-ai-act",
    category: "framework",
    kind: "Regulation",
    jurisdiction: "European Union",
    title: "EU AI Act",
    summary:
      "The EU's risk-tiered regulation of AI systems. Classifies AI by risk (minimal, limited, high, unacceptable) and imposes obligations on providers and deployers accordingly.",
    body_markdown: `## What it is

The EU's horizontal AI regulation. It tiers AI systems by risk:

- **Unacceptable risk** — banned (e.g. social scoring by public authorities, real-time biometric ID in public spaces with narrow exceptions)
- **High risk** — regulated (e.g. critical infrastructure, education admissions, employment screening, creditworthiness, law enforcement, migration, justice)
- **Limited risk** — transparency obligations (e.g. chatbots disclosure, deepfake labeling)
- **Minimal risk** — unregulated

## When it applies

The Act has extraterritorial reach: if your AI system is placed on the EU market or its output is used in the EU, it applies — regardless of where you're headquartered.

## What to do about it

- Map your use cases against the four risk tiers today. Most enterprise AI falls in Limited or Minimal; a small number will be High-risk.
- For High-risk systems, document data governance, logging, human oversight, accuracy, and cybersecurity.
- For Limited-risk systems, make sure users know they're interacting with AI.
- Nominate a named person accountable for AI Act compliance in your organization.

## When ArcticBlue references this

We use EU AI Act risk tiers as a shared vocabulary when scoping pilots with enterprise legal teams — even for companies that don't operate in the EU. The vocabulary is clear, and it signals that we're thinking about deployment-time risk from day one.`,
    external_url: "https://artificialintelligenceact.eu/",
    published_at: "2026-04-10",
  },
  {
    id: "res-iso-42001",
    slug: "iso-42001",
    category: "framework",
    kind: "Standard",
    jurisdiction: "International (ISO)",
    title: "ISO/IEC 42001 · AI Management System",
    summary:
      "The international standard for establishing, implementing, maintaining, and continually improving an AI management system. Enterprise-friendly vocabulary for governing AI like you govern other risks.",
    body_markdown: `## What it is

ISO/IEC 42001 is the first international standard for AI Management Systems (AIMS). It's structured like ISO 27001 (information security) or ISO 9001 (quality) — a set of controls an organization can implement, document, and be certified against.

## What it covers

- **Context** — identifying the organization's AI risk posture and stakeholders
- **Leadership** — AI policy, roles, and accountability
- **Planning** — risk assessments, impact assessments
- **Support** — resources, competencies, communication, documentation
- **Operation** — controls for the AI lifecycle
- **Performance evaluation** — monitoring, measurement, audit
- **Improvement** — continuous improvement cycle

## Why enterprises like it

Enterprise legal and risk teams already speak ISO. 42001 makes AI governance a familiar topic: an auditable management system, not a novel policy exercise. Certification is optional but the structure is useful even without it.

## When ArcticBlue references this

When a client's risk function wants a concrete framework to evaluate our recommendations against. 42001 gives them a checklist; we map our recommendations to specific controls.`,
    external_url: "https://www.iso.org/standard/81230.html",
    published_at: "2026-04-12",
  },
  {
    id: "res-nist-aimrf",
    slug: "nist-ai-rmf",
    category: "framework",
    kind: "Framework",
    jurisdiction: "United States (NIST)",
    title: "NIST AI Risk Management Framework",
    summary:
      "The US National Institute of Standards and Technology's voluntary framework for managing AI risks. Organized around four core functions: Govern, Map, Measure, Manage.",
    body_markdown: `## What it is

NIST AI RMF 1.0 is a voluntary framework for managing AI risks across the lifecycle. It's structured around four functions:

- **Govern** — culture, policies, and accountability
- **Map** — context, use, and risks of the AI system
- **Measure** — analyze and assess risks
- **Manage** — allocate risk resources and respond to risks

## When it applies

The framework is voluntary and broad. It's used as a shared reference by US federal agencies, contractors, and increasingly by enterprise risk teams that need a risk vocabulary that isn't tied to a specific jurisdiction.

## Relationship to the EU AI Act

NIST is a risk-management *framework*; the EU AI Act is a *regulation*. Many organizations use NIST internally and reference EU AI Act externally when engaging with EU markets.

## When ArcticBlue references this

US-headquartered clients use NIST AI RMF as the internal vocabulary for evaluating AI risks. When we scope a pilot, we can point to specific Map and Measure activities we'll do inside the four-week cadence.`,
    external_url: "https://www.nist.gov/itl/ai-risk-management-framework",
    published_at: "2026-04-12",
  },
  {
    id: "res-hipaa",
    slug: "hipaa-ai",
    category: "framework",
    kind: "Regulation",
    jurisdiction: "United States",
    title: "HIPAA and AI",
    summary:
      "The US health privacy regulation and how it applies to AI systems handling protected health information (PHI).",
    body_markdown: `## What HIPAA does to AI scoping

HIPAA governs the use and disclosure of protected health information (PHI). For AI pilots in healthcare:

- **Training data.** PHI used to train or fine-tune a model must flow through a covered entity or business associate relationship. Vendor model training is often out of scope without a BAA.
- **Inference data.** Sending PHI to a third-party model is a disclosure. Most major model vendors offer enterprise terms with BAAs that permit this; confirm per vendor.
- **Outputs.** Model outputs containing PHI inherit PHI status.
- **Audit trail.** You need logs of what went in and what came out, retained per HIPAA's recordkeeping requirements.

## ArcticBlue's healthcare scoping pattern

- Identify whether the workflow touches PHI at all. Many "healthcare" use cases are operational and don't — those scope faster.
- If PHI is involved, confirm the model vendor BAA before scoping anything else.
- Structure the pilot so that PHI stays inside a tightly-scoped environment (private deployment, no retention, no training).
- Document the audit trail design up-front, not at the end.`,
    published_at: "2026-04-13",
  },
  {
    id: "res-glossary-rag",
    slug: "rag",
    category: "glossary",
    kind: "Term",
    title: "RAG — Retrieval-augmented generation",
    summary:
      "A pattern where a model retrieves relevant documents from a knowledge base and uses them as context for its response.",
    body_markdown: `## What it is

Retrieval-Augmented Generation (RAG) is a design pattern. Instead of relying on the model's trained knowledge, you:

1. Take the user's query
2. Retrieve relevant documents from your own knowledge base (using embeddings + vector similarity)
3. Include those documents in the prompt as context
4. Generate a response grounded in the retrieved content

## When it's the right choice

- Your knowledge base changes frequently (policies, product specs, playbooks)
- You need citations — the model should tell you where an answer came from
- You want to keep proprietary content inside your boundary instead of in the model's weights

## When it's not

- The question doesn't require recent or proprietary knowledge
- The information fits easily in a single system prompt
- Retrieval quality is the bottleneck and hasn't been addressed (bad retrieval is worse than no retrieval)

## ArcticBlue's take

Most enterprise "knowledge assistant" use cases are RAG patterns. Most of them underinvest in retrieval quality and overinvest in the generation layer. If the retrieval step surfaces the wrong paragraphs, no model will save you.`,
    published_at: "2026-04-05",
  },
  {
    id: "res-glossary-fine-tuning",
    slug: "fine-tuning",
    category: "glossary",
    kind: "Term",
    title: "Fine-tuning vs. prompting vs. RAG",
    summary:
      "Three ways to customize a model's behavior for your task. Fine-tuning changes the weights, prompting changes the instructions, RAG changes the context.",
    body_markdown: `## Three strategies, pick the right one

- **Prompting** — you design a system prompt and few-shot examples. Fast to iterate, cheap, reversible. Sufficient for most enterprise tasks.
- **RAG** — you retrieve relevant docs at query time and include them as context. Right when the knowledge base is large or changes often.
- **Fine-tuning** — you train the model on your examples, changing the weights. Right when prompting and RAG aren't hitting the quality bar, or when latency matters and you need the model to do something without a lot of context.

## The default order of operations

1. Start with prompting. Ship it if it works.
2. If the knowledge base is too big for a prompt, add RAG.
3. If you've exhausted prompting + RAG and still aren't at quality, consider fine-tuning.

Most teams skip steps 1 and 2 and jump to fine-tuning because it feels more serious. That's almost always a mistake.

## ArcticBlue's experience

Across our engagements, ~85% of production workloads work on prompting alone. ~12% use RAG. ~3% need fine-tuning. Mileage varies; the point is that the distribution is not what most organizations assume.`,
    published_at: "2026-04-06",
  },
  {
    id: "res-glossary-agent",
    slug: "agent",
    category: "glossary",
    kind: "Term",
    title: "Agent — what it means here",
    summary:
      "An AI system that plans, takes actions via tools, and iterates based on feedback from its environment. Distinct from a chatbot, which just answers questions.",
    body_markdown: `## What it is

An agent is an AI system that:

1. Plans — decides what to do next
2. Acts — calls tools or APIs in the environment
3. Observes — reads the result
4. Iterates — updates its plan and acts again

## What distinguishes an agent from a chatbot

A chatbot is reactive — it responds to your messages. An agent is proactive — it pursues a goal across multiple steps, decides when to use a tool, and decides when it's done.

## Agentic patterns worth knowing

- **ReAct** — reason, then act, then reason on the observation
- **Tool use** — the model calls named functions with structured arguments
- **Multi-agent** — multiple agents with different roles coordinate on a task

## When ArcticBlue recommends agents

When the work has these properties:
- Multiple steps, each requiring different tools or information
- The right next step depends on the result of the previous one
- The task is bounded enough that you can reason about failure modes

And not when:
- A single well-prompted generation would suffice
- The cost of a wrong action is high and hard to reverse
- You haven't built the tools the agent needs yet`,
    published_at: "2026-04-08",
  },
  {
    id: "res-playbook-pilot-scope",
    slug: "playbook-scoping",
    category: "playbook",
    kind: "Playbook",
    title: "Scoping a four-week AI pilot",
    summary:
      "The ArcticBlue scoping playbook. Answer three questions in writing before kickoff: decision, evidence, smallest experiment.",
    body_markdown: `## Three scoping questions

Before a pilot gets a dollar, answer these in writing.

1. **Decision.** What specific decision will this pilot answer? Name the person who will make it.
2. **Evidence.** What observation would change that person's mind? Be specific — name the metric, the threshold, the time window.
3. **Smallest experiment.** What is the smallest version of this pilot that could produce the evidence in four weeks? Scope, method, named owner.

If you can't answer all three, don't scope the pilot yet.

## The four-week discipline

Four weeks is the default pilot length for a reason. Shorter than that and you don't see second-order effects. Longer and the organization's attention drifts.

Four weeks forces scope discipline. Every pilot fits what fits, not what the team hoped.

## The kickoff artifact

A scoping doc that fits on one page, using [Templates → AI pilot scoping doc](/tools/templates/pilot-scoping-doc). Decision, evidence, smallest experiment, timeline, risks, rollback. Circulated to the sponsor, the owner, and one named reviewer from legal or risk.

## Readout, not report

At the end of four weeks, the pilot produces a readout — 3 slides, 10 minutes, one decision. Not a report. If you need a report, the pilot was the wrong scope.`,
    published_at: "2026-04-03",
  },
  {
    id: "res-playbook-governance",
    slug: "playbook-governance",
    category: "playbook",
    kind: "Playbook",
    title: "The five-decision governance posture",
    summary:
      "The minimum set of controls that keep legal, security, and compliance aligned without blocking the pilot.",
    body_markdown: `## Five decisions, made upfront

Governance done badly blocks every pilot. Governance done well is invisible. These five decisions, made *before* the pilot starts, are the difference.

1. **Data classification.** Which tier of data can this pilot touch? Get it in writing from CISO or delegate.
2. **Model and vendor selection.** Which models are already approved? Which need review?
3. **Human review.** Where in the workflow does a human sign off? Document on the process diagram.
4. **Audit trail.** What's logged? Who can query it? For how long?
5. **Incident response.** If the model produces something harmful, who's paged? What's the rollback?

Make these decisions in writing. They take two meetings. You do them upfront or you do them under duress.

## Matching the posture to the tier

Don't over-govern low-stakes pilots. Don't under-govern high-stakes ones.

| Tier | Use case | Posture |
|---|---|---|
| Low | Internal summarization, non-customer-facing | Lightweight: data classification + audit trail |
| Medium | Employee-facing, proprietary content | Add human review step + incident response |
| High | Customer-facing, regulated domain | Full five decisions + external counsel review |

The common failure is calibrating every pilot to the highest tier — which slows everything down — or the lowest tier — which creates real risk.`,
    published_at: "2026-04-04",
  },
  {
    id: "res-playbook-readout",
    slug: "playbook-readout",
    category: "playbook",
    kind: "Playbook",
    title: "The pilot readout",
    summary:
      "How ArcticBlue structures the end-of-pilot decision meeting. Three slides, ten minutes, one decision.",
    body_markdown: `## The three slides

Every four-week pilot ends with a three-slide readout and one decision.

1. **What we learned.** Three bullets. The decision-changing evidence.
2. **What we recommend.** One sentence, then the rationale.
3. **What happens next.** Named owner, named date, named follow-up checkpoint.

That's it. If you can't fit the readout on three slides, the pilot was the wrong scope.

## The three possible decisions

- **Go.** Productionize the pattern. Named owner, named budget, named timeline.
- **Iterate.** Another four-week pilot with a specific refinement. Named change, named evidence threshold.
- **Kill.** Shut it down. Document what we learned so we don't retread ground next time.

Killing a pilot is a successful outcome when the evidence pointed that way. Teams that can't kill pilots have a bigger problem than any single bad pilot.

## Who's in the room

- The sponsor (makes the decision)
- The owner (presents)
- One named reviewer from legal or risk
- The facilitator (ArcticBlue, or the internal owner of the practice)

No one else. The readout is short because the audience is tight.`,
    published_at: "2026-04-05",
  },
];

export function getResourceBySlug(slug: string) {
  return RESOURCES.find((r) => r.slug === slug);
}
