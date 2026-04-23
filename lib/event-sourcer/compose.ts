/*
  Compose the user message sent to Dust.

  Two shapes:

  1. Hardcoded-partner runs (Anuraag, Scott, Jerome, Joe) — the
     partner profile is baked into the system prompt. The operator
     only supplies a small RUNTIME INPUTS block (TIME WINDOW,
     HOME BASE, SESSION SIZE, tracker note, and for Joe ACTIVE
     CLIENT CONTEXT).

  2. Generic runs (Thor / Blank) — the existing 1–13 RUNTIME INPUTS
     numbering that mirrors BASE_SYSTEM_PROMPT. Supplies partner
     focus / audience / themes from the form.

  Both shapes add a NOTE block telling the agent to skip STARTUP
  PROCEDURE steps A/B (google_calendar + google_drive are not wired
  yet) and deliver the FINAL DELIVERABLE inline as markdown if
  file_generation isn't available.
*/

export type EventSourcerInputs = {
  presetId?: string;
  promptKey?:
    | "generic"
    | "anuraag"
    | "scott"
    | "jerome"
    | "joe";
  // Generic-flow fields (only used when promptKey === "generic"):
  partnerName?: string;
  partnerFocus?: string;
  audienceTargets?: string;
  themeTargets?: string;
  // Shared by both flows:
  partnerHomeBase?: string;
  windowStart: string;
  windowEnd: string;
  regionalScope?: string;
  seedEvents?: string;
  sessionSize?: number;
  qMonthSplit?: string;
  haloCapPercent?: number;
  industry?: string;
  eventCountMin?: number;
  eventCountMax?: number;
  // Joe-only:
  activeClientContext?: string;
};

const tr = (s: string | undefined) => (s ?? "").trim();

function resolveSessionSize(i: EventSourcerInputs): string {
  if (typeof i.sessionSize === "number" && i.sessionSize > 0) {
    return `${i.sessionSize} new events`;
  }
  if (
    typeof i.eventCountMin === "number" ||
    typeof i.eventCountMax === "number"
  ) {
    const min = i.eventCountMin ?? 10;
    const max = i.eventCountMax ?? 20;
    return `between ${min} and ${max} new events (operator specified a range — pick a specific number in that range based on how many candidates pass hard filters; never pad to hit it)`;
  }
  return "15 (default)";
}

export function composeUserMessage(i: EventSourcerInputs): string {
  const key = i.promptKey ?? "generic";
  if (key === "generic") return composeGeneric(i);
  return composeHardcoded(i, key);
}

function composeGeneric(i: EventSourcerInputs): string {
  const lines: string[] = [];

  const focusBase = tr(i.partnerFocus);
  const focus = tr(i.industry)
    ? `${focusBase} · Industry focus for this run: ${tr(i.industry)}.`
    : focusBase;

  lines.push(
    "RUNTIME INPUTS (all that can be supplied; see NOTE at end for integration-gated inputs):"
  );
  lines.push("");
  lines.push(`1. PARTNER NAME: ${tr(i.partnerName)}`);
  lines.push(
    `2. PARTNER EMAIL / CALENDAR IDENTIFIER: N/A — google_calendar integration not wired for this run. Skip STARTUP PROCEDURE step A.`
  );
  lines.push(
    `3. PARTNER HOME BASE: ${tr(i.partnerHomeBase) || "Not specified"}`
  );
  lines.push(
    `4. PARTNER TRACKER DOC URL: N/A — google_drive integration not wired for this run. Skip STARTUP PROCEDURE step B. Treat the "already tracked" set as empty.`
  );
  lines.push(`5. PARTNER FOCUS: ${focus}`);
  lines.push(`6. AUDIENCE TARGETS: ${tr(i.audienceTargets)}`);
  lines.push(`7. THEME TARGETS: ${tr(i.themeTargets)}`);
  lines.push(`8. TIME WINDOW: ${tr(i.windowStart)} to ${tr(i.windowEnd)}`);
  lines.push(`9. REGIONAL SCOPE: ${tr(i.regionalScope) || "Global"}`);
  lines.push(
    `10. SEED EVENTS: ${tr(i.seedEvents) || "None supplied"}`
  );
  lines.push(`11. SESSION SIZE: ${resolveSessionSize(i)}`);
  lines.push(
    `12. Q/MONTH SPLIT: ${
      tr(i.qMonthSplit) || "default (~2/3 earlier window, ~1/3 later)"
    }`
  );
  lines.push(
    `13. HALO EVENT CAP: ${
      typeof i.haloCapPercent === "number"
        ? `${i.haloCapPercent}%`
        : "10% (default)"
    }`
  );
  lines.push("");
  lines.push(...noteBlock());
  lines.push("");
  lines.push("Begin research now.");
  return lines.join("\n");
}

function composeHardcoded(
  i: EventSourcerInputs,
  key: Exclude<EventSourcerInputs["promptKey"], "generic" | undefined>
): string {
  const lines: string[] = [];
  lines.push("RUNTIME INPUTS (partner profile is baked into the system prompt):");
  lines.push("");
  lines.push(`1. TIME WINDOW: ${tr(i.windowStart)} to ${tr(i.windowEnd)}`);
  lines.push(
    `2. TRACKER DOC URL: N/A — google_drive integration not wired for this run. Skip STARTUP PROCEDURE step B. Treat the "already tracked" set as empty; no events are excluded on tracker grounds.`
  );
  lines.push(`3. SESSION SIZE: ${resolveSessionSize(i)}`);

  const home = tr(i.partnerHomeBase);
  if (key === "jerome") {
    lines.push(
      `4. HOME BASE: ${home || "London (default assumption per prompt)"}`
    );
  } else {
    lines.push(
      `4. HOME BASE: ${home || "Not specified — tag travel burden at your best judgement"}`
    );
  }

  if (key === "joe") {
    lines.push(
      `5. ACTIVE CLIENT CONTEXT: ${
        tr(i.activeClientContext) ||
        "None supplied — do not include Client-Context events in this run."
      }`
    );
  }

  // Optional operator bias fields the prompt doesn't list but the
  // form allows. Append as a SUPPLEMENTAL block so they don't clash
  // with the numbered inputs.
  const supplemental: string[] = [];
  const seeds = tr(i.seedEvents);
  if (seeds) {
    supplemental.push(
      `- Seed events (operator flagged for in-window check; do not re-propose): ${seeds}`
    );
  }
  const industry = tr(i.industry);
  if (industry) {
    supplemental.push(
      `- Industry bias for this run: ${industry}. Weight candidates toward this industry while respecting the hardcoded sector lens.`
    );
  }
  const region = tr(i.regionalScope);
  if (region) {
    supplemental.push(
      `- Regional bias for this run: ${region}. Hardcoded regional rules still apply; narrow further within them.`
    );
  }
  if (typeof i.haloCapPercent === "number") {
    supplemental.push(
      `- Halo cap override: ${i.haloCapPercent}% (overrides the prompt default if different).`
    );
  }
  if (supplemental.length) {
    lines.push("");
    lines.push("SUPPLEMENTAL OPERATOR BIAS (optional, non-conflicting):");
    lines.push(...supplemental);
  }

  lines.push("");
  lines.push(...noteBlock());
  lines.push("");
  lines.push("Begin research now.");
  return lines.join("\n");
}

function noteBlock(): string[] {
  return [
    "NOTE:",
    "- google_calendar and google_drive tools are not available in this environment yet.",
    "- Skip STARTUP PROCEDURE steps A and B. Proceed directly to research. Do NOT stop to ask the operator.",
    "- Since calendar + tracker reads are skipped, the FINAL DELIVERABLE's Calendar Context section should say \"Calendar integration not yet wired — no confirmed travel captured for this run.\"",
    "- file_generation may or may not be available. If it is, produce the .docx per the FINAL DELIVERABLE spec. If it is not, deliver the full event list and all specified tables inline as structured markdown in the same order — Title/Subtitle, Calendar Context, (Seed Event Status / Composition Summary per the partner prompt), Full Event List, Top 10 Recommendations — so the operator can copy it straight out.",
  ];
}
