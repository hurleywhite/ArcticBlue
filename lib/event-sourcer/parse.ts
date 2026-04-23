/*
  Parse the streamed markdown output from the Event Sourcer into
  structured records. Tolerant: if the model drops a field, we leave
  it undefined rather than throwing. Unknown labels surface in
  `extra` so nothing is silently dropped.
*/

export type ParsedEvent = {
  num: string;
  title: string;
  link?: string;
  dates?: string;
  location?: string;
  stream?: "PRIMARY" | "HALO" | string;
  audienceFit?: string;
  themeFit?: string;
  speakingRoute?: string;
  sponsorshipRoute?: string;
  payToPlay?: string;
  whyPartner?: string;
  travelBurden?: string;
  extra: Record<string, string>;
  raw: string;
};

export type ParsedOutput = {
  events: ParsedEvent[];
  sessionSummary?: string;
  verificationNotes?: string;
  trailing: string;
};

const LABEL_MAP: Record<string, keyof ParsedEvent> = {
  link: "link",
  dates: "dates",
  location: "location",
  stream: "stream",
  "audience fit": "audienceFit",
  "theme fit": "themeFit",
  "speaking route": "speakingRoute",
  "sponsorship route": "sponsorshipRoute",
  "pay-to-play flag": "payToPlay",
  "pay to play flag": "payToPlay",
  "why this partner": "whyPartner",
  "travel burden": "travelBurden",
};

const HEADING_RE = /^###\s+(\d+)\.\s*(.+?)\s*$/m;

export function parseEventOutput(md: string): ParsedOutput {
  if (!md.trim()) {
    return { events: [], trailing: "" };
  }

  // Split on a horizontal rule — each event block ends with ---.
  // The trailing section (Session summary / Verification notes) does
  // NOT live inside an event card and may or may not have its own rule.
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
  const sessionSummary = extractTrailingField(trailing, "Session summary");
  const verificationNotes = extractTrailingField(
    trailing,
    "Verification notes"
  );

  return { events, sessionSummary, verificationNotes, trailing };
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

  // Split into lines, then find `**Label**: value` or `**Label:** value`
  // patterns. Multi-line values (rare) are joined in until the next
  // bold-label line.
  const lines = block.split("\n").slice(1); // drop the heading
  let currentKey: keyof ParsedEvent | null = null;
  let currentExtraKey: string | null = null;
  let currentValue: string[] = [];

  const flush = () => {
    const v = currentValue.join(" ").trim();
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
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(/^\*\*([^:*]+?)\*\*\s*:\s*(.*)$/);
    if (m) {
      flush();
      const label = m[1].trim().toLowerCase();
      const value = m[2].trim();
      const mapped = LABEL_MAP[label];
      if (mapped) {
        currentKey = mapped;
      } else {
        currentExtraKey = m[1].trim();
      }
      currentValue = value ? [value] : [];
    } else {
      currentValue.push(line);
    }
  }
  flush();

  // Clean link field — strip markdown brackets if the model wrote
  // [label](url) or surrounded with < >.
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
    `\\*\\*${label}\\*\\*\\s*:\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`,
    "i"
  );
  const m = trailing.match(re);
  return m ? m[1].trim() : undefined;
}

export function eventToMarkdown(e: ParsedEvent): string {
  return e.raw;
}

export function streamClassifyState(md: string): {
  eventsSoFar: number;
  activeHeading: string | null;
} {
  // Count how many `### N. ...` headings have appeared so far, and
  // what the last one was. Useful for live progress indicators during
  // streaming.
  const headings = Array.from(md.matchAll(/###\s+(\d+)\.\s*(.+?)\s*$/gm));
  return {
    eventsSoFar: headings.length,
    activeHeading: headings.length
      ? headings[headings.length - 1][2]
      : null,
  };
}
