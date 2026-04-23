/*
  Composes the final prompt sent to Dust.

  Takes the operator-facing form inputs, writes them into the
  RUNTIME INPUTS block that the base system prompt expects, and
  returns one flat string ready to send as the user message.

  Defaults match the base prompt's noted fallbacks.
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

  lines.push("RUNTIME INPUTS:");
  lines.push("");
  lines.push(`1. PARTNER NAME: ${i.partnerName.trim()}`);
  lines.push(`2. PARTNER HOME BASE: ${i.partnerHomeBase.trim() || "—"}`);
  lines.push(`3. PARTNER FOCUS: ${i.partnerFocus.trim()}`);
  lines.push(`4. AUDIENCE TARGETS: ${i.audienceTargets.trim()}`);
  lines.push(`5. THEME TARGETS: ${i.themeTargets.trim()}`);
  lines.push(
    `6. TIME WINDOW: ${i.windowStart} to ${i.windowEnd}`
  );
  lines.push(
    `7. REGIONAL SCOPE: ${(i.regionalScope ?? "Global").trim() || "Global"}`
  );

  if (i.industry && i.industry.trim()) {
    lines.push(`8. INDUSTRY FOCUS: ${i.industry.trim()}`);
  }

  if (i.seedEvents && i.seedEvents.trim()) {
    lines.push(`9. SEED EVENTS: ${i.seedEvents.trim()}`);
  }

  if (typeof i.sessionSize === "number" && i.sessionSize > 0) {
    lines.push(`10. SESSION SIZE: ${i.sessionSize} new events`);
  } else if (
    typeof i.eventCountMin === "number" ||
    typeof i.eventCountMax === "number"
  ) {
    const min = i.eventCountMin ?? 10;
    const max = i.eventCountMax ?? 20;
    lines.push(
      `10. SESSION SIZE: between ${min} and ${max} new events (operator chose a range — pick a specific number in that range based on how many candidates pass hard filters)`
    );
  } else {
    lines.push(`10. SESSION SIZE: 15 new events (default)`);
  }

  if (i.qMonthSplit && i.qMonthSplit.trim()) {
    lines.push(`11. Q/MONTH SPLIT: ${i.qMonthSplit.trim()}`);
  }

  if (typeof i.haloCapPercent === "number") {
    lines.push(`12. HALO EVENT CAP: ${i.haloCapPercent}% of final list`);
  }

  lines.push("");
  lines.push(
    "Google Calendar and tracker-doc lookups are disabled for this run. Proceed without startup procedure A/B/C and flag any events that look like likely duplicates in Verification Notes."
  );
  lines.push("");
  lines.push(
    "Produce the event list in the EVENT FORMAT specified in the system prompt. Sort by start date ascending. End with the Session summary and Verification notes blocks."
  );

  return lines.join("\n");
}
