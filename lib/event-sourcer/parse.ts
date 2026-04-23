/*
  Parse the streamed markdown output from the Event Sourcer into
  structured records. Matches the EVENT FORMAT defined in Hurley's
  system prompt:

    ### [N]. [Event Name]
    **Link**: ...
    **Dates**: ...
    **Location**: ...
    **Type**: Enterprise / Halo / Seed
    **Why it fits**: ...
    **About**: ...
    **Focus areas**:
    - bullet
    - bullet
    **Typical attendees**: ...
    **Speaking route**:
    - CFP/speaker page: ...
    - Contact: ...
    - Deadline: ...
    **Pay-to-play for speaking**: Yes / No / Unknown
    **Travel burden from PARTNER HOME BASE**: Local / Regional / Long-haul
    **Priority**: High / Medium / Low

  Fields that hold a bulleted sub-block (Focus areas, Speaking route)
  are captured as the raw multi-line string so the renderer can lay
  them out faithfully without losing anything.
*/

export type EventType = "Enterprise" | "Halo" | "Seed" | string;
export type Priority = "High" | "Medium" | "Low" | string;
export type Travel = "Local" | "Regional" | "Long-haul" | string;

export type ParsedEvent = {
  num: string;
  title: string;
  link?: string;
  dates?: string;
  location?: string;
  type?: EventType;
  whyItFits?: string;
  about?: string;
  focusAreas?: string; // multi-line raw (bullets)
  typicalAttendees?: string;
  speakingRoute?: string; // multi-line raw (bullets)
  payToPlay?: string;
  travelBurden?: Travel;
  priority?: Priority;
  extra: Record<string, string>;
  raw: string;
};

export type ParsedOutput = {
  events: ParsedEvent[];
  sessionSummary?: string;
  verificationNotes?: string;
  calendarContext?: string;
  seedStatus?: string;
  trailing: string;
};

// Map the bold labels in the prompt → our ParsedEvent keys.
// Whatever isn't in this map lands in `extra`. We handle partner-name
// variants ("Why it fits Anuraag", "Travel burden from London") in
// normalizeLabel() before hitting this map.
const LABEL_MAP: Record<string, keyof ParsedEvent> = {
  link: "link",
  dates: "dates",
  location: "location",
  type: "type",
  "why it fits": "whyItFits",
  about: "about",
  "focus areas": "focusAreas",
  "typical attendees": "typicalAttendees",
  "speaking route": "speakingRoute",
  "pay-to-play for speaking": "payToPlay",
  "pay to play for speaking": "payToPlay",
  "travel burden": "travelBurden",
  priority: "priority",
};

// Normalize label variants from the different per-partner prompts to a
// canonical form. Returns the normalized label + a "preserve original
// extra-key" string when the variant carries additional info we want
// to keep for display (e.g. the named home base).
function normalizeLabel(raw: string): {
  canonical: string;
  displayKey?: string;
} {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  // "Why it fits Anuraag/Scott/Jerome/Joe" → "why it fits"
  if (lower.startsWith("why it fits")) {
    return { canonical: "why it fits" };
  }
  // "Travel burden from PARTNER HOME BASE" / "Travel burden from London" etc.
  if (lower.startsWith("travel burden")) {
    return { canonical: "travel burden" };
  }
  // "Joe's purpose" / "Format" / "Host/curator route available" /
  // "Sector lens" / "Network warmth for Jerome" — leave them for `extra`
  // but normalize casing so we don't get dup entries on "Format" vs
  // "format".
  return { canonical: lower, displayKey: trimmed };
}

const HEADING_RE = /^###\s+(\d+)\.\s*(.+?)\s*$/m;

export function parseEventOutput(md: string): ParsedOutput {
  if (!md.trim()) {
    return { events: [], trailing: "" };
  }

  const blocks = md.split(/\n-{3,}\n/).map((b) => b.trim());
  const events: ParsedEvent[] = [];
  const trailingChunks: string[] = [];

  for (const block of blocks) {
    const heading = block.match(HEADING_RE);
    if (heading) {
      events.push(parseEventBlock(block, heading[1], heading[2]));
    } else if (block) {
      trailingChunks.push(block);
    }
  }

  const trailing = trailingChunks.join("\n\n").trim();

  return {
    events,
    sessionSummary: extractTrailingField(trailing, "Session summary"),
    verificationNotes: extractTrailingField(trailing, "Verification notes"),
    calendarContext: extractTrailingField(trailing, "Calendar Context"),
    seedStatus: extractTrailingField(trailing, "Seed Event Status"),
    trailing,
  };
}

function parseEventBlock(
  block: string,
  num: string,
  title: string
): ParsedEvent {
  const event: ParsedEvent = {
    num,
    title: title.trim(),
    extra: {},
    raw: block,
  };

  const lines = block.split("\n").slice(1); // drop the heading
  let currentKey: keyof ParsedEvent | null = null;
  let currentExtraKey: string | null = null;
  let currentValue: string[] = [];

  const flush = () => {
    const v = currentValue.join("\n").trim();
    if (!v) {
      currentKey = null;
      currentExtraKey = null;
      currentValue = [];
      return;
    }
    if (currentKey) {
      // @ts-expect-error narrow assignment
      event[currentKey] = v;
    } else if (currentExtraKey) {
      event.extra[currentExtraKey] = v;
    }
    currentKey = null;
    currentExtraKey = null;
    currentValue = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    // New field starts when we see **Label**:  — may or may not have
    // inline value. Sub-bullets on following lines belong to whatever
    // the prior label was.
    const m = line.match(/^\s*\*\*([^:*]+?)\*\*\s*:\s*(.*)$/);
    if (m) {
      flush();
      const { canonical, displayKey } = normalizeLabel(m[1]);
      const value = m[2].trim();
      const mapped = LABEL_MAP[canonical];
      if (mapped) {
        currentKey = mapped;
      } else {
        currentExtraKey = displayKey ?? m[1].trim();
      }
      currentValue = value ? [value] : [];
    } else if (line.trim()) {
      currentValue.push(line);
    }
  }
  flush();

  // Normalize Link: strip markdown brackets / angle brackets.
  if (event.link) {
    const markdownLink = event.link.match(/\((https?:\/\/[^)]+)\)/);
    if (markdownLink) {
      event.link = markdownLink[1];
    } else {
      event.link = event.link.replace(/^<|>$/g, "").trim();
    }
  }

  return event;
}

function extractTrailingField(
  trailing: string,
  label: string
): string | undefined {
  if (!trailing) return undefined;
  const re = new RegExp(
    `\\*\\*${escapeForRegex(label)}\\*\\*\\s*:\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`,
    "i"
  );
  const m = trailing.match(re);
  return m ? m[1].trim() : undefined;
}

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function streamClassifyState(md: string): {
  eventsSoFar: number;
  activeHeading: string | null;
} {
  const headings = Array.from(md.matchAll(/###\s+(\d+)\.\s*(.+?)\s*$/gm));
  return {
    eventsSoFar: headings.length,
    activeHeading: headings.length
      ? headings[headings.length - 1][2]
      : null,
  };
}

export function eventToMarkdown(e: ParsedEvent): string {
  return e.raw;
}
