import { NextRequest } from "next/server";
import { MODELS, anthropic } from "@/lib/anthropic";
import { USE_CASES } from "@/lib/content/use-cases";

/*
  Workbench meeting-prep streamer.

  POST { account } where account matches the client's resolved account
  shape (including localStorage overlays). The server doesn't store
  accounts — the source of truth is the client. Passing the payload
  means custom accounts and edited notes work end-to-end.

  Streams a structured markdown brief:
  - Who they are (industry + size + our read)
  - What they care about (derived from notes)
  - Five discovery questions scoped to their stage
  - Three cases to cite with a one-line "why for them"
  - Follow-up email scaffold
  - Watch-outs

  Mock fallback when ANTHROPIC_API_KEY is missing.
*/

export const runtime = "nodejs";
export const maxDuration = 90;

type IncomingAccount = {
  company_name: string;
  domain: string;
  industry: string;
  size: string;
  stage: string;
  poc_name: string;
  poc_title: string;
  notes: string;
  target_opportunity_category?: string;
  relevant_case_slugs?: string[];
  next_meeting?: {
    title: string;
    duration_minutes: number;
    location: string;
    attendees: string[];
  } | null;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const account = body?.account as IncomingAccount | undefined;
  if (!account || !account.company_name) {
    return new Response("account payload is required", { status: 400 });
  }

  const hasKey = !!process.env.ANTHROPIC_API_KEY || !!process.env.CLAUDE_API_KEY;
  if (!hasKey) return mockStream(account.company_name);

  const caseSummaries = (account.relevant_case_slugs ?? [])
    .map((s) => USE_CASES.find((u) => u.slug === s))
    .filter(Boolean)
    .map(
      (u) =>
        `- ${u!.title} (${u!.anonymized_client_label} · ${u!.headline_metric}): ${u!.summary.slice(0, 220)}`
    )
    .join("\n");

  const system = `You are drafting a pre-meeting prep brief for an ArcticBlue sales team member at a meeting with an enterprise prospect. ArcticBlue sells AI Practical Labs — monthly 90-minute live sessions for a team of up to 20 where the team practices using AI on current real business problems.

The output is structured markdown for the sales team member to read before they join the call. Direct, specific, no filler. Use H2 for sections, short bullets, named people where possible.

Structure:

## Who they are
One paragraph: what we know about the company and why they're in our pipeline.

## What they care about (based on our notes)
Three bullets. Ground each in a specific thing the notes say.

## Five discovery questions
Five numbered questions. Ordered. Stage-appropriate. No leading questions.

## Cases to cite
For each of up to three relevant ArcticBlue cases, one line on why it matters for this specific company.

## Follow-up email (draft)
A 4-6 sentence email the rep can customize after the call. Subject line first. No hedge language.

## Watch-outs
Two or three red flags specific to this meeting — budget, political, technical.

Keep it under 650 words total. Do not invent facts not in the inputs.`;

  const userMessage = `Account: ${account.company_name}
Domain: ${account.domain || "(not specified)"}
Industry: ${account.industry || "(not specified)"}
Size: ${account.size || "(not specified)"}
Stage: ${account.stage || "unknown"}

Point of contact: ${account.poc_name || "(not named)"}${account.poc_title ? ` (${account.poc_title})` : ""}

${account.next_meeting ? `Next meeting: "${account.next_meeting.title}" in ${account.next_meeting.duration_minutes} min
Attendees: ${account.next_meeting.attendees.join(", ")}
Location: ${account.next_meeting.location}` : "No meeting scheduled."}

Our notes:
${account.notes || "(no notes yet)"}

${account.target_opportunity_category ? `Target opportunity category: ${account.target_opportunity_category}` : ""}

${caseSummaries ? `Potentially relevant cases:\n${caseSummaries}` : ""}

Produce the prep brief.`;

  try {
    const client = anthropic();
    const stream = await client.messages.stream({
      model: MODELS.PRACTICE,
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: userMessage }],
    });
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "stream error" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Arcticmind-Source": "anthropic",
        "X-Arcticmind-Model": MODELS.PRACTICE,
      },
    });
  } catch (err) {
    return new Response(
      `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Failed to call Anthropic" })}\n\n`,
      { headers: { "Content-Type": "text/event-stream" } }
    );
  }
}

function mockStream(company: string) {
  const reply = `## Who they are

**[Mock response — no Anthropic API key configured]**

${company} is a pipeline account. When ANTHROPIC_API_KEY is set, this section streams a grounded read of the company based on our internal notes.

## What they care about

- Placeholder bullet 1
- Placeholder bullet 2
- Placeholder bullet 3

## Five discovery questions

1. Question one
2. Question two
3. Question three
4. Question four
5. Question five

## Cases to cite

- Case A — why it matters for them
- Case B — why it matters for them

## Follow-up email (draft)

**Subject:** Following up on our call

Hi {name},

Thanks for the time today…

## Watch-outs

- Red flag 1
- Red flag 2

---

*To run live prep: set ANTHROPIC_API_KEY and restart.*`;

  const encoder = new TextEncoder();
  const chunks = reply.split(/(\s+)/);
  const readable = new ReadableStream({
    async start(controller) {
      for (const c of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: c })}\n\n`));
        await new Promise((r) => setTimeout(r, 10));
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      controller.close();
    },
  });
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Arcticmind-Source": "mock",
      "X-Arcticmind-Model": "mock",
    },
  });
}
