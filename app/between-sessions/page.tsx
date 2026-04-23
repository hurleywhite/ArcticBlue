import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";
import { RESOURCES } from "@/lib/content/resources";
import {
  AnalyzerMiniTile,
  CanvasMiniTile,
  MirrorMiniTile,
  PracticeMiniTile,
} from "./tile-previews";

export const metadata = { title: "Between sessions · ArcticMind" };

/*
  The Between Sessions showcase. Each tool gets an inline live
  preview — not a link-with-description. A client in the room sees
  things move and can grasp what each surface does in a glance.

  Below the interactive tiles, three editorial "feature blocks" surface
  a current Use Case, a representative prompt, and a playbook from
  Resources — enough texture to replace the generic library index
  without reducing the page to a wall of cards.
*/

export default function BetweenSessionsPage() {
  const featuredCase = USE_CASES[0];
  const featuredPrompt = PROMPTS[0];
  const featuredPlaybook = RESOURCES.find((r) => r.category === "playbook") ?? RESOURCES[0];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Between sessions"
        title="The support surfaces for your Lab."
      />

      <div className="callout mt-6">
        <p>
          The Lab is the product. These four surfaces are where your team does
          the work between sessions — bring real context into the next Lab,
          practice the workflow, and see how other teams solved the same problem.
        </p>
      </div>

      {/* Interactive tiles — each one is a miniature, live version of the tool */}
      <h2 className="section-header mt-10 mb-3">Tools</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MirrorMiniTile />
        <CanvasMiniTile />
        <AnalyzerMiniTile />
        <PracticeMiniTile />
      </div>

      {/* Featured case — replace the list-of-use-cases row with one vivid card */}
      <h2 className="section-header mt-12 mb-3">Featured use case</h2>
      <Link
        href={`/use-cases/${featuredCase.slug}`}
        className="group grid grid-cols-1 gap-0 border border-ink-border transition hover:border-navy md:grid-cols-[260px_1fr]"
      >
        <div className="flex flex-col justify-between bg-navy p-6 text-white">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
              {featuredCase.anonymized_client_label}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.12em] opacity-70">
              {(featuredCase.tags.industries ?? []).join(" · ")}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
              Headline metric
            </div>
            <div className="mt-1 text-[28px] font-bold leading-[1.05]">
              {featuredCase.headline_metric}
            </div>
          </div>
        </div>
        <div className="bg-white px-6 py-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            Use case
          </div>
          <div className="mt-1 text-[18px] font-bold leading-[1.25] text-navy">
            {featuredCase.title}
          </div>
          <p className="mt-2 text-[13px] leading-[1.55] text-ink">{featuredCase.summary}</p>
          <div className="mt-3 flex items-center justify-between border-t border-ink-border pt-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              Story · one-pager · slides
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
              Read case →
            </span>
          </div>
        </div>
      </Link>

      {/* Featured prompt — inline preview of the body + variable count */}
      <h2 className="section-header mt-10 mb-3">Featured prompt</h2>
      <Link
        href={`/tools/prompts/${featuredPrompt.slug}`}
        className="group block border border-ink-border bg-white transition hover:border-navy"
      >
        <div className="flex items-start justify-between bg-bg-card px-5 py-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
              Prompt library · {featuredPrompt.variables.length} variables
            </div>
            <div className="mt-0.5 text-[15px] font-bold text-navy">
              {featuredPrompt.title}
            </div>
            <p className="mt-1 text-[12px] text-ink-muted">{featuredPrompt.description}</p>
          </div>
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
            Open →
          </span>
        </div>
        <pre className="max-h-40 overflow-hidden whitespace-pre-wrap px-5 py-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[11px] leading-[1.55] text-ink">
          {featuredPrompt.prompt_body.slice(0, 320)}
          {featuredPrompt.prompt_body.length > 320 ? "…" : ""}
        </pre>
      </Link>

      {/* Featured playbook — the governance posture or pilot-scoping playbook */}
      <h2 className="section-header mt-10 mb-3">Featured playbook</h2>
      <Link
        href={`/resources/${featuredPlaybook.slug}`}
        className="group block border border-ink-border bg-ice px-6 py-4 transition hover:border-navy"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
              Playbook
            </div>
            <div className="mt-0.5 text-[16px] font-bold text-navy">{featuredPlaybook.title}</div>
            <p className="mt-1 max-w-3xl text-[13px] leading-[1.55] text-ink">
              {featuredPlaybook.summary}
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
            Open →
          </span>
        </div>
      </Link>

      {/* Full library counts — legible, one row, no fluff */}
      <div className="mt-12 border border-ink-border">
        <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
          <CountLink label="Use cases" count={USE_CASES.length} href="/use-cases" />
          <CountLink label="Prompts" count={PROMPTS.length} href="/tools/prompts" />
          <CountLink label="Templates" count={TEMPLATES.length} href="/tools/templates" />
          <CountLink label="Resources" count={RESOURCES.length} href="/resources" last />
        </div>
      </div>
    </div>
  );
}

function CountLink({
  label,
  count,
  href,
  last,
}: {
  label: string;
  count: number;
  href: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block bg-bg-card px-5 py-4 transition hover:bg-ice ${
        last ? "" : "md:border-r md:border-ink-border"
      } border-b border-ink-border md:border-b-0`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[28px] font-bold text-navy">{count}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
          Browse →
        </span>
      </div>
    </Link>
  );
}
