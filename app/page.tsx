import Link from "next/link";
import { ACCOUNTS, formatMeetingWhen, getNextMeetingAccount } from "@/lib/content/accounts";
import { USE_CASES } from "@/lib/content/use-cases";
import { PROMPTS } from "@/lib/content/prompts";
import { TEMPLATES } from "@/lib/content/templates";
import { RESOURCES } from "@/lib/content/resources";
import { MODULES } from "@/lib/content/modules";
import { DELIVERABLES } from "@/lib/content/deliverables";
import { FACILITATORS } from "@/lib/content/facilitators";
import { LandingHero, LandingSurfaces, NextUpStrip } from "./landing-surfaces";

/*
  Landing page. Hero is Instrument-Serif display on the ink canvas,
  with a breathing focal element. Surfaces below render as staggered
  cards with subtle hover-reveal borders.
*/

export default function HomePage() {
  const next = getNextMeetingAccount();
  const libraryCount =
    PROMPTS.length +
    TEMPLATES.length +
    USE_CASES.length +
    RESOURCES.length +
    MODULES.length;

  return (
    <div className="shell">
      <LandingHero />

      {next && next.next_meeting && (
        <NextUpStrip
          accountId={next.id}
          company={next.company_name}
          title={next.next_meeting.title}
          whenLabel={formatMeetingWhen(next.next_meeting.when)}
          poc={`${next.poc_name} · ${next.poc_title}`}
          attendeeCount={next.next_meeting.attendees.length}
        />
      )}

      <LandingSurfaces
        accountCount={ACCOUNTS.length}
        deliverableCount={DELIVERABLES.length}
        facilitatorCount={FACILITATORS.length}
        libraryCount={libraryCount}
      />

      <div className="mb-32 mt-20">
        <div className="mb-6 flex items-center gap-3">
          <span className="kicker">Shortcuts</span>
          <span
            className="h-px flex-1"
            style={{ background: "var(--fg-16)" }}
          />
        </div>
        <div
          className="grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4"
          style={{ background: "var(--fg-16)" }}
        >
          <ShortcutTile
            href="/deliverables/interview-synthesis"
            title="Interview synthesis"
            sub="Branded client brief"
          />
          <ShortcutTile
            href="/facilitators"
            title="Facilitators"
            sub={`${FACILITATORS.length} in the pool`}
          />
          <ShortcutTile href="/mirror" title="Mirror" sub="Opportunity field" />
          <ShortcutTile
            href="/showcase/cases"
            title="Case deck"
            sub="Click-through stories"
          />
        </div>
      </div>
    </div>
  );
}

function ShortcutTile({
  href,
  title,
  sub,
}: {
  href: string;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between gap-6 px-5 py-6 transition-all duration-200"
      style={{
        background: "var(--ink)",
        transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
        style={{
          boxShadow: "inset 0 0 0 1px var(--frost-glow)",
          transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      />
      <div className="kicker-sm">{sub}</div>
      <div>
        <div
          className="serif-tight text-[22px] leading-[1.1]"
          style={{ color: "var(--fg-100)" }}
        >
          {title}
        </div>
        <div
          className="mt-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--frost)" }}
        >
          <span>Open</span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
