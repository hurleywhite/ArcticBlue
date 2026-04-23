/*
  Facilitator pool — ported from the Joe's Facilitators prototype.
  A roster of external consultants + trainers available for ArcticBlue
  engagements. Used for matching facilitators to client Labs + by the
  /deliverables proposal generator when pitching a multi-facilitator
  engagement.

  In production this should come from a Google Sheet (as the prototype
  does) or Supabase. Seeded here so the UI is exercisable.
*/

export type Focus = "Facilitation" | "Tech" | "Both";
export type ExperienceLevel = "High" | "Medium" | "Low";

export type Facilitator = {
  id: string;
  name: string;
  linkedin_url: string;
  focus: Focus;
  experience_level: ExperienceLevel;
  city: string;
  country: string;
  region: "Americas" | "Europe" | "Asia-Pacific" | "Middle East & Africa";
  bio: string;
  current_engagement: string | null;
  past_engagements: string[];
};

const FACILITATORS: Facilitator[] = [
  {
    id: "f-1",
    name: "Allie K. Miller",
    linkedin_url: "https://www.linkedin.com/in/alliekmiller",
    focus: "Both",
    experience_level: "High",
    city: "San Francisco",
    country: "USA",
    region: "Americas",
    bio: "15+ years leading design thinking workshops and technical strategy sessions for Fortune 500 companies.",
    current_engagement: null,
    past_engagements: ["ACME Corp Workshop", "TechForward Summit"],
  },
  {
    id: "f-2",
    name: "Andrew Ng",
    linkedin_url: "https://www.linkedin.com/in/andrewyng",
    focus: "Both",
    experience_level: "High",
    city: "Palo Alto",
    country: "USA",
    region: "Americas",
    bio: "AI education and practical adoption leader. Democratizing AI knowledge globally through scalable learning programs.",
    current_engagement: null,
    past_engagements: ["Global AI Bootcamp"],
  },
  {
    id: "f-3",
    name: "Priya Menon",
    linkedin_url: "https://www.linkedin.com/in/priyamenon",
    focus: "Facilitation",
    experience_level: "High",
    city: "London",
    country: "UK",
    region: "Europe",
    bio: "Operations-focused AI enablement specialist. Runs Practical Labs for insurance and healthcare clients.",
    current_engagement: "Global insurer — claims triage pilot",
    past_engagements: ["Fortune 50 insurer launch program", "Healthcare call center rollout"],
  },
  {
    id: "f-4",
    name: "Dana Rivera",
    linkedin_url: "https://www.linkedin.com/in/danariveraai",
    focus: "Both",
    experience_level: "High",
    city: "New York",
    country: "USA",
    region: "Americas",
    bio: "Eight years in applied research before switching to enablement. Specializes in prompt craft and synthesis workflows.",
    current_engagement: "Wealth manager — advisor enablement",
    past_engagements: ["CMO prompting cohort", "Marketing synthesis program"],
  },
  {
    id: "f-5",
    name: "Yuki Tanaka",
    linkedin_url: "https://www.linkedin.com/in/yukitanaka",
    focus: "Tech",
    experience_level: "High",
    city: "Tokyo",
    country: "Japan",
    region: "Asia-Pacific",
    bio: "ML engineer turned enablement lead. Bilingual EN/JP. Delivers hands-on technical workshops for engineering teams.",
    current_engagement: null,
    past_engagements: ["APAC engineering bootcamp", "Tokyo AI workshop series"],
  },
  {
    id: "f-6",
    name: "Rafael Ortiz",
    linkedin_url: "https://www.linkedin.com/in/rafaelortiz",
    focus: "Facilitation",
    experience_level: "High",
    city: "São Paulo",
    country: "Brazil",
    region: "Americas",
    bio: "Spanish/Portuguese/English facilitator. Runs executive enablement programs across Latin America.",
    current_engagement: null,
    past_engagements: ["LATAM C-suite program", "Mexico City accelerator"],
  },
  {
    id: "f-7",
    name: "Sarah Nguyen",
    linkedin_url: "https://www.linkedin.com/in/sarahnguyenai",
    focus: "Both",
    experience_level: "Medium",
    city: "Singapore",
    country: "Singapore",
    region: "Asia-Pacific",
    bio: "Product-AI specialist with background in enterprise SaaS. Runs product-track Practical Labs.",
    current_engagement: null,
    past_engagements: ["Singapore fintech program", "APAC product cohort"],
  },
  {
    id: "f-8",
    name: "Joe Nussbaum",
    linkedin_url: "https://www.linkedin.com/in/joenussbaum",
    focus: "Both",
    experience_level: "High",
    city: "New York",
    country: "USA",
    region: "Americas",
    bio: "ArcticBlue principal. 15 years in enterprise product and platform strategy.",
    current_engagement: "Fortune 50 insurer — underwriter support",
    past_engagements: ["Global publisher content program", "Asset manager avatar launch"],
  },
  {
    id: "f-9",
    name: "Meera Patel",
    linkedin_url: "https://www.linkedin.com/in/meerapatel",
    focus: "Facilitation",
    experience_level: "Medium",
    city: "Mumbai",
    country: "India",
    region: "Asia-Pacific",
    bio: "Operations and people-ops enablement. Runs cohort programs for HR and change-management leaders.",
    current_engagement: null,
    past_engagements: ["Mumbai HR cohort", "Global people-ops series"],
  },
  {
    id: "f-10",
    name: "Tomás Reed",
    linkedin_url: "https://www.linkedin.com/in/tomasreed",
    focus: "Tech",
    experience_level: "High",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    bio: "Engineering-track facilitator. Runs agentic-workflow workshops for senior engineers.",
    current_engagement: null,
    past_engagements: ["Berlin engineering cohort", "EU fintech tech-track"],
  },
  {
    id: "f-11",
    name: "Grace Tan",
    linkedin_url: "https://www.linkedin.com/in/gracetanfacilitator",
    focus: "Facilitation",
    experience_level: "High",
    city: "Toronto",
    country: "Canada",
    region: "Americas",
    bio: "Chief People Officer background. Runs cross-functional enablement cohorts with a focus on change adoption.",
    current_engagement: "Pinecroft Industrials — manufacturing cohort",
    past_engagements: ["Industrials change program", "Canadian retail rollout"],
  },
  {
    id: "f-12",
    name: "Henrik Voss",
    linkedin_url: "https://www.linkedin.com/in/henrikvoss",
    focus: "Both",
    experience_level: "Medium",
    city: "Copenhagen",
    country: "Denmark",
    region: "Europe",
    bio: "Operations-track facilitator. Bilingual English/Danish. Specializes in logistics and supply-chain teams.",
    current_engagement: null,
    past_engagements: ["Nordic logistics cohort"],
  },
];

export { FACILITATORS };
