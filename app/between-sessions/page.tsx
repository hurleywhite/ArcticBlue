import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { MODULES } from "@/lib/content/modules";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";
import { RESOURCES } from "@/lib/content/resources";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

export const metadata = { title: "Between sessions · ArcticMind" };

export default function BetweenSessionsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Between sessions"
        title="The support surfaces for your Lab."
      />

      <div className="callout mt-6">
        <p>
          The Lab is the product. These are the surfaces you use between sessions —
          to bring real work into the next Lab, to practice what you learned in the
          last one, and to see how other teams have solved the same problems.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">Tools to bring to your next Lab</h2>
      <div className="border border-ink-border">
        <LinkRow
          kicker="Mirror"
          title="See a company's opportunity field"
          body="Domain in. An orbital map of eight AI opportunities sized by impact and positioned by readiness. Star the ones worth pursuing, export a branded brief. Great for meeting prep."
          stat="Curated archetypes · 5 demo companies"
          href="/mirror"
        />
        <LinkRow
          kicker="Canvas"
          title="Map AI opportunities for a role and industry"
          body="Pick a role and an industry — ArcticMind plots 8 specific opportunities across 3 strategic lenses. Star the ones you'd like to bring to the Lab as challenge candidates."
          stat={`${Object.keys(DEMO_DATA).length} role × industry templates`}
          href="/canvas"
        />
        <LinkRow
          kicker="Analyzer"
          title="Inspect a specific company's AI posture"
          body="Domain in. Firmographics, detected tech stack, AI-adoption signals, recent news — ready to frame as a Lab challenge or customer profile."
          stat="Apollo + Exa + Claude"
          href="/analyzer"
        />
        <LinkRow
          kicker="Practice"
          title="Try the workflow before the session"
          body="Seeded chat sandbox. Pick a Canvas opportunity, a module exercise, or a prompt and work it end-to-end. Export the session as an artifact you can share in the next Lab."
          stat="Claude Sonnet 4.6"
          href="/tools/practice"
          last
        />
      </div>

      <h2 className="section-header mt-10 mb-3">Reference material</h2>
      <div className="border border-ink-border">
        <LinkRow
          kicker="Use Cases"
          title="Anonymized proof points from ArcticBlue engagements"
          body="Challenge · approach · outcome for each case. Story, one-pager PDF, slides. Read the one closest to your Lab challenge before the session."
          stat={`${USE_CASES.length} cases`}
          href="/use-cases"
        />
        <LinkRow
          kicker="Prompt library"
          title="Curated prompts with fillable variables"
          body="Competitor brief, customer interview synthesis, product brief, meeting notes → actions, strategy memo, data exploration, RFP analysis, and more."
          stat={`${PROMPTS.length} prompts`}
          href="/tools/prompts"
        />
        <LinkRow
          kicker="Templates"
          title="Structured output scaffolding"
          body="The target shape for common deliverables — post-meeting email, product one-pager, interview synthesis framework, pilot scoping doc."
          stat={`${TEMPLATES.length} templates`}
          href="/tools/templates"
        />
        <LinkRow
          kicker="Resources"
          title="Frameworks, glossary, playbooks"
          body="EU AI Act, ISO 42001, NIST AI RMF, HIPAA / AI. Glossary entries for RAG, fine-tuning, agents. Scoping and governance playbooks."
          stat={`${RESOURCES.length} entries`}
          href="/resources"
          last
        />
      </div>

      <h2 className="section-header mt-10 mb-3">Quick stats</h2>
      <div className="grid grid-cols-2 gap-0 border border-ink-border md:grid-cols-4">
        <Stat label="Modules" value={MODULES.length} />
        <Stat label="Use cases" value={USE_CASES.length} />
        <Stat label="Prompts + templates" value={PROMPTS.length + TEMPLATES.length} />
        <Stat label="Resources" value={RESOURCES.length} last />
      </div>
    </div>
  );
}

function LinkRow({
  kicker,
  title,
  body,
  stat,
  href,
  last,
}: {
  kicker: string;
  title: string;
  body: string;
  stat: string;
  href: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group grid grid-cols-[90px_1fr_140px] items-start transition hover:bg-bg-card ${
        last ? "" : "border-b border-ink-border"
      }`}
    >
      <div className="bg-navy px-3 py-4 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-white">
        {kicker}
      </div>
      <div className="px-5 py-4">
        <div className="text-[14px] font-bold text-navy">{title}</div>
        <p className="mt-1 text-[13px] leading-[1.55] text-ink">{body}</p>
      </div>
      <div className="flex items-start justify-end px-4 py-4">
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            {stat}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
            Open →
          </div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, last }: { label: string; value: number; last?: boolean }) {
  return (
    <div className={`bg-bg-card px-5 py-4 ${last ? "" : "md:border-r md:border-ink-border"} border-b border-ink-border md:border-b-0`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">{label}</div>
      <div className="mt-1 text-[22px] font-bold text-navy">{value}</div>
    </div>
  );
}
