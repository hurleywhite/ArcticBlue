import { MODULES } from "@/lib/content/modules";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import type { Module, UseCase, Prompt } from "@/lib/content/types";
import { makeContext, scoreAgainstTags, type ScoringContext } from "./score";

/*
  Given a user's canvas state, return a mixed recommendation set for
  the dashboard: 2 modules + 2 use cases + 2 prompts, scored against
  starred opportunities + role + industry. Deterministic — Phase 1F
  layers an LLM re-rank on top of this candidate set.
*/

export type RecommendationItem =
  | ({ kind: "module"; score: number } & Module)
  | ({ kind: "use_case"; score: number } & UseCase)
  | ({ kind: "prompt"; score: number } & Prompt);

export function recommend(
  role: string,
  industry: string,
  starIds: string[],
  completedModuleIds?: Set<string>
) {
  const ctx: ScoringContext = {
    ...makeContext(role, industry, starIds),
    completedModuleIds,
  };

  const scoredModules = MODULES.map((m) => {
    let score = scoreAgainstTags(m.tags, ctx, { publishedAt: m.published_at });
    if (completedModuleIds?.has(m.id)) score -= 5;
    return { ...m, kind: "module" as const, score };
  }).sort((a, b) => b.score - a.score);

  const scoredCases = USE_CASES.map((u) => ({
    ...u,
    kind: "use_case" as const,
    score: scoreAgainstTags(u.tags, ctx, { publishedAt: u.published_at }),
  })).sort((a, b) => b.score - a.score);

  const scoredPrompts = PROMPTS.map((p) => ({
    ...p,
    kind: "prompt" as const,
    score: scoreAgainstTags(p.tags, ctx, { publishedAt: p.published_at }),
  })).sort((a, b) => b.score - a.score);

  return {
    modules: scoredModules.slice(0, 4),
    useCases: scoredCases.slice(0, 4),
    prompts: scoredPrompts.slice(0, 4),
    topSix: [
      ...scoredModules.slice(0, 2),
      ...scoredCases.slice(0, 2),
      ...scoredPrompts.slice(0, 2),
    ].sort((a, b) => b.score - a.score) as RecommendationItem[],
  };
}
