import type { Collection } from "./types";

export const COLLECTIONS: Collection[] = [
  {
    id: "col-01",
    slug: "getting-started",
    title: "Getting started with AI at work",
    description:
      "The minimum set of modules we recommend every learner complete before starting a pilot. Two readings, one video, one exercise — roughly 70 minutes end-to-end.",
    module_slugs: [
      "experimentation-method",
      "canvas-walkthrough",
      "prompt-engineering-foundations",
      "exercise-scope-your-first-pilot",
    ],
    tags: { skill_level: "intro", topics: ["methodology"] },
    published_at: "2026-03-24",
  },
  {
    id: "col-02",
    slug: "experimentation-method",
    title: "The ArcticBlue experimentation method",
    description:
      "The method behind every engagement. How we scope, run, and decide on AI pilots in four weeks — plus the governance posture that keeps them moving.",
    module_slugs: [
      "experimentation-method",
      "exercise-scope-your-first-pilot",
      "reading-governance-basics",
      "workshop-april",
    ],
    tags: { skill_level: "intermediate", topics: ["methodology"] },
    published_at: "2026-04-01",
  },
  {
    id: "col-03",
    slug: "prompting-fundamentals",
    title: "Prompting fundamentals",
    description:
      "Prompt-craft that survives review cycles. Foundations, a practical exercise, and a curated external reference for when you want to go deeper on agents.",
    module_slugs: [
      "prompt-engineering-foundations",
      "exercise-prompt-a-competitor-brief",
      "external-anthropic-docs",
    ],
    tags: { skill_level: "intermediate", topics: ["prompting"] },
    published_at: "2026-04-06",
  },
];

export function getCollectionBySlug(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}
