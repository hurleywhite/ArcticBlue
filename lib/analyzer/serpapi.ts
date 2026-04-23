import { JobListing } from "./types";

/*
  Ported from hurleywhite/arcticmind-tech-stack-analyzer.
  Queries SerpAPI's Google Jobs engine for public job listings,
  then filters to jobs whose company_name actually matches the
  target. Paginates up to 3 pages per query.
*/

interface SerpApiJobResult {
  title: string;
  company_name: string;
  location: string;
  description: string;
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
  };
  job_id?: string;
}

interface SerpApiResponse {
  jobs_results?: SerpApiJobResult[];
  serpapi_pagination?: {
    next_page_token?: string;
    next?: string;
  };
  error?: string;
}

function companyNameMatches(
  jobCompanyName: string,
  targetCompany: string
): boolean {
  const jobName = jobCompanyName.toLowerCase().trim();
  const target = targetCompany.toLowerCase().trim();

  if (jobName === target) return true;
  if (jobName.startsWith(target)) return true;
  if (jobName.includes(target)) return true;
  if (target.includes(jobName)) return true;

  const suffixes = [
    " inc",
    " inc.",
    " llc",
    " ltd",
    " corp",
    " corp.",
    " co",
    " co.",
    " corporation",
    " limited",
    " group",
    " holdings",
    " technologies",
    " technology",
    " solutions",
    " services",
    " platform",
    " platforms",
  ];

  let cleanJob = jobName;
  let cleanTarget = target;
  for (const suffix of suffixes) {
    if (cleanJob.endsWith(suffix)) cleanJob = cleanJob.slice(0, -suffix.length);
    if (cleanTarget.endsWith(suffix))
      cleanTarget = cleanTarget.slice(0, -suffix.length);
  }

  if (cleanJob === cleanTarget) return true;
  if (cleanJob.startsWith(cleanTarget)) return true;
  if (cleanJob.includes(cleanTarget)) return true;

  return false;
}

async function searchJobs(
  query: string,
  apiKey: string,
  maxPages: number = 3
): Promise<SerpApiJobResult[]> {
  const allJobs: SerpApiJobResult[] = [];
  let nextPageToken: string | undefined = undefined;

  for (let page = 0; page < maxPages; page++) {
    const params: Record<string, string> = {
      engine: "google_jobs",
      q: query,
      api_key: apiKey,
    };

    if (nextPageToken) {
      params.next_page_token = nextPageToken;
    }

    const response = await fetch(
      `https://serpapi.com/search.json?${new URLSearchParams(params).toString()}`
    );

    if (!response.ok) {
      if (page === 0) return [];
      break;
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      return allJobs;
    }

    if (!data.jobs_results || data.jobs_results.length === 0) {
      break;
    }

    allJobs.push(...data.jobs_results);

    if (data.serpapi_pagination?.next_page_token) {
      nextPageToken = data.serpapi_pagination.next_page_token;
    } else {
      break;
    }
  }

  return allJobs;
}

export async function fetchJobsFromSerpApi(
  companyName: string
): Promise<JobListing[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    // Soft-fail: no key means we skip the jobs path entirely and the
    // caller falls through to web-enrichment only.
    return [];
  }

  // Quoted search first (more precise). Fall back to unquoted.
  let rawJobs = await searchJobs(`"${companyName}" jobs`, apiKey);
  if (rawJobs.length === 0) {
    rawJobs = await searchJobs(`${companyName} jobs`, apiKey);
  }

  const matchedJobs = rawJobs.filter((job) =>
    companyNameMatches(job.company_name, companyName)
  );
  const finalJobs = matchedJobs.length > 0 ? matchedJobs : rawJobs;

  return finalJobs.map((job) => ({
    title: job.title,
    company_name: job.company_name,
    location: job.location || "",
    description: job.description || "",
  }));
}
