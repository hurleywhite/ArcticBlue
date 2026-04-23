import { NextRequest, NextResponse } from "next/server";
import { fetchJobsFromSerpApi } from "@/lib/analyzer/serpapi";
import { extractTechStack } from "@/lib/analyzer/tech-stack";
import { enrichCompanyFromWeb } from "@/lib/analyzer/enrichment";
import {
  extractCompanyName,
  extractDomain,
  getConfidence,
} from "@/lib/analyzer/utils";
import {
  EMPTY_TECH_STACK,
  type AnalyzerResult,
  type TechStack,
} from "@/lib/analyzer/types";

/*
  Company Analyzer endpoint — ported from
  hurleywhite/arcticmind-tech-stack-analyzer.

  POST { companyUrl } → AnalyzerResult

  Flow:
  1. Normalize domain + derive company name.
  2. Path A (preferred, when SERPAPI_KEY is set and there are jobs):
     - In parallel: SerpAPI Google-Jobs listings + Claude web_search
       enrichment. Claude tech-stack extractor runs on the jobs.
     - Merge the two tech stacks (job analysis primary, enrichment
       fills gaps).
  3. Path B (fallback, when no jobs available):
     - Claude web_search enrichment alone builds the full profile.

  No Supabase caching in this port. Vercel edge cache can layer later
  if calls get expensive.
*/

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.companyUrl !== "string") {
      return NextResponse.json(
        { error: "companyUrl is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_API_KEY) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables and redeploy.",
        },
        { status: 500 }
      );
    }

    const domain = extractDomain(body.companyUrl);
    const companyName = extractCompanyName(domain);

    // Kick off web enrichment unconditionally; it's the single source
    // of truth for products/services/news/AI adoption etc.
    const enrichmentPromise = enrichCompanyFromWeb(domain, companyName);

    // Try SerpAPI. Soft-fails to empty array when no key or no hits.
    let jobs: Awaited<ReturnType<typeof fetchJobsFromSerpApi>> = [];
    try {
      jobs = await fetchJobsFromSerpApi(companyName);
    } catch (e) {
      console.log("[analyzer] SerpAPI failed, falling back to enrichment only:", e);
    }

    if (jobs.length > 0) {
      // ── Path A: Jobs + enrichment in parallel ──
      const [extraction, enrichment] = await Promise.all([
        extractTechStack(jobs, companyName).catch((err) => {
          console.error("[analyzer] tech-stack extraction failed:", err);
          return null;
        }),
        enrichmentPromise,
      ]);

      const confidence = getConfidence(jobs.length);
      const displayName =
        enrichment.company_name ||
        companyName.charAt(0).toUpperCase() + companyName.slice(1);

      // Merge tech stacks. Extraction (from real jobs) is primary;
      // enrichment fills categories extraction didn't have.
      const mergedStack: TechStack = { ...EMPTY_TECH_STACK };
      if (extraction) {
        for (const k of Object.keys(extraction.tech_stack) as Array<
          keyof TechStack
        >) {
          mergedStack[k] = [...(extraction.tech_stack[k] ?? [])];
        }
      }
      for (const [category, techs] of Object.entries(enrichment.tech_stack)) {
        if (!Array.isArray(techs)) continue;
        const cat = category as keyof TechStack;
        if (!mergedStack[cat]) mergedStack[cat] = [];
        const existing = new Set(
          mergedStack[cat].map((t: string) => t.toLowerCase())
        );
        for (const tech of techs) {
          if (!existing.has(tech.toLowerCase())) {
            mergedStack[cat].push(tech);
          }
        }
      }

      // Rich summary = enrichment summary + products mention if missing.
      let richSummary = enrichment.summary || extraction?.summary || "";
      if (
        enrichment.products.length > 0 &&
        !richSummary.includes("Products:")
      ) {
        richSummary += ` Products: ${enrichment.products.join(", ")}.`;
      }

      const result: AnalyzerResult = {
        company: displayName,
        domain,
        tech_stack: mergedStack,
        summary: richSummary,
        jobs_analyzed: jobs.length,
        job_titles_sampled: [...new Set(jobs.map((j) => j.title))].slice(0, 20),
        confidence,
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

    // ── Path B: Web enrichment only ──
    const enrichment = await enrichmentPromise;

    // Fold enrichment.tech_stack into the typed TechStack shape.
    const mergedStack: TechStack = { ...EMPTY_TECH_STACK };
    for (const [category, techs] of Object.entries(enrichment.tech_stack)) {
      if (!Array.isArray(techs)) continue;
      const cat = category as keyof TechStack;
      if (!mergedStack[cat]) mergedStack[cat] = [];
      for (const tech of techs) {
        if (!mergedStack[cat].includes(tech)) mergedStack[cat].push(tech);
      }
    }

    let richSummary = enrichment.summary || "";
    if (enrichment.products.length > 0) {
      richSummary += ` Products: ${enrichment.products.join(", ")}.`;
    }
    if (enrichment.services.length > 0) {
      richSummary += ` Services: ${enrichment.services.join(", ")}.`;
    }

    const confidence = (["high", "medium", "low"] as const).includes(
      enrichment.confidence as "high" | "medium" | "low"
    )
      ? (enrichment.confidence as "high" | "medium" | "low")
      : "low";

    const result: AnalyzerResult = {
      company: enrichment.company_name,
      domain,
      tech_stack: mergedStack,
      summary: richSummary,
      jobs_analyzed: 0,
      job_titles_sampled: [],
      confidence,
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
    const msg =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
