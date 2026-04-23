import Anthropic from "@anthropic-ai/sdk";
import type { EnrichmentResult } from "./types";

/*
  Ported from hurleywhite/arcticmind-tech-stack-analyzer.
  Uses Claude's web_search tool to scrape the company website + search
  for recent context. Runs in parallel with the SerpAPI jobs path.
  If SerpAPI returned nothing, this is also the full answer.
*/

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No Claude API key found");
  return new Anthropic({ apiKey });
}

export async function enrichCompanyFromWeb(
  domain: string,
  companyName: string
): Promise<EnrichmentResult> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    tools: [
      {
        type: "web_search_20250305" as const,
        name: "web_search",
        max_uses: 7,
      },
    ],
    messages: [
      {
        role: "user",
        content: `Research the company "${companyName}" (website: ${domain}). Visit their website and search for recent information. Find:

1. What the company does (2-3 sentence summary including their value proposition)
2. Their products and services (list each one specifically)
3. Their industry/sector
4. Technologies or tools they use or build with (check website, blog, job postings, GitHub, etc.)
5. Approximate company size
6. Founded year
7. Headquarters location
8. 2-3 key competitors in their space
9. Any recent news or announcements from the last 30 days
10. AI adoption signals — do they use AI in their products? Do they have AI features? Are they hiring for AI roles?
11. 2-3 actionable insights for someone evaluating this company (e.g. "Growing rapidly in X market", "Recently launched AI features", "Key differentiator is Y")

Return ONLY a JSON object (no markdown, no explanation):
{
  "company_name": "Proper Name",
  "summary": "2-3 sentence description of what this company does, their main value proposition, and market position",
  "products": ["Product 1", "Product 2"],
  "services": ["Service 1", "Service 2"],
  "industry": "their industry",
  "tech_stack": {
    "ai_ml": ["AI/ML tools they use or build with"],
    "backend": ["backend technologies"],
    "frontend": ["frontend technologies"],
    "databases": ["databases"],
    "cloud_infrastructure": ["cloud platforms"],
    "devops_ci_cd": ["DevOps tools"],
    "other": ["other notable tools"]
  },
  "employee_count_estimate": "1-10 / 11-50 / 51-200 / 201-500 / 500+",
  "founded_year": "YYYY or null",
  "headquarters": "City, State/Country or null",
  "competitors": ["Competitor 1", "Competitor 2"],
  "recent_news": ["Brief description of recent news item 1", "Brief description 2"],
  "ai_adoption": "Brief assessment of their AI maturity — e.g. 'Active AI adopter with ML-powered product features' or 'No visible AI adoption yet'",
  "actionable_insights": ["Insight 1", "Insight 2", "Insight 3"],
  "confidence": "high/medium/low"
}

If you can't find certain information, use empty arrays or null. Focus on what's publicly available.
Return ONLY the JSON.`,
      },
    ],
  });

  let text = "";
  for (const block of response.content) {
    if (block.type === "text") {
      text += block.text;
    }
  }

  // Strip citation tags Claude's web_search may leave behind.
  text = text.replace(/<cite[^>]*>[\s\S]*?<\/cite>/gi, "");
  text = text.replace(/<cite[^>]*\/>/gi, "");

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        company_name: parsed.company_name || companyName,
        summary: parsed.summary || "",
        products: parsed.products || [],
        services: parsed.services || [],
        industry: parsed.industry || "technology",
        tech_stack: parsed.tech_stack || {},
        employee_count_estimate: parsed.employee_count_estimate || "unknown",
        founded_year: parsed.founded_year || null,
        headquarters: parsed.headquarters || null,
        competitors: parsed.competitors || [],
        recent_news: parsed.recent_news || [],
        ai_adoption: parsed.ai_adoption || "Unknown",
        actionable_insights: parsed.actionable_insights || [],
        confidence: parsed.confidence || "low",
      };
    }
  } catch (e) {
    console.error("[enrichment] Failed to parse enrichment JSON:", e);
  }

  return {
    company_name: companyName,
    summary: `${companyName} is a company operating at ${domain}.`,
    products: [],
    services: [],
    industry: "technology",
    tech_stack: {},
    employee_count_estimate: "unknown",
    founded_year: null,
    headquarters: null,
    competitors: [],
    recent_news: [],
    ai_adoption: "Unknown",
    actionable_insights: [],
    confidence: "low",
  };
}
