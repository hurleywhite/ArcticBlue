/*
  Case studies — sourced from the ArcticBlue Case Studies deck.
  These are the real client-facing case studies the sales team uses in
  pitches. Named clients (CapitalRx, DNB) kept as-is; the others are
  described in the deck without a named client.

  Format mirrors the slide structure: Business Challenge, Solution,
  Impact — rendered as three revealing panels in /showcase/cases.
*/

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  client_label: string;          // e.g. "CapitalRx" or "Global financial services firm"
  client_named: boolean;         // if false, anonymized per permission rules
  logo_url?: string;             // /public/case-logos/*.png
  category: string;              // HR / Finance / Product / Marketing / CX / Sales / Software
  transform_or_create: "transform" | "create";
  tagline: string;               // 1-line headline under the title
  business_challenge: string[];  // bullets or paragraphs
  solution: string[];
  impact: Array<{ metric: string; label: string }>; // the numbers to hero
  impact_detail?: string[];      // any additional impact narrative
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "cs-synthetic-personas",
    slug: "synthetic-personas",
    title: "Synthetic personas for product and campaign development",
    client_label: "Global financial services firm",
    client_named: false,
    category: "Product · Marketing",
    transform_or_create: "create",
    tagline: "Accelerating and scaling product research with synthetic personas",
    business_challenge: [
      "How do you get customer insights to inform product and marketing decisions with hard-to-reach market segments — niche customers in smaller markets, or senior B2B decision-makers?",
    ],
    solution: [
      "Reviewed historical research and conducted new primary research with target segments.",
      "Trained an AI model calibrated to represent the customer behaviors and attitudes we'd observed.",
      "Deployed the panel as a pre-screen for product concepts and campaign messaging.",
    ],
    impact: [
      { metric: "85%", label: "accuracy vs. live panels" },
      { metric: "Weeks → minutes", label: "research turnaround time" },
    ],
    impact_detail: [
      "Teams could validate product and marketing directions at the speed of thought, reserving live-panel testing for the decisions that warranted it.",
    ],
  },
  {
    id: "cs-capitalrx",
    slug: "capitalrx-resolution-prediction",
    title: "Resolution Prediction for inbound customer queries",
    client_label: "CapitalRx",
    client_named: true,
    logo_url: "/case-logos/capitalrx.png",
    category: "CX",
    transform_or_create: "transform",
    tagline: "Reimagining digital self-service from an AI-first perspective",
    business_challenge: [
      "CapitalRx needed cost-reduction in the call center — without rebuilding operations or retraining hundreds of agents.",
      "Volume was high, agent churn was real, and the existing call-center stack wasn't built for AI augmentation.",
    ],
    solution: [
      "Built a Resolution Prediction prototype that ingests real-time call transcripts.",
      "The model predicts the correct resolution to the patient inquiry before the patient articulates their problem.",
      "Surfaces to the agent mid-call — doesn't replace them — so handle time drops while quality climbs.",
    ],
    impact: [
      { metric: "45%", label: "faster resolution" },
      { metric: "100%", label: "call QA coverage (vs. 3% manual)" },
    ],
    impact_detail: [
      "Agents resolve faster; QA coverage goes from 3% sample-based to 100% automated review.",
    ],
  },
  {
    id: "cs-content-creation",
    slug: "book-content-creation",
    title: "Automating online content creation for backlist titles",
    client_label: "Global publisher",
    client_named: false,
    category: "Marketing",
    transform_or_create: "transform",
    tagline: "Driving engagement through scalable, on-brand content",
    business_challenge: [
      "Creating online content at scale for books is expensive and time-consuming.",
      "The backlist sat underserved — each title needed bespoke marketing copy, and the economics didn't work.",
    ],
    solution: [
      "Built an AI solution that translates book manuscript creative for online booksellers.",
      "Generates title-specific copy, metadata, and merchandising assets — pulled from the manuscript, not invented.",
    ],
    impact: [
      { metric: "10,000+", label: "backlist titles covered" },
      { metric: "Catalog-scale", label: "content creation" },
    ],
    impact_detail: [
      "Scale that couldn't be reached by hand. Each title gets treatment that previously only the frontlist received.",
    ],
  },
  {
    id: "cs-investment-avatars",
    slug: "investment-avatars",
    title: "AI Investment Avatars",
    client_label: "Asset manager",
    client_named: false,
    category: "Finance · Product",
    transform_or_create: "create",
    tagline: "Making investment decisions with more engaging, scalable formats",
    business_challenge: [
      "Clients wanted engaging, video-based insights — not PDFs.",
      "Video production was slow, costly, and capped at ~1,000 videos/year due to analyst and studio bottlenecks.",
    ],
    solution: [
      "Partnered with OpenAI + Synthesia to create AI avatars of analysts delivering scripted research.",
      "Videos are multilingual, scalable, and labeled AI-generated, with analyst-approved scripts for compliance.",
    ],
    impact: [
      { metric: "5,000+", label: "videos per year (5× increase)" },
      { metric: "Multilingual", label: "global reach unlocked" },
    ],
    impact_detail: [
      "Freed analysts for deeper research while boosting client engagement and accessibility.",
      "Greater localization and global reach without growing the production team.",
    ],
  },
  {
    id: "cs-dnb-chatbot",
    slug: "dnb-customer-service",
    title: "Customer service automation — Aino",
    client_label: "DNB",
    client_named: true,
    logo_url: "/case-logos/dnb.png",
    category: "CX",
    transform_or_create: "transform",
    tagline: "Automating standard customer-service interactions at scale",
    business_challenge: [
      "DNB, the largest bank in Norway, was dealing with high volumes of incoming customer chat traffic and repetitive inquiries.",
      "Human agents were consumed by the repetitive work, limiting scalability without degrading service quality.",
    ],
    solution: [
      "Partnered with boost.ai to launch \"Aino\" — a virtual banking agent handling credit cards, loans, account info via NLP + ML.",
      "Deployed with a chat-first strategy: route website chat traffic to the bot first, then escalate to human agents as needed.",
    ],
    impact: [
      { metric: "10,000+", label: "fully automated daily interactions" },
      { metric: "~68%", label: "CSAT (quarterly high for the bank)" },
      { metric: "50–60%", label: "of online chat traffic automated" },
    ],
    impact_detail: [
      "Automated ~20%+ of total customer-service traffic across all channels.",
      "Human agents freed to focus on complex, high-value interactions — increasing efficiency and reducing cost-to-serve.",
    ],
  },
  {
    id: "cs-generative-design",
    slug: "generative-design",
    title: "Generative design for automotive",
    client_label: "Automotive OEM",
    client_named: false,
    category: "Product · Software",
    transform_or_create: "create",
    tagline: "Validating product-market fit for AI-enabled solutions",
    business_challenge: [
      "Traditional automotive design cycles were slow and iteration-heavy.",
      "Designs needed to meet strict engineering constraints — safety, aerodynamics, efficiency — which made exploration expensive.",
    ],
    solution: [
      "Used text-to-image generative AI to propose optimized designs based on input constraints.",
      "Integrated outputs directly with CAD and simulation systems for rapid prototyping.",
    ],
    impact: [
      { metric: "Weeks → days", label: "early-stage design cycle" },
      { metric: "Sketch-to-production", label: "workflow acceleration" },
    ],
    impact_detail: [
      "Boosted creativity and efficiency by letting designers explore more options in the same time.",
    ],
  },
];

export type OpportunityCategory = {
  role: string;
  headline: string;
};

export const TRANSFORM_CATEGORIES: OpportunityCategory[] = [
  { role: "HR", headline: "Using unstructured interview data to predict candidate performance" },
  { role: "Finance", headline: "Making investment decisions using more diverse data sets" },
  { role: "Product", headline: "Accelerating and scaling product research with synthetic personas" },
  { role: "Marketing", headline: "Driving engagement through hyper-personalization" },
];

export const CREATE_CATEGORIES: OpportunityCategory[] = [
  { role: "Product", headline: "Validating product-market fit for AI-enabled solutions" },
  { role: "CX", headline: "Reimagining digital self-service from an AI-first perspective" },
  { role: "Sales", headline: "Helping sales teams sell new products without significant retraining" },
  { role: "Software", headline: "Intelligent coding environments for product development" },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
