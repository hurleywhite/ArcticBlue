import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { MODULES } from "@/lib/content/modules";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";
import { RESOURCES } from "@/lib/content/resources";
import { COLLECTIONS } from "@/lib/content/collections";
import { LibraryBrowser } from "./library-browser";

export const metadata = { title: "Library · ArcticMind" };

/*
  Unified /library — every kind of reference the sales team cites.
  Prompts, templates, use cases, resources, and learning modules all
  in one filter surface. Cite-this copies a formatted reference.
*/

export default function LibraryPage() {
  // Flatten everything into a single item list with a consistent shape.
  const items: LibraryItem[] = [
    ...PROMPTS.map((p): LibraryItem => ({
      id: p.id,
      slug: p.slug,
      kind: "prompt",
      title: p.title,
      description: p.description,
      stat: `${p.variables.length} variables`,
      topics: p.tags.topics ?? [],
      roles: (p.tags.roles ?? []).filter((r) => r !== "all"),
      categories: p.tags.categories ?? [],
      href: `/tools/prompts/${p.slug}`,
      body: p.prompt_body,
    })),
    ...TEMPLATES.map((t): LibraryItem => ({
      id: t.id,
      slug: t.slug,
      kind: "template",
      title: t.title,
      description: t.description,
      stat: t.template_type,
      topics: t.tags.topics ?? [],
      roles: (t.tags.roles ?? []).filter((r) => r !== "all"),
      categories: t.tags.categories ?? [],
      href: `/tools/templates/${t.slug}`,
      body: t.body_markdown,
    })),
    ...USE_CASES.map((u): LibraryItem => ({
      id: u.id,
      slug: u.slug,
      kind: "case",
      title: u.title,
      description: u.summary,
      stat: u.headline_metric,
      topics: u.tags.topics ?? [],
      roles: u.tags.roles ?? [],
      categories: u.tags.categories ?? [],
      industries: u.tags.industries ?? [],
      href: `/use-cases/${u.slug}`,
    })),
    ...RESOURCES.map((r): LibraryItem => ({
      id: r.id,
      slug: r.slug,
      kind: "resource",
      title: r.title,
      description: r.summary,
      stat: r.kind,
      topics: [],
      roles: [],
      categories: [],
      href: `/resources/${r.slug}`,
    })),
    ...MODULES.map((m): LibraryItem => ({
      id: m.id,
      slug: m.slug,
      kind: "module",
      title: m.title,
      description: m.description,
      stat: `${m.estimated_minutes} min · ${m.module_type.replace("_", " ")}`,
      topics: m.tags.topics ?? [],
      roles: (m.tags.roles ?? []).filter((r) => r !== "all"),
      categories: m.tags.categories ?? [],
      href: `/learning/${m.slug}`,
    })),
  ];

  const counts = {
    prompt: PROMPTS.length,
    template: TEMPLATES.length,
    case: USE_CASES.length,
    resource: RESOURCES.length,
    module: MODULES.length,
    collection: COLLECTIONS.length,
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Library"
        title="Reference material."
        right={
          <Link
            href="/library/compose"
            className="btn-secondary inline-block bg-white"
          >
            Compose proposal →
          </Link>
        }
      />

      <div className="callout mt-6">
        <p>
          Prompts, templates, cases, resources, and learning modules. Filter by
          kind or topic. Cite copies a reference to the clipboard. Compose picks
          3–5 items and drafts a proposal body.
        </p>
      </div>

      <LibraryBrowser items={items} counts={counts} />
    </div>
  );
}

export type LibraryKind = "prompt" | "template" | "case" | "resource" | "module";

export type LibraryItem = {
  id: string;
  slug: string;
  kind: LibraryKind;
  title: string;
  description: string;
  stat: string;
  topics: string[];
  roles: string[];
  categories: string[];
  industries?: string[];
  href: string;
  body?: string; // for cite-this snippet construction
};
