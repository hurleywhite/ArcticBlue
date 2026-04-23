import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

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
          Every session is seeded with context from the Canvas, a module exercise, or a
          curated prompt.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">Three sections</h2>
      <div className="border border-ink-border">
        <ToolRow
          n="01"
          title="Practice — a seeded chat sandbox"
          body="Start a session from a Canvas opportunity, a module exercise, a prompt from the library, or blank. Claude Sonnet 4.6 responds with streaming. Sessions persist; export as markdown."
          href="/tools/practice"
          status="Phase 1D"
        />
        <ToolRow
          n="02"
          title="Prompt Library"
          body="12 curated prompts spanning competitor analysis, interview synthesis, product briefs, meeting notes, strategy memos, SWOT-style analysis, and more."
          href="/tools/prompts"
          status="Phase 1D"
        />
        <ToolRow
          n="03"
          title="Templates"
          body="6 structured templates — email, brief, analysis, plan formats. Fill variables, copy to clipboard, export to branded PDF, or pipe into Practice."
          href="/tools/templates"
          status="Phase 1D"
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
  status,
  last,
}: {
  n: string;
  title: string;
  body: string;
  href: string;
  status: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[72px_1fr_120px] items-start ${
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
      <div className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        {status}
      </div>
    </div>
  );
}
