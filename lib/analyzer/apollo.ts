/*
  Apollo.io client for the Company Analyzer.

  Apollo gives us:
  - Firmographics via POST /api/v1/organizations/enrich?domain=...
    (company name, industry, size, founded year, HQ, linkedin, estimated
    revenue, and a `technologies` array they already detect)
  - Job postings via POST /api/v1/organizations/search or directly
    via the job_postings included in enrichment response on some tiers

  Requires APOLLO_API_KEY env var. If missing, callers fall back to
  Exa-only mode.

  Docs: https://docs.apollo.io/reference/organization-enrichment
*/

const APOLLO_BASE = "https://api.apollo.io/api/v1";

export type ApolloOrganization = {
  id?: string;
  name?: string;
  website_url?: string;
  primary_domain?: string;
  industry?: string;
  estimated_num_employees?: number;
  founded_year?: number;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  short_description?: string;
  keywords?: string[];
  technologies?: Array<{ uid?: string; name: string; category?: string }>;
  linkedin_url?: string;
  twitter_url?: string;
  total_funding_printed?: string;
  annual_revenue_printed?: string;
  latest_funding_stage?: string;
  raw_address?: string;
};

export type ApolloJobPosting = {
  title: string;
  url?: string;
  description?: string;
  posted_at?: string;
  location?: string;
  seniority_level?: string;
  department?: string;
};

function apolloHeaders() {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) return null;
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "X-Api-Key": apiKey,
  };
}

export async function apolloEnrichOrg(domain: string): Promise<ApolloOrganization | null> {
  const headers = apolloHeaders();
  if (!headers) return null;
  try {
    const res = await fetch(
      `${APOLLO_BASE}/organizations/enrich?domain=${encodeURIComponent(domain)}`,
      { method: "POST", headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Apollo returns { organization: {...} }
    return (data?.organization as ApolloOrganization) ?? null;
  } catch (err) {
    console.error("[apollo] enrich failed:", err);
    return null;
  }
}

/*
  Apollo organization job postings. Most Apollo plans expose this via the
  organization detail endpoint; the enriched org's `job_postings` may be
  included when you request with &reveal_personal_emails=true (no-op for
  orgs but needed on some tiers) or via a separate call. Kept as its own
  function so we can swap the underlying call if Apollo's surface shifts.
*/
export async function apolloJobPostings(
  orgId: string,
  limit: number = 20
): Promise<ApolloJobPosting[]> {
  const headers = apolloHeaders();
  if (!headers || !orgId) return [];
  try {
    const res = await fetch(
      `${APOLLO_BASE}/organizations/${encodeURIComponent(orgId)}/job_postings?per_page=${limit}`,
      { method: "GET", headers }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const raw: unknown = data?.organization_job_postings ?? data?.job_postings ?? [];
    if (!Array.isArray(raw)) return [];
    return (raw as Array<Record<string, unknown>>).slice(0, limit).map((p) => ({
      title: String(p.title ?? p.name ?? ""),
      url: typeof p.url === "string" ? p.url : undefined,
      description:
        typeof p.description === "string" ? p.description : undefined,
      posted_at:
        typeof p.posted_at === "string"
          ? p.posted_at
          : typeof p.created_at === "string"
            ? p.created_at
            : undefined,
      location: typeof p.location === "string" ? p.location : undefined,
      seniority_level:
        typeof p.seniority === "string"
          ? p.seniority
          : typeof p.seniority_level === "string"
            ? p.seniority_level
            : undefined,
      department:
        typeof p.department === "string"
          ? p.department
          : typeof p.team === "string"
            ? p.team
            : undefined,
    }));
  } catch (err) {
    console.error("[apollo] job_postings failed:", err);
    return [];
  }
}

/*
  Helper: flatten Apollo's organization into the shape the analyzer
  result expects (summary + location + employee estimate + tech-stack
  seed). Keeps the route handler concise.
*/
export function apolloToProfile(org: ApolloOrganization) {
  const hq =
    [org.city, org.state, org.country].filter(Boolean).join(", ") ||
    org.raw_address ||
    null;
  const empCount = org.estimated_num_employees;
  const sizeBucket = empCount
    ? empCount < 11
      ? "1-10"
      : empCount < 51
        ? "11-50"
        : empCount < 201
          ? "51-200"
          : empCount < 501
            ? "201-500"
            : empCount < 2001
              ? "501-2000"
              : "2000+"
    : "unknown";
  return {
    name: org.name ?? null,
    domain: org.primary_domain ?? null,
    industry: org.industry ?? "",
    employee_count_estimate: sizeBucket,
    founded_year: org.founded_year ? String(org.founded_year) : null,
    headquarters: hq,
    short_description: org.short_description ?? "",
    technologies: (org.technologies ?? []).map((t) => ({
      name: t.name,
      category: t.category ?? "other",
    })),
    keywords: org.keywords ?? [],
    linkedin_url: org.linkedin_url ?? null,
    annual_revenue: org.annual_revenue_printed ?? null,
    funding_stage: org.latest_funding_stage ?? null,
    total_funding: org.total_funding_printed ?? null,
  };
}

/*
  Apollo's technology categories are different from our enumerated
  TechStackCategory. Map Apollo category names into our buckets so the
  merged tech stack displays consistently.
*/
export function mapApolloTechCategory(apolloCategory: string): string {
  const c = apolloCategory.toLowerCase();
  if (/cloud|hosting|iaas|server/.test(c)) return "cloud_infrastructure";
  if (/data|warehouse|etl|analytics platform|bi /.test(c)) return "data_engineering";
  if (/databas|data store|nosql|sql/.test(c)) return "databases";
  if (/ci|cd|containeriz|orchestrat|devops/.test(c)) return "devops_ci_cd";
  if (/framework|backend|programming language|api/.test(c)) return "backend";
  if (/front|ui|cms|css|javascript library/.test(c)) return "frontend";
  if (/mobile|ios|android/.test(c)) return "mobile";
  if (/crm|marketing|email|ad |advertising|campaign/.test(c)) return "marketing_sales";
  if (/design|figma|prototyp/.test(c)) return "design";
  if (/project|task|work management|collaboration tool/.test(c)) return "project_management";
  if (/ai|ml|machine learning|llm|nlp/.test(c)) return "ai_ml";
  if (/security|identity|auth|sso|firewall/.test(c)) return "security";
  if (/communic|messag|chat|call|conferenc/.test(c)) return "communication";
  return "other";
}
