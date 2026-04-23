/*
  Practical Labs — the monthly live working sessions ArcticBlue runs
  with client teams. This is the product the one-pager sells. The app's
  job is to be the between-session home.

  Seeded with one upcoming Lab (this month) and two historical Labs so
  the timeline on /lab has content immediately. When Supabase is wired,
  labs come from the labs table and artifacts from lab_artifacts.
*/

export type LabStatus = "upcoming" | "in_progress" | "completed" | "canceled";

export type LabArtifact = {
  id: string;
  user_name: string;
  user_role?: string;
  title: string;
  content_markdown: string;
  shared_to_team: boolean;
  created_at: string;
};

export type LabTool = {
  name: string;
  why: string;
  url?: string;
};

export type Lab = {
  id: string;
  month: string; // YYYY-MM-01
  title: string;
  challenge_brief: string;
  pre_work_markdown: string;
  pre_work_module_slugs?: string[];
  pre_work_prompt_slugs?: string[];
  session_datetime: string; // ISO
  session_duration_minutes: number;
  meeting_url?: string;
  facilitator_name: string;
  facilitator_bio: string;
  status: LabStatus;
  tools_featured: LabTool[];
  agenda_markdown: string;
  recap_markdown?: string; // set after completion
  artifacts: LabArtifact[]; // shared_to_team rows
  attendance?: { invited: number; attended: number; }; // post-session
};

function iso(year: number, month: number, day: number, hour: number, minute: number) {
  // Use UTC so seeded values are stable across environments
  return new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString();
}

export const LABS: Lab[] = [
  // ─── Current month (April 2026) — upcoming ──────────────────────────────────
  {
    id: "lab-2026-04",
    month: "2026-04-01",
    title: "Turning raw customer interviews into a board-ready synthesis",
    challenge_brief: `Every team in this room has a stack of interview notes sitting somewhere. Over the next 90 minutes we're going to turn a specific one — an interview set your team brings — into a sharp, board-ready synthesis. Themes, contradictions, named decisions, verbatim quotes. The output is the thing you would have written yourself in a day, produced in an hour, with the team evaluating it live for sharpness and specificity.`,
    pre_work_markdown: `**Do in advance (15 min):**

- Pick one set of 4–8 customer interview transcripts or notes your team has from the last quarter. Don't overthink the pick — any set that was meant to produce a decision is fair game.
- Skim the *Customer interview synthesis* prompt in the library so you know the input format we'll use live.
- Read the *Prompt engineering foundations* module if you haven't already. It's the framework we use in the room.

**Bring to the session:**

- Laptop, Claude or ChatGPT access, and the interview set.
- One specific decision you were hoping the interviews would inform. We'll use it as the synthesis's target.`,
    pre_work_module_slugs: ["prompt-engineering-foundations", "experimentation-method"],
    session_datetime: iso(2026, 4, 29, 17, 0), // 29 Apr 2026, 5pm UTC
    session_duration_minutes: 90,
    meeting_url: "https://zoom.us/j/placeholder",
    facilitator_name: "Dana Rivera",
    facilitator_bio: "ArcticBlue facilitator. Runs enterprise AI enablement programs across financial services and healthcare. Eight years in applied research before switching sides.",
    status: "upcoming",
    tools_featured: [
      {
        name: "Claude Projects",
        why: "Drop the interviews in as a project, work across them with preserved context",
        url: "https://claude.ai",
      },
      {
        name: "ChatGPT Canvas",
        why: "Iterate on the synthesis draft side-by-side with the model",
      },
      {
        name: "Granola / Otter",
        why: "Pre-session: turn recorded interviews into usable transcripts",
      },
    ],
    agenda_markdown: `## Agenda · 90 minutes

- **00–05** · Quick intros and pick the target decision
- **05–20** · First-pass synthesis with the prompt from the library — produce a draft
- **20–40** · Team critique: what's generic, what's weak, what's missing
- **40–70** · Second pass with structured pushback — work theme-by-theme to sharpen
- **70–85** · Share out: each person reads one theme with supporting quote
- **85–90** · Decide: would this synthesis unblock the decision we set out to make?`,
    artifacts: [],
  },

  // ─── Last month (March 2026) — completed ────────────────────────────────────
  {
    id: "lab-2026-03",
    month: "2026-03-01",
    title: "Building a weekly competitor brief that survives the inbox",
    challenge_brief: `Competitor intel the team actually reads starts as a prompt, not a dashboard. This session: each table builds a reusable prompt for their real competitor set, runs it against a fresh news dump, critiques the output, and takes home the version that's ready to schedule weekly.`,
    pre_work_markdown: `**Do in advance:** Pull together a raw dump of the last 30 days of press, releases, and product notes on 3 named competitors. Just paste it somewhere you can copy from.`,
    pre_work_module_slugs: ["prompt-engineering-foundations"],
    pre_work_prompt_slugs: ["competitor-brief-weekly"],
    session_datetime: iso(2026, 3, 27, 17, 0),
    session_duration_minutes: 90,
    facilitator_name: "Joe Nussbaum",
    facilitator_bio: "ArcticBlue principal. Fifteen years in enterprise product and platform strategy.",
    status: "completed",
    tools_featured: [
      { name: "Claude Sonnet 4.6", why: "Long context for a full month of press, tight output" },
      { name: "ChatGPT Projects", why: "Keep the prompt and the competitor source list together" },
    ],
    agenda_markdown: `## Agenda

- First pass: everyone runs their prompt, shares the output
- Sharpening round: eliminate hedge language, enforce the 80-word-per-competitor cap
- Second pass on the refined prompt
- Commit to a weekly cadence and name the owner`,
    recap_markdown: `**What worked.** Teams that started with named competitors (not "the CRM space") produced briefs that were actually useful on the first pass. The 80-word hard cap did more for quality than any other constraint — it killed hedge language.

**What didn't.** Two teams tried to include "anything interesting" in scope. Briefs became newsletters. The constraint we settled on across the room: *one move per competitor per week, or nothing*.

**Takeaway prompt:** The [Weekly competitor brief](/tools/prompts/competitor-brief-weekly) in the library is the v2 we landed on together — with the 80-word cap and the "no hedge language" rule baked in.`,
    artifacts: [
      {
        id: "art-2026-03-01",
        user_name: "Amy K.",
        user_role: "Product Marketing Lead",
        title: "My v2 competitor brief prompt",
        content_markdown: `Locked the role + audience line so it's easier to hand off to our junior PMM.\n\nKey change from the v1: hard-coded the 80-word cap and added a "no 'it remains to be seen'" rule to the format section. Cut our review pass from 30 min to 10.`,
        shared_to_team: true,
        created_at: iso(2026, 3, 28, 14, 0),
      },
      {
        id: "art-2026-03-02",
        user_name: "Marcus T.",
        user_role: "Chief of Staff",
        title: "Scheduling + handoff runbook",
        content_markdown: `Here's how we wire this into a weekly cadence without anyone hating it:\n\n1. Prompt lives in our shared Claude Project\n2. Monday 9am: junior PMM runs it, posts output in #competitive-intel\n3. Tuesday morning: I skim + flag the one move that belongs on the CMO agenda\n4. CMO sees at most 3 competitor moves per week, not a 40-item firehose`,
        shared_to_team: true,
        created_at: iso(2026, 3, 28, 16, 30),
      },
      {
        id: "art-2026-03-03",
        user_name: "Priya S.",
        user_role: "Strategy Analyst",
        title: "Source list — what we're feeding into the prompt",
        content_markdown: `Consolidated the source set so everyone's working from the same inputs:\n\n- Crunchbase: named competitors only\n- Press: G2, company blog RSS\n- Product: release-note pages\n- Press release distribution (BusinessWire filter on our 12 named competitors)\n\nSkipped Twitter/X entirely. Signal-to-noise ratio wasn't worth it.`,
        shared_to_team: true,
        created_at: iso(2026, 3, 29, 9, 15),
      },
    ],
    attendance: { invited: 20, attended: 17 },
  },

  // ─── Two months ago (February 2026) — completed ────────────────────────────
  {
    id: "lab-2026-02",
    month: "2026-02-01",
    title: "Getting useful work out of meeting transcripts",
    challenge_brief: `Your org records more meetings than it summarizes. We turn that ratio around. Each attendee brings a real, recent meeting transcript and by the end of the session has a reusable pipeline: transcript in → decisions, actions, open questions out — ready to send as the post-meeting note.`,
    pre_work_markdown: `Pull one recent meeting transcript — Granola, Otter, Fireflies, whatever your team uses. Pick one where the followups were messy enough that a better summary would've mattered.`,
    pre_work_prompt_slugs: ["meeting-notes-to-actions"],
    pre_work_module_slugs: ["prompt-engineering-foundations"],
    session_datetime: iso(2026, 2, 27, 17, 0),
    session_duration_minutes: 90,
    facilitator_name: "Priya Menon",
    facilitator_bio: "ArcticBlue facilitator. Specializes in ops-facing AI pilots in regulated industries.",
    status: "completed",
    tools_featured: [
      { name: "Granola", why: "Meeting capture + structured handoff to downstream prompts" },
      { name: "ChatGPT Advanced Voice", why: "Iterate on summaries verbally while editing" },
      { name: "Claude Sonnet 4.6", why: "Long context = full 60-minute transcripts in one shot" },
    ],
    agenda_markdown: `## Agenda

- Define "decisions / actions / open questions" format — the team's minimum viable note
- First pass against the prompt from the library
- Verify against ground truth (did the model miss anything material?)
- Wire in the post-meeting email template as the output scaffold
- Commit to a 48-hour-after-meeting cadence`,
    recap_markdown: `**What worked.** The format discipline — *Decisions / Actions / Open questions* with named owners and dates — was the thing. Teams that enforced it produced notes people actually read. Teams that let the format drift back to narrative summaries produced notes that got ignored.

**What didn't.** Two teams tried to auto-send. Bad call — the model misattributed one action item to the wrong person in a legal review. We landed on: AI drafts, a human edits, one-minute handoff.

**Takeaway pair:** The [Meeting notes → action items](/tools/prompts/meeting-notes-to-actions) prompt + the [Post-meeting actions email](/tools/templates/post-meeting-actions-email) template are the pairing we landed on. Use them together.`,
    artifacts: [
      {
        id: "art-2026-02-01",
        user_name: "Nina P.",
        user_role: "Director, Product Ops",
        title: "Our ops weekly — final template",
        content_markdown: `Locked our ops team's post-sync format to the one from session:\n\n- **Decisions made** (complete sentences, out-of-context readable)\n- **Actions** (Action · Owner · Due — tabulated)\n- **Open questions** for next sync\n\nThree syncs in since the session and this is sticking. Team complained at first about the rigidity; now they read the notes.`,
        shared_to_team: true,
        created_at: iso(2026, 2, 28, 18, 45),
      },
      {
        id: "art-2026-02-02",
        user_name: "Tomás R.",
        user_role: "VP Engineering",
        title: "The 'one-minute edit' rule",
        content_markdown: `The one change that made this workflow land: *the AI draft always gets a one-minute human pass before going out.* Stops misattribution, preserves trust, the discipline is the work.\n\nI now block 5 minutes after every recurring sync just to do this. Worth it.`,
        shared_to_team: true,
        created_at: iso(2026, 3, 2, 10, 0),
      },
    ],
    attendance: { invited: 20, attended: 19 },
  },
];

export function getLabById(id: string) {
  return LABS.find((l) => l.id === id);
}

export function getLabByMonth(month: string) {
  // month = YYYY-MM-01
  return LABS.find((l) => l.month === month);
}

export function getCurrentLab(): Lab | undefined {
  // First upcoming or in_progress; otherwise the most recent
  const active = LABS.find((l) => l.status === "upcoming" || l.status === "in_progress");
  if (active) return active;
  return [...LABS].sort((a, b) => b.month.localeCompare(a.month))[0];
}

export function getPastLabs(): Lab[] {
  return LABS.filter((l) => l.status === "completed").sort((a, b) => b.month.localeCompare(a.month));
}

export function getNextScheduledLab(): Lab | undefined {
  const upcoming = LABS.filter((l) => l.status === "upcoming").sort((a, b) => a.month.localeCompare(b.month));
  return upcoming[1]; // second upcoming, if there is one
}

export function formatMonth(month: string): string {
  const date = new Date(month);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
