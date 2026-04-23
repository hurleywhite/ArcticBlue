/*
  Demo canvas data — pulled from prototype/opportunity-canvas.html.
  In production these will come from Supabase (canvas_templates +
  canvas_opportunities). Kept here so the Canvas UI is self-contained
  until the DB wiring lands.
*/

export type Opportunity = {
  id: string;
  title: string;
  tagline: string;
  detail: string;
  experiment: string;
  risk: string;
  category: string;
  time_to_value: number;
  strategic_impact: number;
  cost_to_implement: number;
  expected_roi: number;
  tech_maturity: number;
  org_readiness: number;
};

export const ROLES = [
  "Chief Marketing Officer",
  "Chief Financial Officer",
  "VP of Operations",
  "Head of Product",
  "Chief Technology Officer",
  "VP of Customer Success",
  "Head of Human Resources",
  "Chief Revenue Officer",
  "VP of Engineering",
  "Head of Strategy",
] as const;

export const INDUSTRIES = [
  "Financial Services",
  "Insurance",
  "Healthcare",
  "Retail & Consumer",
  "Manufacturing",
  "Technology",
  "Media & Entertainment",
  "Professional Services",
  "Energy & Utilities",
  "Telecommunications",
] as const;

export type AxisConfig = {
  label: string;
  shortLabel: string;
  x: { key: keyof Opportunity; low: string; high: string };
  y: { key: keyof Opportunity; low: string; high: string };
  quadrants: { TR: string; TL: string; BR: string; BL: string };
};

export const AXIS_CONFIGS: AxisConfig[] = [
  {
    label: "Time to Value × Strategic Impact",
    shortLabel: "Speed vs Impact",
    x: { key: "time_to_value", low: "Slower", high: "Faster" },
    y: { key: "strategic_impact", low: "Tactical", high: "Strategic" },
    quadrants: {
      TR: "Strategic Quick Wins",
      TL: "Transformational Bets",
      BR: "Operational Gains",
      BL: "Defer",
    },
  },
  {
    label: "Cost × Expected ROI",
    shortLabel: "Cost vs Return",
    x: { key: "cost_to_implement", low: "Costly", high: "Efficient" },
    y: { key: "expected_roi", low: "Low Return", high: "High Return" },
    quadrants: {
      TR: "Efficient Winners",
      TL: "High-Stakes Plays",
      BR: "Easy Wins",
      BL: "Avoid",
    },
  },
  {
    label: "Tech × Org Readiness",
    shortLabel: "Readiness",
    x: { key: "tech_maturity", low: "Emerging", high: "Mature" },
    y: { key: "org_readiness", low: "Needs Change", high: "Ready Today" },
    quadrants: {
      TR: "Ship Now",
      TL: "Emerging but Ready",
      BR: "Tech Ahead of Org",
      BL: "Not Yet Viable",
    },
  },
];

export const DEMO_DATA: Record<string, Opportunity[]> = {
  "Chief Marketing Officer__Financial Services": [
    { id: "cmo-fs-1", title: "Personalized lifecycle messaging at segment granularity", tagline: "Move from 12 email cohorts to 200, driven by behavioral clusters.", detail: "Replace static lifecycle cohorts with AI-clustered segments using behavioral and transactional data. Typical FS orgs see 18–34% lift in open rates and meaningful NPS gains on transactional touchpoints.", experiment: "A/B test AI-segmented lifecycle email against current cohort approach over 6 weeks, one product line.", risk: "Model drift without monitoring; regulated language review still required per touchpoint.", time_to_value: 8, strategic_impact: 6, cost_to_implement: 6, expected_roi: 8, tech_maturity: 9, org_readiness: 7, category: "Growth" },
    { id: "cmo-fs-2", title: "Agentic competitor intel feed for product marketing", tagline: "Continuous monitoring of 40 competitors, synthesized weekly.", detail: "An agent pipeline tracks competitor pricing, positioning, press, and product updates — surfacing a weekly brief to PMM. Replaces roughly 12 hrs/week of manual scanning per PMM.", experiment: "Build for 3 named competitors, validate brief quality with PMM team over 4 weeks before expanding.", risk: "Source quality uneven; synthesis can hallucinate without constraint.", time_to_value: 7, strategic_impact: 5, cost_to_implement: 8, expected_roi: 7, tech_maturity: 7, org_readiness: 8, category: "Ops" },
    { id: "cmo-fs-3", title: "Synthetic audience testing for creative concepts", tagline: "Test ad creative against modeled customer segments before spend.", detail: "Synthetic respondent panels evaluate creative concepts, messaging, and offers pre-campaign. Directionally reduces creative testing timelines from 3 weeks to 3 days.", experiment: "Run 5 upcoming creative concepts through synthetic panel + existing panel in parallel; validate overlap.", risk: "Synthetic outputs require validation against real panels for decision-making.", time_to_value: 6, strategic_impact: 7, cost_to_implement: 5, expected_roi: 6, tech_maturity: 6, org_readiness: 5, category: "Research" },
    { id: "cmo-fs-4", title: "Cross-channel attribution rebuild", tagline: "Replace last-click with ML-based multi-touch attribution.", detail: "Probabilistic attribution across paid, owned, and earned channels. Industry benchmarks suggest 20–30% reallocation of spend based on true contribution.", experiment: "Parallel-run new attribution model alongside current for one quarter before reallocation decisions.", risk: "Requires clean data foundation; political sensitivity around channel budget shifts.", time_to_value: 3, strategic_impact: 9, cost_to_implement: 3, expected_roi: 9, tech_maturity: 7, org_readiness: 4, category: "Growth" },
    { id: "cmo-fs-5", title: "Content localization at scale", tagline: "Generate and QA market-specific content across 14 regions.", detail: "AI-assisted translation plus market adaptation for landing pages, email, and collateral. Reduces localization lead time from 4 weeks to 5 days per campaign.", experiment: "Pilot with 3 highest-volume markets, human-in-loop QA, measure quality and speed.", risk: "Regulatory language variance across markets; cultural nuance still needs human review.", time_to_value: 9, strategic_impact: 4, cost_to_implement: 7, expected_roi: 6, tech_maturity: 9, org_readiness: 8, category: "Ops" },
    { id: "cmo-fs-6", title: "Voice-of-customer synthesis from support data", tagline: "Weekly themes from call transcripts surfaced to product and marketing.", detail: "Mine support calls, chat logs, and reviews for emerging themes. Most FS orgs have this data but no synthesis layer — pure volume prevents manual review.", experiment: "Index 90 days of support data for one product line, validate themes against known issues list.", risk: "Privacy and compliance review for recorded call processing.", time_to_value: 6, strategic_impact: 8, cost_to_implement: 6, expected_roi: 8, tech_maturity: 8, org_readiness: 6, category: "Research" },
    { id: "cmo-fs-7", title: "Conversational advisor prototype", tagline: "Prospect-facing tool for financial planning exploration.", detail: "Guided conversational interface for pre-login prospects to explore products, test scenarios, and self-qualify. Requires rigorous safety rails given regulated context.", experiment: "Build prototype, test with 200 prospects under observation, measure lead quality vs. form baseline.", risk: "Compliance and regulatory disclosure requirements are substantial; potential hallucination liability.", time_to_value: 2, strategic_impact: 9, cost_to_implement: 2, expected_roi: 7, tech_maturity: 5, org_readiness: 3, category: "Growth" },
    { id: "cmo-fs-8", title: "Brand guideline enforcement on partner creative", tagline: "Automated review of partner-produced creative against brand standards.", detail: "Flag off-brand imagery, tone, or color usage in partner-created assets before publication. Useful for organizations with wide partner networks.", experiment: "Train on current brand guidelines plus 500 approved assets, test against last quarter's rejected work.", risk: "False positive rate can slow approval workflows; edge cases need human review.", time_to_value: 7, strategic_impact: 3, cost_to_implement: 7, expected_roi: 5, tech_maturity: 8, org_readiness: 9, category: "Ops" },
  ],
  "VP of Operations__Insurance": [
    { id: "ops-ins-1", title: "Claims triage automation", tagline: "Route and pre-assess claims to adjusters with AI-generated summaries.", detail: "Reduce first-touch time from hours to minutes. Industry benchmarks show 30–45% efficiency gain for first-notice-of-loss workflows.", experiment: "4-week pilot on low-complexity auto claims with one adjuster team, measure cycle time and accuracy.", risk: "Regulatory requirements for human decision accountability vary by state.", time_to_value: 7, strategic_impact: 9, cost_to_implement: 5, expected_roi: 9, tech_maturity: 8, org_readiness: 6, category: "Ops" },
    { id: "ops-ins-2", title: "Underwriter decision support", tagline: "Surface relevant precedents and flag anomalies on complex submissions.", detail: "Pull relevant historical underwriting decisions, policy precedents, and risk flags for complex submissions. Keeps decision authority with human underwriter.", experiment: "Deploy to senior underwriter cohort first; track time-to-decision and decision quality over 8 weeks.", risk: "Model recommendations can bias underwriter judgment if not framed carefully.", time_to_value: 5, strategic_impact: 8, cost_to_implement: 4, expected_roi: 7, tech_maturity: 7, org_readiness: 5, category: "Ops" },
    { id: "ops-ins-3", title: "Document intake OCR and extraction", tagline: "Structured data from unstructured policy documents and forms.", detail: "Extract structured fields from scanned documents, medical records, and third-party reports. Mature technology; primary question is integration effort.", experiment: "Deploy on one document class, measure extraction accuracy against manual review on 500-doc sample.", risk: "Integration with legacy systems typically the long pole, not the ML.", time_to_value: 9, strategic_impact: 5, cost_to_implement: 7, expected_roi: 8, tech_maturity: 9, org_readiness: 8, category: "Ops" },
    { id: "ops-ins-4", title: "Fraud detection ensemble", tagline: "Layered ML screening on claims, applications, and provider networks.", detail: "Industry fraud rates of 5–10% on claims represent real savings. Ensemble approach layers pattern detection, anomaly flagging, and network analysis.", experiment: "Backtest against last year's confirmed fraud cases before deploying to live screening.", risk: "False positive management critical to avoid customer friction.", time_to_value: 4, strategic_impact: 9, cost_to_implement: 3, expected_roi: 9, tech_maturity: 7, org_readiness: 4, category: "Ops" },
    { id: "ops-ins-5", title: "Customer self-service coverage inquiries", tagline: "Policy Q&A bot grounded in customer's actual policy documents.", detail: "Reduce call volume on coverage clarification questions. Must be grounded in actual policy docs with strict citation, not generative answers.", experiment: "Deploy read-only to 5% of customers, measure deflection rate and satisfaction vs. call baseline.", risk: "Regulatory exposure if bot mischaracterizes coverage; requires rigorous evaluation.", time_to_value: 6, strategic_impact: 6, cost_to_implement: 6, expected_roi: 7, tech_maturity: 7, org_readiness: 5, category: "Service" },
    { id: "ops-ins-6", title: "Adjuster productivity coaching", tagline: "AI-surfaced coaching moments from claim handling patterns.", detail: "Analyze handling patterns across adjusters to surface coaching moments for team leads. Aid to existing coaching workflows, not replacement.", experiment: "Pilot with one team of 12 adjusters, validate coaching suggestions with team lead weekly.", risk: "Union and employee monitoring concerns require careful rollout.", time_to_value: 4, strategic_impact: 5, cost_to_implement: 5, expected_roi: 5, tech_maturity: 6, org_readiness: 3, category: "Ops" },
    { id: "ops-ins-7", title: "Synthetic claim scenarios for adjuster training", tagline: "Generated edge cases and complex scenarios for adjuster upskilling.", detail: "Complement traditional training with generated claim scenarios that stress-test adjuster judgment. Particularly valuable for new hires.", experiment: "Develop 50 scenarios with senior adjuster review, deploy to training cohort, measure competency gains.", risk: "Scenario quality dependent on expert review upfront.", time_to_value: 8, strategic_impact: 3, cost_to_implement: 8, expected_roi: 4, tech_maturity: 8, org_readiness: 8, category: "People" },
    { id: "ops-ins-8", title: "Predictive reserving", tagline: "Improve claim reserve accuracy from historical and real-time signals.", detail: "Apply ML to reserving process for better capital efficiency. Sophisticated actuarial models exist; opportunity is in operational integration.", experiment: "Parallel-run ML reserves vs. current method on one line of business for two quarters.", risk: "Actuarial and regulatory review substantial; not a quick deploy.", time_to_value: 2, strategic_impact: 9, cost_to_implement: 2, expected_roi: 8, tech_maturity: 6, org_readiness: 3, category: "Finance" },
  ],
  "Head of Product__Retail & Consumer": [
    { id: "hop-rc-1", title: "Search and discovery relevance overhaul", tagline: "Semantic search layer on top of existing catalog.", detail: "Replace keyword search with vector-based semantic matching. Typical retailers see 15–25% conversion lift on search-originated sessions.", experiment: "A/B semantic vs. keyword on 20% of traffic for 4 weeks, measure conversion and search-exit rate.", risk: "Merchandising rules and sponsored placements need careful integration.", time_to_value: 7, strategic_impact: 9, cost_to_implement: 5, expected_roi: 9, tech_maturity: 9, org_readiness: 7, category: "Growth" },
    { id: "hop-rc-2", title: "AI-generated product descriptions", tagline: "Consistent, SEO-optimized copy across entire catalog.", detail: "Generate product descriptions from structured attribute data. Particularly valuable for retailers with 50k+ SKUs and manual copywriting bottlenecks.", experiment: "Generate for 1k SKUs in one category, A/B test against current descriptions for conversion and SEO.", risk: "Brand voice consistency requires careful prompting; factual accuracy needs QA.", time_to_value: 9, strategic_impact: 4, cost_to_implement: 8, expected_roi: 6, tech_maturity: 9, org_readiness: 9, category: "Ops" },
    { id: "hop-rc-3", title: "Personalized recommendation engine", tagline: "Real-time product recommendations beyond collaborative filtering.", detail: "Move beyond \"customers who bought this\" to real-time contextual recommendations. Standard at top-tier retailers; increasingly table-stakes.", experiment: "Deploy new model alongside current, measure click-through and revenue-per-session.", risk: "Cold-start problem for new products and new customers.", time_to_value: 6, strategic_impact: 8, cost_to_implement: 5, expected_roi: 8, tech_maturity: 9, org_readiness: 7, category: "Growth" },
    { id: "hop-rc-4", title: "Visual search", tagline: "Image-based product discovery in mobile app.", detail: "Customers photograph items, find similar products. Strong in fashion, home goods, and beauty verticals.", experiment: "Ship in mobile app as beta feature, measure adoption and conversion for users who engage.", risk: "Only valuable if catalog imagery is high quality and comprehensive.", time_to_value: 5, strategic_impact: 6, cost_to_implement: 4, expected_roi: 5, tech_maturity: 8, org_readiness: 6, category: "Growth" },
    { id: "hop-rc-5", title: "Dynamic pricing assistant", tagline: "ML-suggested prices with pricing team retaining authority.", detail: "Surface price suggestions based on demand, competitor pricing, and inventory. Team keeps decision authority; AI eliminates analysis time.", experiment: "Shadow-mode on one category for 4 weeks, compare AI suggestions to team decisions.", risk: "Brand positioning risk if pricing appears reactive.", time_to_value: 3, strategic_impact: 8, cost_to_implement: 4, expected_roi: 8, tech_maturity: 7, org_readiness: 4, category: "Finance" },
    { id: "hop-rc-6", title: "Returns fraud detection", tagline: "Flag patterns indicating wardrobing, receipt fraud, or serial returners.", detail: "Industry return fraud runs 5–10% of return volume. ML detection reduces genuine customer friction vs. policy-based approaches.", experiment: "Backtest on last year's returns data, validate flags against manual review.", risk: "Customer experience risk if false positives are mishandled.", time_to_value: 6, strategic_impact: 6, cost_to_implement: 6, expected_roi: 7, tech_maturity: 8, org_readiness: 7, category: "Ops" },
    { id: "hop-rc-7", title: "Shoppable video and livestream", tagline: "AI-tagged products in video content for in-stream purchase.", detail: "Generate product tags from video content for shoppable livestreams, reels, and UGC. Strong in China, maturing in US retail.", experiment: "Pilot with top 10 creator partnerships, measure click-through and conversion vs. baseline.", risk: "Creator and platform dynamics complex; may require platform partnerships.", time_to_value: 4, strategic_impact: 5, cost_to_implement: 3, expected_roi: 5, tech_maturity: 6, org_readiness: 4, category: "Growth" },
    { id: "hop-rc-8", title: "Merchandising decision assistant", tagline: "Buyer-facing tool for range review and assortment decisions.", detail: "Aggregate sales patterns, trend signals, and competitor data for merchandising reviews. Speeds review cycle; team keeps authority.", experiment: "Pilot with one category team, measure review cycle time and decision confidence.", risk: "Adoption requires buyer buy-in; easy to dismiss as \"intuition competitor\".", time_to_value: 6, strategic_impact: 5, cost_to_implement: 5, expected_roi: 6, tech_maturity: 7, org_readiness: 5, category: "Ops" },
  ],
};

export function routeDemo(role: string, industry: string): Opportunity[] {
  const key = `${role}__${industry}`;
  if (DEMO_DATA[key]) return DEMO_DATA[key];
  const r = role.toLowerCase();
  if (r.includes("marketing") || r.includes("revenue") || r.includes("strategy"))
    return DEMO_DATA["Chief Marketing Officer__Financial Services"];
  if (r.includes("operations") || r.includes("financial") || r.includes("hr") || r.includes("human"))
    return DEMO_DATA["VP of Operations__Insurance"];
  return DEMO_DATA["Head of Product__Retail & Consumer"];
}
