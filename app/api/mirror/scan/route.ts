import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { enrichCompanyFromWeb } from "@/lib/analyzer/enrichment";
import { extractCompanyName, extractDomain } from "@/lib/analyzer/utils";
import type { EnrichmentResult } from "@/lib/analyzer/types";

/*
  Mirror scan — bespoke per-company opportunity field.

  POST { domain } → { company, opportunities[8] }

  Flow:
  1. Enrich the company via Claude web_search (same path the Analyzer
     uses).
  2. Pass the enrichment to Claude Sonnet with the Mirror opportunity
     schema baked in. Claude produces 8 opportunities grounded in the
     actual company's products / industry / tech stack / AI adoption.
  3. Server assigns orbital geometry (x, y, radius, angle) and color
     so the LLM doesn't need to do layout.

  Falls back to 501 if the API key is missing — client then renders
  its canned archetype templates so the demo never dead-ends.
*/

export const runtime = "nodejs";
export const maxDuration = 90;

type MirrorOpportunity = {
  id: string;
  title: string;
  category: string;
  readiness: number;
  impact: number;
  effort: number;
  horizon: number;
  x: number;
  y: number;
  radius: number;
  angle: number;
  color: string;
  insight: string;
  experiment: string;
  risk: string;
};

type MirrorCompany = {
  name: string;
  industry: string;
  signal: string;
  size: string;
  stack: string[];
  archetype: "fintech" | "insurance" | "enterprise_software";
};

const CATEGORY_COLORS: Record<string, string> = {
  Service: "#8BB2ED", // frost
  Ops: "#FFD074", // amber
  Research: "#D89AC9", // rose
  Growth: "#A3D9B1", // sage
  Finance: "#D89AC9",
  People: "#A3D9B1",
  Product: "#8BB2ED",
  Data: "#FFD074",
};

const DEFAULT_COLOR = "#8BB2ED";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.domain !== "string") {
      return NextResponse.json(
        { error: "domain is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY not set. Falling back to archetype templates.",
        },
        { status: 501 }
      );
    }

    const domain = extractDomain(body.domain);
    const companyName = extractCompanyName(domain);

    const enrichment = await enrichCompanyFromWeb(domain, companyName);
    const opportunities = await synthesizeOpportunities(
      apiKey,
      domain,
      enrichment
    );

    const archetype = pickArchetype(enrichment);
    const stack = Object.values(enrichment.tech_stack ?? {})
      .flat()
      .slice(0, 8) as string[];

    const company: MirrorCompany = {
      name: enrichment.company_name || companyName,
      industry: enrichment.industry || "Technology",
      signal:
        enrichment.ai_adoption && enrichment.ai_adoption !== "Unknown"
          ? enrichment.ai_adoption
          : enrichment.summary.split(". ")[0] ||
            "Scaling AI capability across multiple business functions",
      size: enrichment.employee_count_estimate || "Enterprise",
      stack: stack.length ? stack : ["Modern stack (inferred)"],
      archetype,
    };

    return NextResponse.json({ company, opportunities });
  } catch (err) {
    console.error("[mirror/scan] error:", err);
    const msg =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function synthesizeOpportunities(
  apiKey: string,
  domain: string,
  enrichment: EnrichmentResult
): Promise<MirrorOpportunity[]> {
  const client = new Anthropic({ apiKey });

  const context = buildOpportunityContext(enrichment, domain);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    system: `You are an AI strategy analyst producing 8 specific AI opportunities for a company, based on their real profile.

Rules for each opportunity:
- TITLE: 3–5 words, concrete, verb-first or noun-phrase (e.g. "Claims triage automation", "Developer docs assistant")
- CATEGORY: one of Ops, Growth, Research, Service, Finance, People, Product, Data
- READINESS, IMPACT, EFFORT, HORIZON: integers 0–100 calibrated to the company's actual position
  - readiness = how ready their data/tech/org is for this TODAY (0 = green field, 100 = already productionizable)
  - impact = business value if it lands (0 = marginal, 100 = category-defining)
  - effort = build + integration cost (0 = week of work, 100 = multi-year program)
  - horizon = time-to-measurable-value in days-equivalent (20 = one month, 90 = one quarter)
- INSIGHT: 1–2 sentences grounded in the company's specific situation. Reference their real products, industry, or tech stack where relevant. No generic boilerplate.
- EXPERIMENT: 1–2 sentences. A concrete 4–8 week experiment with a measurable outcome.
- RISK: 1 sentence. The specific risk for THIS company (regulatory, organizational, or technical).

Mix of categories (no more than 2 in any single category). At least 2 should be high-readiness / high-impact quick wins; 1–2 should be longer-horizon strategic bets.

Return ONLY valid JSON with this exact shape — no markdown, no preamble:
{
  "opportunities": [
    {
      "title": "...",
      "category": "Ops",
      "readiness": 84,
      "impact": 79,
      "effort": 42,
      "horizon": 45,
      "insight": "...",
      "experiment": "...",
      "risk": "..."
    }
  ]
}
Exactly 8 opportunities.`,
    messages: [{ role: "user", content: context }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Model did not return JSON");
  }
  const parsed = JSON.parse(match[0]) as {
    opportunities: Array<{
      title: string;
      category: string;
      readiness: number;
      impact: number;
      effort: number;
      horizon: number;
      insight: string;
      experiment: string;
      risk: string;
    }>;
  };

  const raw = parsed.opportunities.slice(0, 8);
  return raw.map((o, i) => assignLayout(o, i));
}

function buildOpportunityContext(
  e: EnrichmentResult,
  domain: string
): string {
  const techPreview = Object.entries(e.tech_stack ?? {})
    .map(([k, v]) => `  ${k}: ${(v as string[]).join(", ")}`)
    .join("\n");
  return `Company: ${e.company_name || domain}
Domain: ${domain}
Industry: ${e.industry}
Size: ${e.employee_count_estimate}
Summary: ${e.summary}

Products:
${(e.products ?? []).map((p) => `  - ${p}`).join("\n") || "  (none listed)"}

Services:
${(e.services ?? []).map((s) => `  - ${s}`).join("\n") || "  (none listed)"}

AI adoption signal: ${e.ai_adoption}

Tech stack (partial):
${techPreview || "  (not detected)"}

Competitors: ${(e.competitors ?? []).join(", ") || "(unknown)"}

Recent signals:
${(e.recent_news ?? []).slice(0, 5).map((n) => `  - ${n}`).join("\n") || "  (none recent)"}

Produce 8 bespoke AI opportunities for THIS company. Ground every insight in their actual profile above — no generic advice.`;
}

function assignLayout(
  raw: {
    title: string;
    category: string;
    readiness: number;
    impact: number;
    effort: number;
    horizon: number;
    insight: string;
    experiment: string;
    risk: string;
  },
  index: number
): MirrorOpportunity {
  // 8 slots arranged around the orbital field. Angle spacing = 45°
  // with a deterministic jitter so the field doesn't look like a clock.
  const baseAngle = index * 45;
  const jitter = (index % 2 === 0 ? 8 : -12) + ((index * 37) % 15);
  const angle = (baseAngle + jitter + 360) % 360;

  // Radius grows with impact. 140–260 px.
  const radius = Math.round(140 + (raw.impact / 100) * 120);

  // x/y as 0..1 normalized from (sin, cos) on a canvas where radius
  // maps to ~0.18 of the viewport short edge. Clamp to margins.
  const cx = 0.5;
  const cy = 0.5;
  const normalizedRadius = 0.18 + (raw.impact / 100) * 0.22;
  const rad = (angle * Math.PI) / 180;
  const x = Math.max(0.08, Math.min(0.92, cx + normalizedRadius * Math.sin(rad)));
  const y = Math.max(0.08, Math.min(0.92, cy - normalizedRadius * Math.cos(rad)));

  return {
    id: `op-${index + 1}`,
    title: raw.title,
    category: raw.category,
    readiness: clamp(raw.readiness),
    impact: clamp(raw.impact),
    effort: clamp(raw.effort),
    horizon: clamp(raw.horizon),
    x,
    y,
    radius,
    angle,
    color: CATEGORY_COLORS[raw.category] ?? DEFAULT_COLOR,
    insight: raw.insight,
    experiment: raw.experiment,
    risk: raw.risk,
  };
}

function clamp(n: unknown): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return 50;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function pickArchetype(
  e: EnrichmentResult
): "fintech" | "insurance" | "enterprise_software" {
  const ind = (e.industry || "").toLowerCase();
  if (
    ind.includes("bank") ||
    ind.includes("financ") ||
    ind.includes("fintech") ||
    ind.includes("payment")
  )
    return "fintech";
  if (ind.includes("insur") || ind.includes("reinsur")) return "insurance";
  return "enterprise_software";
}
