import { anthropic, MODELS } from "@/lib/anthropic";
import type { TechStack } from "./types";

/*
  Analyzer synthesis — takes the combined facts (Apollo profile + job
  titles + merged tech stack + Exa news digest) and produces the
  narrative fields Claude is good at: summary, products, services,
  competitors, AI-adoption signal, actionable insights.

  This replaces the previous "enrichment" path that used Claude's
  web_search tool. Now all external lookups are done by Apollo and Exa
  (deterministic, paginated, rate-limit friendly), and Claude only
  does synthesis — which is cheaper and more predictable.
*/

export type SynthesisInput = {
  companyName: string;
  domain: string;
  profile: {
    industry?: string;
    employee_count_estimate?: string;
    headquarters?: string | null;
    founded_year?: string | null;
    short_description?: string;
    keywords?: string[];
    annual_revenue?: string | null;
    funding_stage?: string | null;
    total_funding?: string | null;
  } | null;
  jobTitles: string[];
  techStack: TechStack;
  newsDigest: string;
};

export type SynthesisOutput = {
  summary: string;
  industry: string;
  products: string[];
  services: string[];
  competitors: string[];
  ai_adoption: string;
  actionable_insights: string[];
};

export async function synthesizeCompanyInsight(input: SynthesisInput): Promise<SynthesisOutput> {
  const client = anthropic();
  const prompt = buildSynthesisPrompt(input);

  const response = await client.messages.create({
    model: MODELS.PRACTICE,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  let text = "";
  for (const block of response.content) {
    if (block.type === "text") text += block.text;
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return emptyResult();
  try {
    const parsed = JSON.parse(match[0]) as Partial<SynthesisOutput>;
    return {
      summary: parsed.summary ?? "",
      industry: parsed.industry ?? input.profile?.industry ?? "",
      products: parsed.products ?? [],
      services: parsed.services ?? [],
      competitors: parsed.competitors ?? [],
      ai_adoption: parsed.ai_adoption ?? "Unknown",
      actionable_insights: parsed.actionable_insights ?? [],
    };
  } catch {
    return emptyResult();
  }
}

function emptyResult(): SynthesisOutput {
  return {
    summary: "",
    industry: "",
    products: [],
    services: [],
    competitors: [],
    ai_adoption: "Unknown",
    actionable_insights: [],
  };
}

const SYSTEM_PROMPT = `You are an ArcticBlue analyst producing a crisp company-intel readout from structured facts.

You will receive:
- Firmographics (industry, size, HQ, founded)
- A list of current job titles
- A detected tech-stack organized by category
- A digest of recent news items (last 30 days)

Your job is to synthesize these into narrative fields. Do NOT invent facts not present in the inputs. If the inputs don't support a field, use an empty array or a brief "Insufficient data" note.

Return ONLY a JSON object with these exact keys — no prose, no markdown:

{
  "summary": "2-3 sentence description of what the company does and their market position. Ground in the provided facts.",
  "industry": "tight industry descriptor (1-4 words)",
  "products": ["specific product names"],
  "services": ["specific services offered"],
  "competitors": ["2-4 likely competitors based on industry and tech signals"],
  "ai_adoption": "1-sentence signal on AI maturity — cite evidence (AI roles, AI-specific tech, AI-related news). If none present, say so.",
  "actionable_insights": ["2-3 specific takeaways for someone evaluating or partnering with this company"]
}

Rules:
- Specific > generic. "Fraud detection platform" beats "tech company".
- Use the news digest to find the freshest signals worth surfacing.
- Competitors should be named, not categories.
- If AI adoption is unclear, say so directly; do not fabricate.`;

function buildSynthesisPrompt(input: SynthesisInput): string {
  const parts: string[] = [];
  parts.push(`Company: ${input.companyName} (${input.domain})`);
  if (input.profile) {
    if (input.profile.short_description) {
      parts.push(`Apollo short description: ${input.profile.short_description}`);
    }
    const fg: string[] = [];
    if (input.profile.industry) fg.push(`industry=${input.profile.industry}`);
    if (input.profile.employee_count_estimate)
      fg.push(`size=${input.profile.employee_count_estimate}`);
    if (input.profile.headquarters) fg.push(`HQ=${input.profile.headquarters}`);
    if (input.profile.founded_year) fg.push(`founded=${input.profile.founded_year}`);
    if (input.profile.annual_revenue) fg.push(`revenue=${input.profile.annual_revenue}`);
    if (input.profile.funding_stage) fg.push(`funding=${input.profile.funding_stage}`);
    if (fg.length) parts.push(`Firmographics: ${fg.join(" · ")}`);
    if (input.profile.keywords && input.profile.keywords.length) {
      parts.push(`Keywords: ${input.profile.keywords.slice(0, 12).join(", ")}`);
    }
  }
  if (input.jobTitles.length) {
    parts.push(`Current job titles (sample): ${input.jobTitles.slice(0, 12).join(" · ")}`);
  }
  const nonEmptyCats = (Object.keys(input.techStack) as Array<keyof TechStack>).filter(
    (c) => input.techStack[c].length > 0
  );
  if (nonEmptyCats.length) {
    const techLines = nonEmptyCats.map(
      (c) => `  - ${c}: ${input.techStack[c].slice(0, 12).join(", ")}`
    );
    parts.push(`Tech stack:\n${techLines.join("\n")}`);
  }
  if (input.newsDigest.trim()) {
    parts.push(`Recent news digest:\n${input.newsDigest}`);
  }
  parts.push("Produce the synthesis JSON now.");
  return parts.join("\n\n");
}
