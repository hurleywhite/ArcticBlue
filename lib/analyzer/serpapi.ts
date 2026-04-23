import type { JobListing } from "./types";

/*
  SerpAPI Google Jobs integration — ported from hurleywhite/arcticmind-
  tech-stack-analyzer. Search the target company's active job listings,
  filter by company name match, and return structured JobListing objects
  the tech-stack extractor can consume.

  Requires SERPAPI_KEY env var. If missing, the analyzer falls back to
  web-enrichment-only mode.
*/

interface SerpApiJobResult {
  title: string;
  company_name: string;
  location: string;
  description: string;
}

interface SerpApiResponse {
  jobs_results?: SerpApiJobResult[];
  serpapi_pagination?: {
    next_page_token?: string;
    next?: string;
  };
  error?: string;
}

function companyNameMatches(jobCompanyName: string, targetCompany: string): boolean {
  const jobName = jobCompanyName.toLowerCase().trim();
  const target = targetCompany.toLowerCase().trim();
  if (jobName === target) return true;
  if (jobName.startsWith(target)) return true;
  if (jobName.includes(target)) return true;
  if (target.includes(jobName)) return true;

  const suffixes = [
    " inc", " inc.", " llc", " ltd", " corp", " corp.", " co", " co.",
    " corporation", " limited", " group", " holdings", " technologies",
    " technology", " solutions", " services", " platform", " platforms",
  ];
  let cleanJob = jobName;
  let cleanTarget = target;
  for (const suffix of suffixes) {
    if (cleanJob.endsWith(suffix)) cleanJob = cleanJob.slice(0, -suffix.length);
    if (cleanTarget.endsWith(suffix)) cleanTarget = cleanTarget.slice(0, -suffix.length);
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
    if (nextPageToken) params.next_page_token = nextPageToken;

    const response = await fetch(
      `https://serpapi.com/search.json?${new URLSearchParams(params).toString()}`
    );
    if (!response.ok) {
      if (page === 0) return [];
      break;
    }
    const data: SerpApiResponse = await response.json();
    if (data.error) return allJobs;
    if (!data.jobs_results || data.jobs_results.length === 0) break;
    allJobs.push(...data.jobs_results);
    if (data.serpapi_pagination?.next_page_token) {
      nextPageToken = data.serpapi_pagination.next_page_token;
    } else {
      break;
    }
  }
  return allJobs;
}

export async function fetchJobsFromSerpApi(companyName: string): Promise<JobListing[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    // Graceful degradation — let the caller fall back to enrichment-only.
    return [];
  }
  let rawJobs = await searchJobs(`"${companyName}" jobs`, apiKey);
  if (rawJobs.length === 0) {
    rawJobs = await searchJobs(`${companyName} jobs`, apiKey);
  }
  const matched = rawJobs.filter((job) => companyNameMatches(job.company_name, companyName));
  const finalJobs = matched.length > 0 ? matched : rawJobs;
  return finalJobs.map((job) => ({
    title: job.title,
    company_name: job.company_name,
    location: job.location || "",
    description: job.description || "",
  }));
}
