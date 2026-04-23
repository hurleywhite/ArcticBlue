import { NextRequest } from "next/server";
import { MODELS, anthropic } from "@/lib/anthropic";
import { DELIVERABLES } from "@/lib/content/deliverables";

/*
  Deliverable workflow endpoint.

  POST { slug, fields } — fields is an object keyed by the intake
  field names declared in lib/content/deliverables.ts. The route
  dispatches to a type-specific system prompt that returns structured
  markdown ready to render as a branded client deliverable.
*/

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const def = DELIVERABLES.find((d) => d.slug === slug);
  if (!def) return new Response("Unknown deliverable", { status: 404 });

  const body = await req.json().catch(() => null);
  const fields = body?.fields as Record<string, string> | undefined;
  if (!fields) return new Response("fields required", { status: 400 });

  const hasKey = !!process.env.ANTHROPIC_API_KEY || !!process.env.CLAUDE_API_KEY;
  if (!hasKey) return mockStream(slug);

  const { system, user } = promptFor(slug, fields);

  try {
    const client = anthropic();
    const stream = await client.messages.stream({
      model: MODELS.PRACTICE,
      max_tokens: 2200,
      system,
      messages: [{ role: "user", content: user }],
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

function promptFor(slug: string, fields: Record<string, string>) {
  switch (slug) {
    case "meeting-recap":
      return {
        system: `You are producing a post-meeting recap for a client-facing distribution.

Output structured markdown with these sections:

## Decisions made
Bullets. Each decision as a complete sentence that makes sense out of context. Include who decided it if the notes say.

## Actions
A markdown table with columns: Action, Owner, Due. Only include actions where an owner and a date can be inferred. If one is missing, include the row but mark the missing field as "TBD — needs confirmation."

## Open questions
Bullets. Things the meeting raised that weren't resolved.

## Next sync
One line at the bottom if a next meeting was agreed. Otherwise omit the section.

Rules:
- Do not invent content. If the notes don't say something, it doesn't appear.
- Complete sentences for decisions (they'll be skimmed out of context).
- No hedge language.
- Under 500 words.`,
        user: `Meeting: ${fields.meeting_name || ""}
Date: ${fields.meeting_date || ""}
Attendees: ${fields.attendees || ""}

Raw notes / transcript:
${fields.raw_notes || ""}

Produce the recap.`,
      };

    case "pilot-scoping":
      return {
        system: `You are producing a pilot scoping doc using the ArcticBlue method. The doc will be signed off by the client.

Output structured markdown with these sections:

## Decision this pilot answers
One paragraph. Restate the decision and name who will make it.

## Evidence that would change the decision-maker's mind
Two bullets — one for "yes, ship it" and one for "no, hold." Each is observable and measurable.

## Smallest experiment
Three bullets:
- **Scope:** what we will and won't touch
- **Method:** how we'll run it (3–5 sentences)
- **Owner:** named person, not "the team"

## What "done" looks like
Bullets. Include the readout, the decision, and any artifact that persists even if the pilot is killed.

## Risks and guardrails
Bullets covering biggest risk, compliance/legal review, rollback.

## Timeline
A 4-week markdown table with columns: Week, Milestone. Week 4 is always readout + decision.

Rules:
- Four weeks is the default pilot length. Do not suggest longer unless the inputs demand it.
- Be specific. Never write "strategize" or "align" — use concrete verbs.
- If the input decision is vague, say so in the first section and refuse to scope until it's named.
- Under 700 words.`,
        user: `Pilot: ${fields.pilot_name || ""}
Sponsor: ${fields.sponsor || ""}
Team: ${fields.team || ""}
Decision: ${fields.decision || ""}
Evidence framing: ${fields.evidence || ""}
Context: ${fields.context || ""}

Produce the scoping doc.`,
      };

    default:
      return {
        system: "You are a helpful drafter. Produce a clean markdown draft based on the user input.",
        user: JSON.stringify(fields),
      };
  }
}

function mockStream(slug: string) {
  const reply = `## ${slug} draft

**[Mock response — no Anthropic API key configured]**

The real deliverable streams here when ANTHROPIC_API_KEY is set. For now, this is a placeholder so the workflow UI stays exercisable without a key.

## Section 2

- Placeholder bullet
- Placeholder bullet

## Section 3

Placeholder body paragraph.`;

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
