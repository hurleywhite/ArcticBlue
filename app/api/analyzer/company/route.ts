import { NextRequest, NextResponse } from "next/server";
import { apolloEnrichOrg, apolloJobPostings, apolloToProfile, mapApolloTechCategory } from "@/lib/analyzer/apollo";
import { exaRecentNews, exaJobListings, type ExaResult } from "@/lib/analyzer/exa";
import { extractTechStack } from "@/lib/analyzer/tech-stack";
import { synthesizeCompanyInsight } from "@/lib/analyzer/synthesize";
import { extractCompanyName, extractDomain, getConfidence } from "@/lib/analyzer/utils";
import { EMPTY_TECH_STACK, type AnalyzerResult, type JobListing, type TechStack } from "@/lib/analyzer/types";

/*
  Company Analyzer endpoint (v2 — Apollo + Exa + Claude).

  POST { companyUrl }
  Flow:
  1. Normalize domain, derive company name
  2. Apollo: enrich organization (firmographics + detected technologies)
  3. In parallel:
     a. Apollo: organization job postings (if org id available)
     b. Exa.ai: recent news about the company (last 30 days)
  4. If Apollo returned no job postings, fall back to Exa job-listing search
  5. Claude Sonnet 4.6: extract additional tech stack from job descriptions
     (merges with Apollo's detected technologies)
  6. Claude Sonnet 4.6: synthesize a narrative summary + AI-adoption
     signal + actionable insights from the combined facts

  Returns AnalyzerResult. No client caching — Vercel edge cache can be
  layered in later if calls get expensive.
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
            "ANTHROPIC_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables and redeploy.",
        },
        { status: 500 }
      );
    }

    const domain = extractDomain(body.companyUrl);
    const companyName = extractCompanyName(domain);

    // Step 1 — Apollo firmographics (best single source for structured company data)
    const apolloOrg = await apolloEnrichOrg(domain);
    const profile = apolloOrg ? apolloToProfile(apolloOrg) : null;
    const orgId = apolloOrg?.id;

    // Step 2 — Parallel: Apollo job postings + Exa recent news
    const [apolloJobs, exaNews] = await Promise.all([
      orgId ? apolloJobPostings(orgId, 20) : Promise.resolve([]),
      exaRecentNews(profile?.name ?? companyName, domain, 30),
    ]);

    // Step 3 — Exa fallback for job listings if Apollo returned none
    let jobListings: JobListing[] = apolloJobs.map((j) => ({
      title: j.title,
      company_name: profile?.name ?? companyName,
      location: j.location ?? "",
      description: j.description ?? "",
    }));

    let exaJobs: ExaResult[] = [];
    if (jobListings.length === 0) {
      exaJobs = await exaJobListings(profile?.name ?? companyName, domain);
      jobListings = exaJobs.map((e) => ({
        title: e.title ?? "",
        company_name: profile?.name ?? companyName,
        location: "",
        description: e.text ?? "",
      }));
    }

    // Step 4 — Claude tech-stack extraction from whatever job descriptions we have
    const jobsWithDescriptions = jobListings.filter((j) => j.description && j.description.length > 200);
    const extractedStack = jobsWithDescriptions.length > 0
      ? await extractTechStack(jobsWithDescriptions, profile?.name ?? companyName).catch((err) => {
          console.error("[analyzer] tech stack extraction failed:", err);
          return null;
        })
      : null;

    // Step 5 — Merge: Apollo detected technologies + Claude-extracted tech stack
    const mergedStack: TechStack = { ...EMPTY_TECH_STACK };
    const addTech = (category: keyof TechStack, tech: string) => {
      if (!tech || tech.length > 80) return;
      if (!mergedStack[category].includes(tech)) mergedStack[category].push(tech);
    };
    // From Apollo
    if (profile?.technologies) {
      for (const t of profile.technologies) {
        const cat = mapApolloTechCategory(t.category ?? "") as keyof TechStack;
        addTech(cat, t.name);
      }
    }
    // From Claude extraction
    if (extractedStack) {
      for (const k of Object.keys(extractedStack.tech_stack) as Array<keyof TechStack>) {
        for (const tech of extractedStack.tech_stack[k] ?? []) addTech(k, tech);
      }
    }

    // Step 6 — Claude synthesis for narrative fields
    const newsDigest = exaNews
      .slice(0, 8)
      .map((n, i) => `${i + 1}. ${n.title}${n.publishedDate ? ` (${n.publishedDate.slice(0, 10)})` : ""}${n.text ? `\n${n.text.slice(0, 400)}` : ""}`)
      .join("\n\n");
    const synthesis = await synthesizeCompanyInsight({
      companyName: profile?.name ?? companyName,
      domain,
      profile,
      jobTitles: jobListings.map((j) => j.title).slice(0, 12),
      techStack: mergedStack,
      newsDigest,
    }).catch((err) => {
      console.error("[analyzer] synthesis failed:", err);
      return null;
    });

    const enrichment_source: AnalyzerResult["enrichment_source"] =
      apolloJobs.length > 0
        ? "jobs_and_web"
        : jobListings.length > 0
          ? "jobs_and_web"
          : "web_scrape";

    const result: AnalyzerResult = {
      company: profile?.name ?? capitalize(companyName),
      domain,
      tech_stack: mergedStack,
      summary: synthesis?.summary ?? profile?.short_description ?? "",
      jobs_analyzed: jobListings.length,
      job_titles_sampled: [...new Set(jobListings.map((j) => j.title))].slice(0, 20),
      confidence: getConfidence(jobListings.length),
      enrichment_source,
      products: synthesis?.products ?? [],
      services: synthesis?.services ?? [],
      industry: profile?.industry ?? synthesis?.industry ?? "",
      competitors: synthesis?.competitors ?? [],
      recent_news: exaNews.slice(0, 5).map((n) => n.title ?? "").filter(Boolean),
      ai_adoption: synthesis?.ai_adoption ?? "Unknown",
      actionable_insights: synthesis?.actionable_insights ?? [],
      employee_count_estimate: profile?.employee_count_estimate ?? "unknown",
      founded_year: profile?.founded_year ?? null,
      headquarters: profile?.headquarters ?? null,
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
