/*
  Composes the user message sent to Dust.

  Mirrors the system prompt's RUNTIME INPUTS numbering (1–13) exactly
  so the agent can match values to slots. Inputs 2 (PARTNER EMAIL) and
  4 (PARTNER TRACKER DOC URL) are explicitly marked N/A with a note
  to skip STARTUP PROCEDURE steps A/B and treat the already-tracked
  set as empty — until the google_calendar + google_drive integrations
  are wired in.
*/

export type EventSourcerInputs = {
  partnerName: string;
  partnerHomeBase: string;
  partnerFocus: string;
  audienceTargets: string;
  themeTargets: string;
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
};

export function composeUserMessage(i: EventSourcerInputs): string {
  const lines: string[] = [];

  // Session-size resolution: specific number > range > default.
  let sessionSizeLine: string;
  if (typeof i.sessionSize === "number" && i.sessionSize > 0) {
    sessionSizeLine = `${i.sessionSize} new events`;
  } else if (
    typeof i.eventCountMin === "number" ||
    typeof i.eventCountMax === "number"
  ) {
    const min = i.eventCountMin ?? 10;
    const max = i.eventCountMax ?? 20;
    sessionSizeLine = `between ${min} and ${max} new events (operator specified a range — pick a specific number in that range based on how many candidates pass hard filters; never pad to hit it)`;
  } else {
    sessionSizeLine = `15 (default)`;
  }

  // Partner focus — fold Industry in if the operator supplied one.
  const focusBase = (i.partnerFocus ?? "").trim();
  const focus = i.industry?.trim()
    ? `${focusBase} · Industry focus for this run: ${i.industry.trim()}.`
    : focusBase;

  const tr = (s: string | undefined) => (s ?? "").trim();

  lines.push("RUNTIME INPUTS (all that can be supplied; see NOTE at end for integration-gated inputs):");
  lines.push("");
  lines.push(`1. PARTNER NAME: ${tr(i.partnerName)}`);
  lines.push(
    `2. PARTNER EMAIL / CALENDAR IDENTIFIER: N/A — google_calendar integration not wired for this run. Skip STARTUP PROCEDURE step A.`
  );
  lines.push(`3. PARTNER HOME BASE: ${tr(i.partnerHomeBase) || "Not specified"}`);
  lines.push(
    `4. PARTNER TRACKER DOC URL: N/A — google_drive integration not wired for this run. Skip STARTUP PROCEDURE step B. Treat the "already tracked" set as empty; no events are excluded on tracker grounds.`
  );
  lines.push(`5. PARTNER FOCUS: ${focus}`);
  lines.push(`6. AUDIENCE TARGETS: ${tr(i.audienceTargets)}`);
  lines.push(`7. THEME TARGETS: ${tr(i.themeTargets)}`);
  lines.push(`8. TIME WINDOW: ${tr(i.windowStart)} to ${tr(i.windowEnd)}`);
  lines.push(`9. REGIONAL SCOPE: ${tr(i.regionalScope) || "Global"}`);
  lines.push(
    `10. SEED EVENTS: ${tr(i.seedEvents) || "None supplied"}`
  );
  lines.push(`11. SESSION SIZE: ${sessionSizeLine}`);
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
  lines.push("NOTE:");
  lines.push(
    "- Inputs 2 and 4 are intentionally not provided because the google_calendar and google_drive tools are not available in this environment yet."
  );
  lines.push(
    "- Proceed directly to research. Do NOT stop to ask the operator to supply them."
  );
  lines.push(
    '- Since STARTUP PROCEDURE steps A/B are skipped, the "Calendar Context" section of the FINAL DELIVERABLE should note "Calendar integration not yet wired — no confirmed travel captured for this run." The "Seed Event Status" section renders only the SEED EVENTS you were given (input 10), or is marked "No seed events supplied" if input 10 is None.'
  );
  lines.push(
    "- file_generation may or may not be available. If it is, produce the .docx per the FINAL DELIVERABLE spec. If it is not, deliver the full event list and tables inline as structured markdown in the same order — Title/Subtitle, Calendar Context, Seed Event Status, Composition Summary, Full Event List, Top 10 Recommendations — so the operator can copy it straight out."
  );
  lines.push("");
  lines.push("Begin research now.");

  return lines.join("\n");
}
