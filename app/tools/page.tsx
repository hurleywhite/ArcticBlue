import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";

export const metadata = { title: "Tools · ArcticMind" };

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Tools"
        title="Practice what you learn before shipping it on real work."
      />

      <div className="callout mt-6">
        <p>
          Tools is a focused practice environment — not a general-purpose AI playground.
          Every practice session is seeded with context from the Canvas, a module exercise,
          or a curated prompt.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">Sections</h2>
      <div className="border border-ink-border">
        <ToolRow
          n="01"
          title="Practice — a seeded chat sandbox"
          body="Start a session from a Canvas opportunity, a module exercise, a prompt from the library, or blank. Sessions persist; export as markdown."
          href="/tools/practice"
          cta="Open Practice →"
        />
        <ToolRow
          n="02"
          title={`Prompt Library · ${PROMPTS.length} curated prompts`}
          body="Prompts spanning competitor analysis, interview synthesis, product briefs, meeting notes, strategy memos, data exploration, slide outlines, RFP analysis, and more."
          href="/tools/prompts"
          cta="Browse prompts →"
        />
        <ToolRow
          n="03"
          title={`Templates · ${TEMPLATES.length} structured formats`}
          body="The output scaffolding for common AI-assisted deliverables — email, brief, analysis, plan. Fill variables, copy, export to PDF, or pipe into Practice."
          href="/tools/templates"
          cta="Browse templates →"
        />
        <ToolRow
          n="04"
          title="Event sourcer — partner-facing conference finder"
          body="Partner inputs in (focus, audience, themes, window), structured event list out. Primary + halo streams, speaking/sponsorship routes verified, sorted by date. Powered by Dust."
          href="/tools/event-sourcer"
          cta="Open Event Sourcer →"
          last
        />
      </div>
    </div>
  );
}

function ToolRow({
  n,
  title,
  body,
  href,
  cta,
  last,
}: {
  n: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[72px_1fr_160px] items-start ${
        last ? "" : "border-b border-ink-border"
      }`}
    >
      <div className="bg-navy px-4 py-4 text-center text-[18px] font-bold text-white">
        {n}
      </div>
      <Link href={href} className="block px-5 py-4 transition hover:bg-bg-card">
        <div className="text-[14px] font-bold text-navy">{title}</div>
        <p className="mt-1 text-[13px] leading-[1.55] text-ink">{body}</p>
      </Link>
      <div className="flex items-center justify-end px-4 py-4">
        <Link
          href={href}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
