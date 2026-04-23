/*
  Exa.ai client for the Company Analyzer.

  Exa is a neural search API. We use it for:
  - Company overview pages + recent content about a target company
  - Recent news filtered by publish date (last ~30 days)
  - Optional: supplementary job listings when Apollo doesn't have the
    coverage (Apollo is stronger on B2B SaaS, Exa fills gaps elsewhere)

  Requires EXA_API_KEY env var. If missing, callers degrade to whatever
  Apollo returned.

  Docs: https://docs.exa.ai/reference
*/

const EXA_BASE = "https://api.exa.ai";

export type ExaResult = {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishedDate?: string;
  text?: string;
  score?: number;
};

function exaHeaders() {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return null;
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
}

type ExaSearchOptions = {
  type?: "neural" | "keyword" | "auto";
  numResults?: number;
  useAutoprompt?: boolean;
  category?:
    | "company"
    | "research paper"
    | "news"
    | "pdf"
    | "github"
    | "tweet"
    | "personal site"
    | "linkedin profile"
    | "financial report";
  startPublishedDate?: string; // ISO date
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeText?: boolean;
};

export async function exaSearch(
  query: string,
  opts: ExaSearchOptions = {}
): Promise<ExaResult[]> {
  const headers = exaHeaders();
  if (!headers) return [];
  try {
    const body = {
      query,
      type: opts.type ?? "auto",
      numResults: opts.numResults ?? 10,
      useAutoprompt: opts.useAutoprompt ?? true,
      category: opts.category,
      startPublishedDate: opts.startPublishedDate,
      endPublishedDate: opts.endPublishedDate,
      includeDomains: opts.includeDomains,
      excludeDomains: opts.excludeDomains,
      contents: opts.includeText ? { text: { maxCharacters: 2000 } } : undefined,
    };
    const res = await fetch(`${EXA_BASE}/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      console.error(`[exa] search failed: ${res.status} ${msg}`);
      return [];
    }
    const data = await res.json();
    const raw: unknown = data?.results ?? [];
    if (!Array.isArray(raw)) return [];
    return raw as ExaResult[];
  } catch (err) {
    console.error("[exa] search exception:", err);
    return [];
  }
}

/*
  Convenience: recent news about a company in the last `days` days.
  Combines a neural query with a publish-date filter.
*/
export async function exaRecentNews(
  companyName: string,
  domain: string,
  days: number = 30
): Promise<ExaResult[]> {
  const start = new Date();
  start.setDate(start.getDate() - days);
  return exaSearch(
    `news about ${companyName} (${domain}) — product launches, funding, partnerships, hiring signals`,
    {
      type: "neural",
      category: "news",
      numResults: 8,
      startPublishedDate: start.toISOString(),
      includeText: true,
    }
  );
}

/*
  Convenience: fallback job-listing search when Apollo didn't return
  postings. Scoped to known ATS hosts for precision.
*/
export async function exaJobListings(
  companyName: string,
  domain: string
): Promise<ExaResult[]> {
  return exaSearch(
    `${companyName} engineering job listing site:greenhouse.io OR site:lever.co OR site:ashbyhq.com OR site:workday.com OR site:careers.${domain}`,
    {
      type: "keyword",
      numResults: 10,
      includeText: true,
      includeDomains: [
        "greenhouse.io",
        "boards.greenhouse.io",
        "jobs.lever.co",
        "lever.co",
        "ashbyhq.com",
        "myworkdayjobs.com",
        "workday.com",
        "careers." + domain,
      ],
    }
  );
}
