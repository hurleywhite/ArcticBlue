import type { UseCase } from "./types";

/*
  Seven anonymized case studies. Each has the full three-part narrative
  (challenge/approach/outcome), a 30-second pitch, and indicator flags
  for the one-pager PDF and slides. In production these come from the
  use_cases table; seeded here so the library and detail pages render
  without a DB.
*/

export const USE_CASES: UseCase[] = [
  {
    id: "uc-01",
    slug: "insurer-synthetic-personas",
    title: "Synthetic personas for policy-servicing copy testing",
    anonymized_client_label: "Global insurer",
    headline_metric: "83% accuracy vs. live panels",
    summary:
      "A global insurer needed to ship 40% more transactional communications per quarter without increasing the review burden on legal or customer-experience teams. ArcticBlue stood up a synthetic persona panel calibrated to their real customer base and used it to pre-screen copy before live panel testing.",
    challenge_markdown: `The insurer's marketing ops team was shipping roughly 40 transactional communications per quarter — renewal notices, policy-change confirmations, claims-status updates. Every piece went through three rounds of live panel testing before release, which consumed six weeks of calendar time per communication and a substantial research budget.

The team had a goal of increasing communication volume by 40% year-over-year without increasing testing cost. The live panel process was the bottleneck.

They had tried traditional A/B testing in production, but regulatory constraints on what could be served to real customers limited the design space. They needed a way to screen copy before it reached a live panel.`,
    approach_markdown: `ArcticBlue designed a four-week experiment structured around three questions:

1. Could a synthetic persona panel, calibrated to the insurer's real customer demographics and known behavioral segments, predict the outcome of a live panel with usable accuracy?
2. How much calibration data was required to hit that accuracy?
3. At what stage of copy development should the synthetic panel be used — early concept, draft, or near-final?

The approach had four stages:

- **Calibration.** Build a synthetic panel from 2,400 customer profiles constructed from the insurer's anonymized customer research archive. Each profile had behavioral, demographic, and policy-type attributes.
- **Backtest.** Run 18 historical communications that had already gone through live panel testing through the synthetic panel. Compare outcomes.
- **Parallel run.** For 8 weeks, run every new communication through the synthetic panel in parallel with the live panel. Never act on the synthetic results alone.
- **Cut-over decision.** At the end of 8 weeks, evaluate whether to use synthetic as a pre-screen for live panels.`,
    outcome_markdown: `The backtest showed 83% directional agreement between synthetic and live panels on the binary "ship vs. revise" decision. Agreement was highest on communications with clear emotional stakes (claims denials, policy cancellations) and lowest on routine informational updates — suggesting the calibration was capturing the segments that mattered most.

The insurer adopted the synthetic panel as a pre-screen for all transactional communications starting in Q3. Live panel testing is now reserved for communications that either (a) introduce a new regulatory disclosure, (b) target a newly-identified segment, or (c) fail synthetic screening and need diagnosis.

Downstream effects in the first two quarters after cut-over:

- **Testing cycle time** reduced from 6 weeks to 9 days on average
- **Live panel budget** reduced by 42%; redirected to broader qualitative research
- **Communication volume** increased 38% year-over-year — hit the target without additional review burden

The insurer's CISO and legal counsel signed off on the approach on the condition that a live panel review is always the final gate on any customer-facing copy. That guardrail has held for 14 months.`,
    pitch_30sec:
      "A global insurer needed to ship 40% more transactional communications per quarter without blowing out testing cost. We built a synthetic persona panel calibrated to their customer base, backtested it at 83% directional agreement with live panels, and deployed it as a pre-screen. Testing cycle dropped from six weeks to nine days. Live panel budget dropped 42%.",
    one_pager_available: true,
    slides_available: true,
    tags: {
      industries: ["Insurance", "Financial Services"],
      roles: ["Chief Marketing Officer", "Head of Strategy"],
      categories: ["Growth", "Research"],
      topics: ["synthetic-research", "copy-testing"],
    },
    published_at: "2026-02-10",
  },
  {
    id: "uc-02",
    slug: "design-software-synthetic-users",
    title: "Synthetic user testing for new feature concepts",
    anonymized_client_label: "Design software leader",
    headline_metric: "Decisions same week, not same month",
    summary:
      "A design-software company's product org was losing six weeks per feature to user research coordination. ArcticBlue built a synthetic user testing layer that ran in parallel with live research, compressing the concept-validation phase while preserving live research as a final gate.",
    challenge_markdown: `The company had four product teams, each shipping roughly one major feature per quarter. Every feature went through user research at concept stage, draft stage, and pre-release — three rounds of recruitment, moderation, and synthesis that took about six weeks per round.

The product VP wanted to compress concept-stage validation without degrading the quality of the feedback. The research team was skeptical — their objection was that synthetic users couldn't capture the emotional texture of how professional designers react to new tools.`,
    approach_markdown: `The experiment was scoped to answer one question: could synthetic user testing produce the same "yes / no / maybe" recommendations on concept-stage features as live testing did, for the specific population of professional designers the company targets?

The approach:

- **Persona construction.** Build 12 synthetic designer personas covering the company's top three customer segments (enterprise motion designers, indie product designers, studio-based illustrators), grounded in the company's own customer research archive and publicly available designer interviews.
- **Parallel run.** For six features already queued for concept-stage testing, run both synthetic and live testing simultaneously. Keep results blind from each other until both completed.
- **Readout comparison.** Compare the PM's downstream decision based on synthetic results alone vs. their decision based on live results.

The research team's objection was taken seriously — the PMs who would receive the synthetic readouts were explicitly instructed to look for places where the synthetic results felt "thin" and flag them.`,
    outcome_markdown: `On the binary "ship this feature concept vs. kill it" decision, synthetic and live testing agreed on 5 of 6 features. On the one disagreement, synthetic recommended killing a feature that live testing said to ship — the research team flagged this as exactly the kind of case where synthetic panels miss the emotional nuance of real designer reaction.

The company adopted a hybrid workflow:

- **Concept stage** — synthetic testing, results in 3–5 days
- **Draft stage** — live testing, results in 4 weeks
- **Pre-release** — live testing with beta users

The concept-stage compression is where the ROI lives. PMs now make the kill-or-continue decision within a week of having the concept drafted, instead of waiting six weeks.

Since cut-over, the company has run 22 concept-stage features through the synthetic workflow. In aggregate, concept-stage decisions now land the same week the concept is drafted.`,
    pitch_30sec:
      "A design-software leader was losing six weeks per feature to concept-stage research. We built synthetic personas calibrated to their designer customer base, ran parallel against live testing, and agreed on 5 of 6 kill-or-continue decisions. They now decide concept-stage the same week they draft — not the same month.",
    one_pager_available: true,
    slides_available: true,
    tags: {
      industries: ["Technology", "Professional Services"],
      roles: ["Head of Product", "Chief Marketing Officer"],
      categories: ["Research", "Growth"],
      topics: ["synthetic-research", "product-validation"],
    },
    published_at: "2026-02-22",
  },
  {
    id: "uc-03",
    slug: "nonprofit-vetting-workflow",
    title: "AI vetting workflow for grantee applications",
    anonymized_client_label: "Nonprofit advocacy org",
    headline_metric: "Full coverage, no review drift",
    summary:
      "A nonprofit with 400+ volunteer application reviewers needed consistency across reviewers without adding staff. ArcticBlue deployed a standardized AI-assisted pre-screen that surfaces edge cases to paid staff and lets volunteers focus on substantive review.",
    challenge_markdown: `The nonprofit ran a grantee application program that received roughly 1,200 applications per cycle. Initial review was done by 400+ volunteer reviewers working from a checklist. The program's three paid staff members handled escalations, edge cases, and final decisions.

The problem: volunteer reviewers drifted. Reviewers who had done the work for several cycles developed their own heuristics; new reviewers applied the checklist strictly but missed context. Applications that should have been escalated weren't; applications that should have been approved at first-pass were unnecessarily escalated.

Staff were spending a disproportionate amount of time on applications that volunteer reviewers had mishandled — often in ways that weren't visible until late in the cycle.`,
    approach_markdown: `The scope was narrow: add an AI-assisted pre-screen layer that applied the reviewer checklist consistently, flagged edge cases, and produced a one-page summary to hand to the volunteer. The AI did not make a decision; it produced context.

Three-week experiment:

- **Week 1.** Calibration. Trained the pre-screen on 300 historical applications and their final outcomes. Reviewed output with staff.
- **Week 2.** Shadow mode. Applied the pre-screen to a new cycle's first 200 applications. Did not show results to volunteer reviewers. Staff audited the outputs.
- **Week 3.** Live cut-over for a subset of reviewers. Compared volunteer decisions with and without the pre-screen summary in hand.

The guardrail was clear: the AI never signals approve/deny. It surfaces "this application has the following attributes, and here are the three checklist items that most likely need attention."`,
    outcome_markdown: `Volunteers using the pre-screen summary approved the same applications as staff at a significantly higher rate than volunteers who didn't have the summary. The escalation rate to staff went down because volunteers had enough context to handle edge cases themselves.

Staff now spend their time on genuinely difficult cases — applications with regulatory complications, policy-sensitive content, or novel program fits — instead of correcting volunteer mistakes.

Since deployment, every application in every cycle has received the pre-screen. No drift across reviewers has been observed across three cycles.`,
    pitch_30sec:
      "A nonprofit had 400 volunteer reviewers with drifting quality. We deployed an AI-assisted pre-screen — not a decision layer, a context layer — that surfaces attributes and flags edge cases. Volunteers now decide consistently; staff focus on genuinely hard cases. Three cycles in, no reviewer drift.",
    one_pager_available: true,
    slides_available: false,
    tags: {
      industries: ["Professional Services"],
      roles: ["VP of Operations", "Head of Strategy"],
      categories: ["Ops", "People"],
      topics: ["workflow", "quality"],
    },
    published_at: "2026-03-04",
  },
  {
    id: "uc-04",
    slug: "edtech-sales-enrichment",
    title: "Sales enrichment pipeline for inbound leads",
    anonymized_client_label: "Edtech platform",
    headline_metric: "3x enrichment in under a minute",
    summary:
      "An edtech platform was losing inbound leads to stale enrichment — sales reps would get a lead from the ICP filter but no firmographic context. ArcticBlue stood up a multi-source enrichment pipeline that fills the context before the lead hits the rep's queue.",
    challenge_markdown: `The edtech platform's inbound funnel produced roughly 400 qualified leads per week. Sales development reps (SDRs) were supposed to contact each lead within two hours, but 60% of leads didn't have enough firmographic context to write a personalized outreach — so SDRs spent the first 15 minutes doing manual enrichment before they could send a message.

The math was bad. If it takes 15 minutes to enrich a lead and two minutes to send the outreach, the ratio is wrong. Leads went stale; response rates suffered.`,
    approach_markdown: `The pipeline ArcticBlue built pulled from four sources per lead (public company data, recent news, funding status, platform usage signals) and produced a structured summary within 60 seconds of the lead being captured. The SDR saw the enrichment before they ever saw the raw lead.

Scoped four-week experiment:

- **Week 1.** Source selection and pipeline design. Which sources, what order, what timeouts.
- **Week 2.** Build and test against a 200-lead historical batch.
- **Week 3.** Shadow mode — run enrichment on new inbound without showing to SDRs.
- **Week 4.** Cut-over for half the SDR team; compare outreach response rates.`,
    outcome_markdown: `Response rates on outbound messages increased 34% for the SDRs using enriched leads vs. the control group. SDR time-to-first-contact dropped from 45 minutes to 12 minutes on average.

The enrichment pipeline runs on every inbound lead. SDRs now escalate only when an enriched lead has attributes outside the ICP — a signal that the inbound source needs tuning, not the lead itself.`,
    pitch_30sec:
      "An edtech platform was losing inbound leads to stale enrichment. We built a four-source enrichment pipeline that produces structured context in under a minute. Response rates went up 34%; time-to-first-contact went from 45 minutes to 12. Every inbound lead now gets the context before the rep does.",
    one_pager_available: true,
    slides_available: true,
    tags: {
      industries: ["Technology"],
      roles: ["Chief Revenue Officer", "Head of Strategy"],
      categories: ["Growth", "Ops"],
      topics: ["sales", "enrichment"],
    },
    published_at: "2026-03-11",
  },
  {
    id: "uc-05",
    slug: "insurer-launch-compression",
    title: "Product launch compressed from 18 months to 5",
    anonymized_client_label: "Fortune 50 insurer",
    headline_metric: "5 months vs. 18",
    summary:
      "A Fortune 50 insurer's product launch cycle was 18 months from concept to in-market. ArcticBlue redesigned the process around AI-assisted research, drafting, and testing rituals to compress it to five months — without cutting any compliance gates.",
    challenge_markdown: `The insurer's product launch cycle averaged 18 months from concept approval to in-market. Of that, roughly seven months was spent on market research and regulatory review — legitimate work that moved at the pace of humans reading documents and writing summaries.

The CEO wanted launches faster. The CRO was skeptical that the timeline could compress without sacrificing either regulatory rigor or product quality. Both were right to be cautious; the compliance gates existed for a reason.`,
    approach_markdown: `The engagement wasn't a single pilot — it was a rebuild of the launch process. ArcticBlue worked with the insurer's product and compliance leadership to identify the specific steps that were bottlenecked by human document-reading throughput, and added AI assistance at each one.

Four areas of intervention:

- **Market research synthesis.** Assisted synthesis from existing research archives, reducing research-write-up from 6 weeks to 1.
- **Regulatory document review.** Decision-support tools for compliance analysts to identify relevant precedents faster. Compliance still made every call.
- **Drafting assistance.** For marketing copy, training materials, and internal comms — drafting workflows that produced first drafts in hours instead of weeks.
- **Testing workflow compression.** Synthetic pre-screening on transactional comms (see related case studies).

Every compliance gate stayed in place. No sign-off was removed. The compression came from reducing the time between gates, not from removing them.`,
    outcome_markdown: `Two launches under the new process. First launch hit market in 6 months; second landed at 5. The CRO's independent audit confirmed that no compliance gate was shortened — every sign-off happened, just on a faster ramp.

The insurer has adopted the approach as the default for all new product launches. The legacy 18-month process is reserved for launches with unusual regulatory complexity.`,
    pitch_30sec:
      "A Fortune 50 insurer's 18-month launch cycle was eating its market opportunities. We rebuilt the process with AI assistance at every human-document-reading bottleneck, kept every compliance gate in place, and landed the second launch in 5 months. Compliance audit passed; process is now the default.",
    one_pager_available: true,
    slides_available: true,
    tags: {
      industries: ["Insurance", "Financial Services"],
      roles: ["Chief Marketing Officer", "Head of Product", "Chief Revenue Officer"],
      categories: ["Growth", "Ops"],
      topics: ["launch", "process-redesign"],
    },
    published_at: "2026-03-18",
  },
  {
    id: "uc-06",
    slug: "healthcare-call-resolution",
    title: "Call resolution time reduced 45% with in-call assistance",
    anonymized_client_label: "Healthcare call center",
    headline_metric: "45% faster resolution",
    summary:
      "A healthcare call center's average handle time was 11 minutes and first-call resolution was 62%. ArcticBlue deployed a real-time in-call assistance tool that surfaces relevant policy documents, coverage details, and playbook steps to the agent in real time.",
    challenge_markdown: `The call center handled roughly 8,000 calls per week, mostly coverage and claims inquiries. Average handle time was 11 minutes. First-call resolution was 62%. The remaining 38% of calls generated either a callback or an escalation.

The gap wasn't agent skill — new agents were trained on a 400-page policy manual, and veterans had developed their own shortcuts. The gap was search. When a caller asked about a specific policy edge case, the agent's ability to find the right answer in the 400-page manual varied wildly.`,
    approach_markdown: `Four-week pilot with one team of 12 agents, in a controlled cohort.

- **Week 1.** Indexed the policy manual, common edge cases, and historical call resolution notes. Built the real-time retrieval layer.
- **Week 2.** Shadow mode — agents saw the assistance but could ignore it. Tracked what they looked at vs. acted on.
- **Week 3.** Full cut-over for the pilot cohort. Tracked handle time, first-call resolution, and agent satisfaction.
- **Week 4.** Hardened, fixed issues, prepared rollout plan.

The design choice that mattered: the assistant never spoke to the caller and never auto-answered. It surfaced candidate policy excerpts to the agent on screen. The agent chose what to use.`,
    outcome_markdown: `Average handle time dropped from 11 minutes to 6. First-call resolution increased from 62% to 81%. Agent satisfaction survey scores went up — agents reported that they felt more confident handling unfamiliar cases because they weren't hunting the manual in real time while a caller was on the line.

The pilot expanded to all 160 agents over the following quarter. The assistance layer is now part of the standard agent console.`,
    pitch_30sec:
      "A healthcare call center had 11-minute handle times and 62% first-call resolution. We built a real-time assistance layer that surfaces policy excerpts to the agent on-screen — never to the caller, never auto-answering. Handle time dropped to 6 minutes; first-call resolution went to 81%. Agents are more confident, not less.",
    one_pager_available: true,
    slides_available: true,
    tags: {
      industries: ["Healthcare"],
      roles: ["VP of Operations", "VP of Customer Success"],
      categories: ["Ops", "Service"],
      topics: ["customer-service", "real-time-assist"],
    },
    published_at: "2026-03-25",
  },
  {
    id: "uc-07",
    slug: "government-executive-upskilling",
    title: "450+ executives upskilled through facilitated AI program",
    anonymized_client_label: "Government agency",
    headline_metric: "450+ executives · 6 cohorts",
    summary:
      "A large government agency needed to upskill senior executives on AI fast. ArcticBlue designed a cohort-based program combining executive workshops, role-based labs, and ongoing enablement through the ArcticMind platform.",
    challenge_markdown: `A federal agency's leadership wanted every senior executive (GS-15 and above) to have a working understanding of where AI fit into their area of responsibility — not a general briefing, but role-specific fluency. They had roughly 450 executives across program areas as different as procurement, policy analysis, and citizen-facing service delivery.

One-off workshops don't scale that way. Self-paced courseware doesn't stick. They needed a cohort-based program with enough depth to produce real fluency but enough breadth to cover every role.`,
    approach_markdown: `Six cohorts, 75 executives each, over nine months. Each cohort followed the same arc:

- **Week 1** — Executive orientation workshop. Half-day. Strategic frame.
- **Weeks 2–8** — Weekly role-based labs. 90 minutes each. Different content per role-family: procurement execs worked through RFP analysis; policy analysts worked through legislative summary; service delivery execs worked through citizen-facing use cases.
- **Weeks 9–12** — Capstone project. Each executive identified one AI opportunity in their own area of responsibility and produced a scope document. Reviewed in a peer session with a facilitator.
- **Ongoing** — ArcticMind platform access for continuous learning.

ArcticBlue facilitators led every cohort. The platform filled the gap between live sessions.`,
    outcome_markdown: `All 450 executives completed at least the orientation and 4 role-based labs. 382 completed all 12 weeks and delivered a capstone. The capstone artifacts became the agency's initial AI pilot pipeline — several capstones became funded projects in the following fiscal year.

The platform adoption past the program was the real signal: 60% of graduates logged in at least monthly for the six months following their cohort.`,
    pitch_30sec:
      "A government agency needed to upskill 450 senior executives with role-specific fluency. We ran six facilitated cohorts of 75 each — orientation, role-based labs, capstone project. 382 completed the full program; their capstones became the next fiscal year's AI pilot pipeline. Platform adoption held past the program end.",
    one_pager_available: true,
    slides_available: false,
    tags: {
      industries: ["Professional Services"],
      roles: ["Head of Human Resources", "Head of Strategy"],
      categories: ["People"],
      topics: ["upskilling", "program-design"],
    },
    published_at: "2026-04-04",
  },
];

export function getUseCaseBySlug(slug: string) {
  return USE_CASES.find((u) => u.slug === slug);
}
