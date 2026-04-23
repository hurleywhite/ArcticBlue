import { NextRequest, NextResponse } from "next/server";
import { fetchJobsFromSerpApi } from "@/lib/analyzer/serpapi";
import { extractTechStack } from "@/lib/analyzer/tech-stack";
import { enrichCompanyFromWeb } from "@/lib/analyzer/enrichment";
import { extractCompanyName, extractDomain, getConfidence } from "@/lib/analyzer/utils";
import { EMPTY_TECH_STACK, type AnalyzerResult, type TechStack } from "@/lib/analyzer/types";

/*
  Company Analyzer endpoint.

  POST { companyUrl }
  → SerpAPI (if SERPAPI_KEY) for job listings
  → Claude Sonnet 4.6 extracts tech stack from jobs
  → Claude Sonnet 4.6 with web_search tool enriches with products,
    competitors, recent news, AI adoption, actionable insights
  → Merges both sources into one AnalyzerResult

  Supabase cache layer is omitted here — wire it in once credentials are
  provisioned. For now each call is a fresh lookup (expensive but
  simple). Budget: ~90 seconds max for SerpAPI + enrichment in parallel.
*/

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.companyUrl !== "string") {
      return NextResponse.json({ error: "companyUrl is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_API_KEY) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY is not set. The analyzer needs Claude access — add it in Vercel → Project → Settings → Environment Variables and redeploy.",
        },
        { status: 500 }
      );
    }

    const domain = extractDomain(body.companyUrl);
    const companyName = extractCompanyName(domain);

    // Job listings (optional)
    let jobs: Awaited<ReturnType<typeof fetchJobsFromSerpApi>> = [];
    try {
      jobs = await fetchJobsFromSerpApi(companyName);
    } catch (err) {
      console.log("[analyzer] SerpAPI call failed, proceeding with enrichment only:", err);
    }

    const enrichmentPromise = enrichCompanyFromWeb(domain, companyName);

    if (jobs.length > 0) {
      // Run both in parallel
      const [extraction, enrichment] = await Promise.all([
        extractTechStack(jobs, companyName),
        enrichmentPromise,
      ]);

      // Merge: job-extracted stack wins for overlapping categories, enrichment fills gaps
      const mergedStack: TechStack = { ...EMPTY_TECH_STACK };
      const mergeCategory = (cat: keyof TechStack) => {
        const fromJobs = extraction.tech_stack[cat] ?? [];
        const fromEnrich = (enrichment.tech_stack[cat] ?? []) as string[];
        const combined = [...new Set([...fromJobs, ...fromEnrich])];
        mergedStack[cat] = combined;
      };
      (Object.keys(EMPTY_TECH_STACK) as Array<keyof TechStack>).forEach(mergeCategory);

      const result: AnalyzerResult = {
        company: enrichment.company_name || capitalize(companyName),
        domain,
        tech_stack: mergedStack,
        summary: enrichment.summary || extraction.summary,
        jobs_analyzed: jobs.length,
        job_titles_sampled: [...new Set(jobs.map((j) => j.title))].slice(0, 20),
        confidence: getConfidence(jobs.length),
        enrichment_source: "jobs_and_web",
        products: enrichment.products,
        services: enrichment.services,
        industry: enrichment.industry,
        competitors: enrichment.competitors,
        recent_news: enrichment.recent_news,
        ai_adoption: enrichment.ai_adoption,
        actionable_insights: enrichment.actionable_insights,
        employee_count_estimate: enrichment.employee_count_estimate,
        founded_year: enrichment.founded_year,
        headquarters: enrichment.headquarters,
        last_analyzed: new Date().toISOString(),
      };
      return NextResponse.json(result);
    }

    // Enrichment-only path
    const enrichment = await enrichmentPromise;
    const mergedStack: TechStack = { ...EMPTY_TECH_STACK };
    (Object.keys(EMPTY_TECH_STACK) as Array<keyof TechStack>).forEach((cat) => {
      mergedStack[cat] = (enrichment.tech_stack[cat] ?? []) as string[];
    });

    const result: AnalyzerResult = {
      company: enrichment.company_name,
      domain,
      tech_stack: mergedStack,
      summary: enrichment.summary,
      jobs_analyzed: 0,
      job_titles_sampled: [],
      confidence: enrichment.confidence,
      enrichment_source: "web_scrape",
      products: enrichment.products,
      services: enrichment.services,
      industry: enrichment.industry,
      competitors: enrichment.competitors,
      recent_news: enrichment.recent_news,
      ai_adoption: enrichment.ai_adoption,
      actionable_insights: enrichment.actionable_insights,
      employee_count_estimate: enrichment.employee_count_estimate,
      founded_year: enrichment.founded_year,
      headquarters: enrichment.headquarters,
      last_analyzed: new Date().toISOString(),
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyzer] error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
