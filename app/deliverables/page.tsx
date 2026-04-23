import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { DELIVERABLES } from "@/lib/content/deliverables";

export const metadata = { title: "Deliverables · ArcticMind" };

/*
  Deliverables gallery. Each card opens a multi-step workflow that
  turns the user's input into a branded client-ready artifact. This
  is the workshop, not a chat box.
*/

export default function DeliverablesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Deliverables"
        title="Run ArcticBlue's methods on your client work."
      />

      <div className="callout mt-6">
        <p>
          Each deliverable is a guided workflow — intake form, structured draft,
          inline editing, branded PDF export. Partners can add their own byline
          and optionally route the client back to ArcticBlue for Practical Labs.
        </p>
      </div>

      <h2 className="section-header mt-10 mb-3">Deliverable types</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DELIVERABLES.map((d) => (
          <Link
            key={d.id}
            href={`/deliverables/${d.slug}`}
            className="group block border border-ink-border bg-white transition hover:border-navy"
          >
            <div className="flex items-start justify-between bg-navy px-5 py-3 text-white">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">
                  {d.category} · ~{d.minutes} min
                </div>
                <div className="mt-0.5 text-[16px] font-bold leading-[1.2]">
                  {d.title}
                </div>
              </div>
              <span className="border border-white/30 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]">
                Workflow
              </span>
            </div>
            <div className="px-5 py-4">
              <p className="text-[13px] leading-[1.55] text-ink">{d.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-0 border border-ink-border">
                <div className="border-r border-ink-border bg-bg-card px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                    When
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink">{d.when_to_use}</div>
                </div>
                <div className="bg-bg-card px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                    Produces
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink">{d.produces}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end border-t border-ink-border pt-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:underline">
                  Start workflow →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
