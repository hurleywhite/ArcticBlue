import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";
import { USE_CASES } from "@/lib/content/use-cases";
import { RESOURCES } from "@/lib/content/resources";
import { MODULES } from "@/lib/content/modules";
import { ComposeApp } from "./compose-app";

export const metadata = { title: "Compose · Library · ArcticMind" };

export default function ComposePage() {
  const items = [
    ...USE_CASES.map((u) => ({
      id: u.id,
      kind: "case" as const,
      title: u.title,
      description: u.summary,
      stat: u.headline_metric,
      topics: u.tags.topics ?? [],
    })),
    ...PROMPTS.map((p) => ({
      id: p.id,
      kind: "prompt" as const,
      title: p.title,
      description: p.description,
      stat: `${p.variables.length} variables`,
      topics: p.tags.topics ?? [],
    })),
    ...TEMPLATES.map((t) => ({
      id: t.id,
      kind: "template" as const,
      title: t.title,
      description: t.description,
      stat: t.template_type,
      topics: t.tags.topics ?? [],
    })),
    ...RESOURCES.map((r) => ({
      id: r.id,
      kind: "resource" as const,
      title: r.title,
      description: r.summary,
      stat: r.kind,
      topics: [] as string[],
    })),
    ...MODULES.map((m) => ({
      id: m.id,
      kind: "module" as const,
      title: m.title,
      description: m.description,
      stat: `${m.estimated_minutes} min`,
      topics: m.tags.topics ?? [],
    })),
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Library · Compose"
        title="Pick items, draft a proposal."
        right={
          <Link href="/library" className="btn-secondary inline-block bg-white">
            ← Library
          </Link>
        }
      />
      <ComposeApp items={items} />
    </div>
  );
}
