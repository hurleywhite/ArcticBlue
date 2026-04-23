import type { ContentTags } from "@/lib/content/types";
import type { Opportunity } from "@/lib/canvas/demo-data";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

/*
  Section 9 scoring.

  Input: the user's current canvas session (role, industry) and their
  starred opportunity ids.
  Output: a numeric score per candidate content item. Higher = better fit.

  Phase 1 uses deterministic tag matching with the weights defined in
  PROJECT.md §9. Phase 1F swaps in Claude Opus 4.7 re-ranking on top of
  these candidates.
*/

export type ScoringContext = {
  userRole: string;
  userIndustry: string;
  starredOpportunities: Opportunity[];
  completedModuleIds?: Set<string>;
};

export function scoreAgainstTags(
  tags: ContentTags | undefined,
  ctx: ScoringContext,
  opts: { publishedAt?: string } = {}
): number {
  if (!tags) return 0;
  let score = 0;

  const starCategories = new Set(ctx.starredOpportunities.map((o) => o.category));

  // +2 per direct category match
  if (tags.categories) {
    for (const cat of tags.categories) {
      if (starCategories.has(cat) || cat === "all") score += 2;
    }
  }

  // +2 for user's role match (or "all")
  if (tags.roles) {
    if (tags.roles.includes(ctx.userRole) || tags.roles.includes("all")) {
      score += 2;
    }
  }

  // +2 for user's industry match
  if (tags.industries) {
    if (tags.industries.includes(ctx.userIndustry)) {
      score += 2;
    }
  }

  // +1 for skill level (if present; we don't know user's level yet so
  // skill_level tagged content just gets a nominal bump)
  if (tags.skill_level) score += 0.5;

  // +0.5 if published in last 30 days (assume today via Date.now)
  if (opts.publishedAt) {
    const ageMs = Date.now() - new Date(opts.publishedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays <= 30 && ageDays >= 0) score += 0.5;
  }

  return score;
}

export function makeContext(
  userRole: string,
  userIndustry: string,
  starIds: string[]
): ScoringContext {
  // Resolve starred ids back to the Opportunity objects by looking
  // across all DEMO_DATA. This mirrors what a Supabase join would do.
  const all = Object.values(DEMO_DATA).flat();
  const starredOpportunities = all.filter((o) => starIds.includes(o.id));
  return {
    userRole,
    userIndustry,
    starredOpportunities,
  };
}
