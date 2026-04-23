/*
  Demo company profiles + opportunity templates for the Mirror.

  Mirror currently runs on curated archetypes (fintech, insurance,
  enterprise_software). When the live Analyzer pipeline adds
  opportunity scoring, the orbital-field can populate from real
  company signals instead of these templates.
*/

export type MirrorOpportunity = {
  id: string;
  title: string;
  category: string;
  readiness: number;
  impact: number;
  effort: number;
  horizon: number;
  x: number;
  y: number;
  radius: number;
  angle: number;
  color: string;
  insight: string;
  experiment: string;
  risk: string;
};

export type MirrorArchetype = "fintech" | "insurance" | "enterprise_software";

export type MirrorCompany = {
  name: string;
  industry: string;
  signal: string;
  size: string;
  stack: string[];
  archetype: MirrorArchetype;
};

export const COMPANIES: Record<string, MirrorCompany> = {
  "stripe.com": {
    name: "Stripe",
    industry: "Financial Infrastructure",
    signal: "Payments platform scaling agentic commerce initiatives",
    size: "8,500 employees",
    stack: ["Ruby", "Go", "React", "Snowflake", "Kafka", "dbt"],
    archetype: "fintech",
  },
  "autodesk.com": {
    name: "Autodesk",
    industry: "Design Software",
    signal: "Generative design rollout across AEC + Manufacturing lines",
    size: "14,000 employees",
    stack: ["C++", "Python", "AWS", "Databricks", "Salesforce", "React"],
    archetype: "enterprise_software",
  },
  "metlife.com": {
    name: "MetLife",
    industry: "Insurance",
    signal: "Synthetic customer research + underwriting modernization",
    size: "45,000 employees",
    stack: ["Java", "SAP", "Azure", "Guidewire", "Tableau", "Snowflake"],
    archetype: "insurance",
  },
  "betterment.com": {
    name: "Betterment",
    industry: "Wealth Management",
    signal: "Automated advisor scaling personalization across cohorts",
    size: "500 employees",
    stack: ["Python", "Ruby", "React Native", "AWS", "Segment", "Looker"],
    archetype: "fintech",
  },
  "zurich.com": {
    name: "Zurich Insurance",
    industry: "Insurance",
    signal: "Global claims automation + broker enablement push",
    size: "60,000 employees",
    stack: ["Java", ".NET", "Guidewire", "Azure", "Salesforce", "SAP"],
    archetype: "insurance",
  },
};

export const ARCHETYPE_NAMES: Record<MirrorArchetype, string> = {
  fintech: "FinTech",
  insurance: "Insurance",
  enterprise_software: "Enterprise Software",
};

export const OPPORTUNITY_TEMPLATES: Record<MirrorArchetype, MirrorOpportunity[]> = {
  fintech: [
    { id: "ft-1", title: "Agentic customer support", category: "Service", readiness: 82, impact: 78, effort: 45, horizon: 30, x: 0.75, y: 0.35, radius: 180, angle: 35, color: "#8BB2ED",
      insight: "Tier-1 ticket volume drops 40–60% when agents are layered with retrieval over docs + policy graph. Your Zendesk + docs structure makes this tractable in 6 weeks.",
      experiment: "Shadow-deploy on 3 agent desks for 30 days. Measure first-contact resolution + customer CSAT vs. baseline.",
      risk: "Agent governance — need strict tool-boundaries for refund, account-close, and compliance-sensitive actions." },
    { id: "ft-2", title: "Merchant onboarding risk scoring", category: "Ops", readiness: 91, impact: 85, effort: 38, horizon: 45, x: 0.22, y: 0.28, radius: 220, angle: 142, color: "#FFD074",
      insight: "Your data foundation (Snowflake + Segment) is above the bar needed. Industry benchmark: 30–50% faster onboarding with no uplift in fraud rate.",
      experiment: "90-day pilot on a new geography. Shadow model vs. existing rules for 60 days, then progressively live.",
      risk: "Model drift needs weekly monitoring. Regulatory audit trail is non-negotiable." },
    { id: "ft-3", title: "Developer docs assistant", category: "Growth", readiness: 95, impact: 62, effort: 22, horizon: 20, x: 0.85, y: 0.72, radius: 160, angle: 278, color: "#A3D9B1",
      insight: "Your docs are the moat. An embedded assistant that reads docs + API + past questions converts 2–3x better on integration completion.",
      experiment: "A/B test on 10% of new signups for 30 days. Measure time-to-first-successful-API-call.",
      risk: "Hallucination on technical specifics is brand-damaging. Retrieval-grounded only, with citations." },
    { id: "ft-4", title: "Treasury forecasting agent", category: "Finance", readiness: 68, impact: 88, effort: 72, horizon: 90, x: 0.18, y: 0.75, radius: 240, angle: 215, color: "#D89AC9",
      insight: "Cash flow prediction at your scale compounds. Banks doing this well reduce idle float by 8–15% — material at your volume.",
      experiment: "Build against historical 3-year treasury data. Measure forecast accuracy vs. current model for one quarter.",
      risk: "Regulatory review substantial. Finance team adoption is the long pole, not the model." },
    { id: "ft-5", title: "Fraud ensemble upgrade", category: "Ops", readiness: 78, impact: 92, effort: 55, horizon: 60, x: 0.50, y: 0.18, radius: 260, angle: 85, color: "#FFD074",
      insight: "Your existing rules engine likely catches 70% of what modern fraud ensembles would catch. The marginal 30% is the revenue leak.",
      experiment: "Backtest against last 12 months of confirmed fraud before deploying live. Measure false-positive rate carefully.",
      risk: "False positives at your volume = real customer friction. Need a staged rollout with manual review." },
    { id: "ft-6", title: "Sales copilot for enterprise AE", category: "Growth", readiness: 74, impact: 71, effort: 42, horizon: 50, x: 0.65, y: 0.85, radius: 200, angle: 310, color: "#8BB2ED",
      insight: "Your enterprise AEs spend 40% of their time on prospect research. A copilot that watches calls + pipeline shrinks that to 15%.",
      experiment: "Deploy to 5 AEs for 45 days. Measure pipeline velocity + meeting prep time.",
      risk: "AE adoption is cultural — needs a champion, not a mandate." },
    { id: "ft-7", title: "Pricing experimentation platform", category: "Growth", readiness: 58, impact: 81, effort: 68, horizon: 75, x: 0.30, y: 0.55, radius: 150, angle: 190, color: "#D89AC9",
      insight: "Dynamic pricing with bandits beats static tiering at your scale. The blocker is usually organizational, not technical.",
      experiment: "Shadow-price 5% of new merchants, measure vs. control for 60 days before any go-live.",
      risk: "Political sensitivity around pricing shifts. Needs CFO air cover." },
    { id: "ft-8", title: "Voice-of-merchant synthesis", category: "Research", readiness: 85, impact: 66, effort: 28, horizon: 30, x: 0.90, y: 0.50, radius: 210, angle: 5, color: "#A3D9B1",
      insight: "You have rich support + NPS + product signal data that nobody's synthesizing weekly. A themed brief to product + marketing unlocks faster iteration.",
      experiment: "Process 90 days of merchant feedback, deliver 4 weekly briefs, measure product-team action rate.",
      risk: "Privacy review on recorded calls. Can be handled with proper scoping." },
  ],
  insurance: [
    { id: "in-1", title: "Claims triage automation", category: "Ops", readiness: 84, impact: 93, effort: 48, horizon: 50, x: 0.75, y: 0.28, radius: 220, angle: 65, color: "#FFD074",
      insight: "First-notice-of-loss triage is the highest-leverage AI opportunity in insurance today. Industry benchmark: 30–45% efficiency gain.",
      experiment: "4-week pilot on low-complexity auto claims, one adjuster team. Measure cycle time + accuracy.",
      risk: "Human-decision accountability varies by state. Regulatory review required." },
    { id: "in-2", title: "Synthetic customer research", category: "Research", readiness: 71, impact: 79, effort: 35, horizon: 40, x: 0.25, y: 0.22, radius: 180, angle: 155, color: "#D89AC9",
      insight: "We've seen synthetic persona approaches hit 83% accuracy vs. real panels. Cuts concept-testing cycles from 12 weeks to 4.",
      experiment: "Build synthetic panel for one target segment, validate against existing real-panel data.",
      risk: "Synthetic outputs require validation discipline. Not a replacement — a supplement." },
    { id: "in-3", title: "Underwriter decision support", category: "Ops", readiness: 77, impact: 82, effort: 52, horizon: 60, x: 0.85, y: 0.70, radius: 200, angle: 295, color: "#8BB2ED",
      insight: "Not replacing underwriter judgment — surfacing precedents + risk flags. Senior underwriters decide faster with better consistency.",
      experiment: "Deploy to senior cohort first, track time-to-decision + decision quality over 8 weeks.",
      risk: "Model recommendations can bias judgment if not framed carefully. Deployment copy matters." },
    { id: "in-4", title: "Document intake + extraction", category: "Ops", readiness: 94, impact: 68, effort: 32, horizon: 30, x: 0.18, y: 0.72, radius: 240, angle: 220, color: "#A3D9B1",
      insight: "Mature technology. Primary risk is integration with legacy systems, not the ML. Low-drama high-volume win.",
      experiment: "Deploy on one document class, measure extraction accuracy against manual review on 500-doc sample.",
      risk: "Integration with legacy systems is the long pole." },
    { id: "in-5", title: "Fraud ensemble", category: "Ops", readiness: 72, impact: 91, effort: 58, horizon: 65, x: 0.55, y: 0.18, radius: 250, angle: 90, color: "#FFD074",
      insight: "Insurance fraud at 5–10% of claims represents real savings. Layered ensembles beat single-model approaches.",
      experiment: "Backtest against last year's confirmed fraud cases before live deployment.",
      risk: "False-positive management critical. Need a customer-friction-first mindset." },
    { id: "in-6", title: "Broker self-service", category: "Service", readiness: 68, impact: 74, effort: 44, horizon: 55, x: 0.40, y: 0.82, radius: 170, angle: 250, color: "#8BB2ED",
      insight: "Brokers call in on the same 20 questions. A grounded Q&A tool with citation to policy docs cuts call volume 35%.",
      experiment: "Deploy read-only to 5% of brokers. Measure deflection + satisfaction vs. call baseline.",
      risk: "Regulatory exposure if bot mischaracterizes coverage. Strict grounding required." },
    { id: "in-7", title: "Predictive reserving", category: "Finance", readiness: 59, impact: 89, effort: 78, horizon: 90, x: 0.82, y: 0.48, radius: 160, angle: 355, color: "#D89AC9",
      insight: "Apply ML to reserving for capital efficiency. Actuarial and regulatory review substantial; not a quick deploy.",
      experiment: "Parallel-run ML reserves vs. current method on one line of business for two quarters.",
      risk: "Actuarial and regulatory review substantial. Multi-quarter commitment." },
    { id: "in-8", title: "Adjuster training sims", category: "People", readiness: 86, impact: 54, effort: 30, horizon: 25, x: 0.22, y: 0.52, radius: 140, angle: 175, color: "#A3D9B1",
      insight: "Generated claim scenarios stress-test adjuster judgment. Particularly valuable for new hires onboarding.",
      experiment: "50 scenarios with senior adjuster review, deploy to training cohort, measure competency gains.",
      risk: "Scenario quality dependent on expert review upfront." },
  ],
  enterprise_software: [
    { id: "es-1", title: "Generative design assistant", category: "Growth", readiness: 68, impact: 94, effort: 62, horizon: 75, x: 0.25, y: 0.28, radius: 240, angle: 148, color: "#D89AC9",
      insight: "Your customers' deepest unmet need. Works alongside the designer — doesn't replace craft. Category-defining if executed well.",
      experiment: "Deploy to 100 beta customers across AEC + Manufacturing. Measure design iteration velocity + retention.",
      risk: "High — this is core product surface. Quality bar matches customer expectations of Autodesk polish." },
    { id: "es-2", title: "Agentic customer support", category: "Service", readiness: 84, impact: 77, effort: 40, horizon: 45, x: 0.80, y: 0.32, radius: 200, angle: 42, color: "#8BB2ED",
      insight: "Your doc corpus is vast and under-utilized. Grounded agents solve 50%+ of tier-1 tickets and deflect community questions.",
      experiment: "Pilot on one product line, 30 days. Measure first-contact resolution + deflection rate.",
      risk: "Must cite sources. Hallucination on technical specifics damages engineer trust." },
    { id: "es-3", title: "Sales + pre-sales copilot", category: "Growth", readiness: 79, impact: 81, effort: 45, horizon: 55, x: 0.22, y: 0.65, radius: 180, angle: 208, color: "#FFD074",
      insight: "Enterprise deal cycles are 6–9 months. AE + SE teams spend 40%+ on research + deck prep. Big productivity unlock.",
      experiment: "Deploy to 10 AE/SE pairs for 60 days. Measure deal velocity + win rate vs. matched baseline.",
      risk: "AE adoption needs internal champions. Roll out via the top quartile, not mandate." },
    { id: "es-4", title: "Product usage insights", category: "Research", readiness: 88, impact: 72, effort: 35, horizon: 35, x: 0.78, y: 0.72, radius: 220, angle: 302, color: "#A3D9B1",
      insight: "You have rich telemetry. An AI layer that surfaces feature-use patterns + churn signals to PMs weekly unlocks faster product iteration.",
      experiment: "Build for 2 product lines, deliver weekly briefs for 8 weeks, measure PM action rate.",
      risk: "Privacy review on customer telemetry. Scopes cleanly." },
    { id: "es-5", title: "Marketing localization at scale", category: "Growth", readiness: 91, impact: 58, effort: 25, horizon: 25, x: 0.50, y: 0.88, radius: 150, angle: 270, color: "#A3D9B1",
      insight: "You launch in 14+ markets. Localization is the rate-limiting step for campaigns. Mature technology, easy win.",
      experiment: "Pilot with 3 highest-volume markets, human-in-loop QA, measure speed + quality vs. baseline.",
      risk: "Regulatory + cultural nuance still needs human review. Not fully autonomous." },
    { id: "es-6", title: "Competitive intelligence feed", category: "Ops", readiness: 82, impact: 65, effort: 28, horizon: 30, x: 0.88, y: 0.52, radius: 160, angle: 12, color: "#8BB2ED",
      insight: "Competitor tracking across pricing, product announcements, hiring signals. Weekly brief to PMM replaces 12hrs/week of manual work.",
      experiment: "Build for 3 named competitors, validate brief quality with PMM for 4 weeks.",
      risk: "Source quality uneven. Synthesis can hallucinate without strict grounding." },
    { id: "es-7", title: "Engineering productivity platform", category: "Ops", readiness: 86, impact: 85, effort: 52, horizon: 60, x: 0.15, y: 0.48, radius: 230, angle: 180, color: "#FFD074",
      insight: "Code assistants at your scale compound. Not just Copilot — a tuned platform for your C++ + Python monorepos.",
      experiment: "Deploy to 50 engineers for 60 days. Measure PR velocity + bug rate.",
      risk: "Security review substantial. Needs strict code-boundary enforcement." },
    { id: "es-8", title: "Pilot workshop program", category: "People", readiness: 72, impact: 61, effort: 22, horizon: 20, x: 0.55, y: 0.14, radius: 190, angle: 72, color: "#D89AC9",
      insight: "ArcticBlue's Practical Labs format. 10–20 person cohorts, 6 weeks, real projects. Compounds the above opportunities.",
      experiment: "Run one cohort across Product + Engineering. Measure projects shipped + capability growth.",
      risk: "None — this is the enablement layer that makes the other opportunities succeed." },
  ],
};

export function resolveCompany(input: string): MirrorCompany {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const match =
    COMPANIES[normalized] ||
    Object.values(COMPANIES).find((c) => c.name.toLowerCase() === normalized);
  if (match) return match;

  // Fallback — pick a random archetype
  const archetypes = Object.keys(OPPORTUNITY_TEMPLATES) as MirrorArchetype[];
  const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
  const base = normalized
    .replace(/\.(com|io|co|ai|org|net)$/, "")
    .split(".")
    .slice(-1)[0];
  return {
    name: base.replace(/^\w/, (c) => c.toUpperCase()),
    industry: ARCHETYPE_NAMES[archetype],
    signal: "Scaling AI capability across multiple business functions",
    size: "Enterprise",
    stack: ["Cloud-native", "Modern data stack", "Mixed SaaS estate"],
    archetype,
  };
}
