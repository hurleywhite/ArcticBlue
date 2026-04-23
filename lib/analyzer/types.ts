/*
  Company analyzer types — mirrors the original tech-stack-analyzer repo.
  When Supabase is wired, these become the table shape for
  company_intel_analyses.
*/

export type TechStackCategory =
  | "cloud_infrastructure"
  | "data_engineering"
  | "backend"
  | "frontend"
  | "mobile"
  | "devops_ci_cd"
  | "databases"
  | "marketing_sales"
  | "design"
  | "project_management"
  | "ai_ml"
  | "security"
  | "communication"
  | "other";

export type TechStack = Record<TechStackCategory, string[]>;

export interface JobListing {
  title: string;
  company_name: string;
  location: string;
  description: string;
}

export interface ClaudeExtractionResult {
  tech_stack: TechStack;
  summary: string;
  confidence: "high" | "medium" | "low";
}

export interface EnrichmentResult {
  company_name: string;
  summary: string;
  products: string[];
  services: string[];
  industry: string;
  tech_stack: Partial<Record<keyof TechStack, string[]>> | Record<string, string[]>;
  employee_count_estimate: string;
  founded_year: string | null;
  headquarters: string | null;
  competitors: string[];
  recent_news: string[];
  ai_adoption: string;
  actionable_insights: string[];
  confidence: string;
}

export interface AnalyzerResult {
  company: string;
  domain: string;
  tech_stack: TechStack;
  summary: string;
  jobs_analyzed: number;
  job_titles_sampled: string[];
  confidence: "high" | "medium" | "low";
  enrichment_source: "jobs_and_web" | "web_scrape" | "jobs_only";
  products: string[];
  services: string[];
  industry: string;
  competitors: string[];
  recent_news: string[];
  ai_adoption: string;
  actionable_insights: string[];
  employee_count_estimate: string;
  founded_year: string | null;
  headquarters: string | null;
  last_analyzed: string;
}

export const EMPTY_TECH_STACK: TechStack = {
  cloud_infrastructure: [],
  data_engineering: [],
  backend: [],
  frontend: [],
  mobile: [],
  devops_ci_cd: [],
  databases: [],
  marketing_sales: [],
  design: [],
  project_management: [],
  ai_ml: [],
  security: [],
  communication: [],
  other: [],
};

export const CATEGORY_LABELS: Record<TechStackCategory, string> = {
  cloud_infrastructure: "Cloud & Infrastructure",
  data_engineering: "Data Engineering",
  backend: "Backend",
  frontend: "Frontend",
  mobile: "Mobile",
  devops_ci_cd: "DevOps & CI/CD",
  databases: "Databases",
  marketing_sales: "Marketing & Sales",
  design: "Design",
  project_management: "Project Management",
  ai_ml: "AI & ML",
  security: "Security",
  communication: "Communication",
  other: "Other",
};
