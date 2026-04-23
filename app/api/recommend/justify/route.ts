import { NextRequest } from "next/server";
import { MODELS, MODEL_LABELS, anthropic } from "@/lib/anthropic";

/*
  Phase 1F — recommendation justification via Claude Opus 4.7.

  The dashboard's recommendation row uses deterministic tag-based scoring
  (lib/personalization/score.ts). This route produces a short, natural-
  language justification for why a particular item was recommended given
  the user's starred opportunities, role, and industry.

  Cached in-memory per (user stars, item id) so the dashboard doesn't
  burn Opus tokens on every page render. Client requests justifications
  on hover; we return instantly from cache after the first request.
*/

export const runtime = "nodejs";

type Body = {
  userRole: string;
  userIndustry: string;
  starredOpportunities: Array<{ id: string; title: string; category: string }>;
  item: {
    kind: "module" | "use_case" | "prompt";
    title: string;
    description: string;
    tags: Record<string, unknown>;
  };
};

// naive in-memory cache keyed by stars + item
const cache = new Map<string, { text: string; ts: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return new Response("Bad request", { status: 400 });

  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const cacheKey = JSON.stringify([
    body.userRole,
    body.userIndustry,
    body.starredOpportunities.map((o) => o.id).sort(),
    body.item.kind,
    body.item.title,
  ]);

  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return Response.json({ text: hit.text, cached: true, model: MODELS.RECOMMEND });
  }

  if (!hasKey) {
    const mock = mockJustification(body);
    cache.set(cacheKey, { text: mock, ts: Date.now() });
    return Response.json({ text: mock, cached: false, model: "mock" });
  }

  try {
    const client = anthropic();
    const prompt = buildPrompt(body);
    const res = await client.messages.create({
      model: MODELS.RECOMMEND,
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });
    const text = res.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();
    cache.set(cacheKey, { text, ts: Date.now() });
    return Response.json({
      text,
      cached: false,
      model: MODELS.RECOMMEND,
      modelLabel: MODEL_LABELS[MODELS.RECOMMEND],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ text: `[Justification unavailable: ${msg}]`, error: true });
  }
}

function buildPrompt(body: Body) {
  return [
    "You are explaining to an enterprise team member why a specific piece of content is recommended for them, based on their Opportunity Canvas selections.",
    "",
    `Their role: ${body.userRole}`,
    `Their industry: ${body.userIndustry}`,
    "",
    `Opportunities they starred on their Canvas:`,
    ...body.starredOpportunities.map((o) => `- ${o.title} (${o.category})`),
    "",
    `The recommended item (type: ${body.item.kind}):`,
    `Title: ${body.item.title}`,
    `Description: ${body.item.description}`,
    "",
    "Write a 1–2 sentence justification that tells this specific user why this specific item matters given what they starred. Be concrete — reference the specific opportunities and category matches. No filler words. Under 45 words total. Don't start with 'This' or 'Because'.",
  ].join("\n");
}

function mockJustification(body: Body) {
  const star = body.starredOpportunities[0];
  if (!star) return "Matched to your role and industry.";
  return `Direct match on your "${star.title}" star — the ${body.item.kind.replace("_", " ")} covers patterns that apply to ${star.category.toLowerCase()}-category work for ${body.userRole}s in ${body.userIndustry}.`;
}
