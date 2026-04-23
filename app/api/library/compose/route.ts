import { NextRequest } from "next/server";
import { MODELS, anthropic } from "@/lib/anthropic";

/*
  Proposal composer.

  POST { accountName?, situationNote, picks: Array<{ kind, title, description, stat }> }
  Streams a proposal section draft that weaves the picked library items
  into a coherent proposal. Use case: sales team member picks 3-5 cases
  + 1-2 prompts/templates from the Library, adds one sentence of context,
  gets a ready-to-edit proposal body.
*/

export const runtime = "nodejs";
export const maxDuration = 90;

type Pick = {
  kind: "prompt" | "template" | "case" | "resource" | "module";
  title: string;
  description: string;
  stat: string;
};

type Body = {
  accountName?: string;
  situationNote: string;
  picks: Pick[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.situationNote || !Array.isArray(body.picks) || body.picks.length === 0) {
    return new Response("situationNote and at least one pick required", { status: 400 });
  }

  const hasKey = !!process.env.ANTHROPIC_API_KEY || !!process.env.CLAUDE_API_KEY;
  if (!hasKey) return mockStream(body);

  const system = `You are drafting a proposal body for an ArcticBlue sales team member. ArcticBlue sells AI Practical Labs — monthly live 90-minute sessions for teams of up to 20 that practice AI on real business problems.

Input:
- A short "situation note" describing the prospect and what they care about
- A selected list of library items (cases, prompts, templates, resources) the sales team member wants to weave into the proposal

Output a proposal body in markdown with four sections:

## Why now
One paragraph. Frame the specific moment this prospect is in and why ArcticBlue fits.

## Relevant proof points
Cite each selected case with the client label, the headline metric, and a one-sentence pull about why it matters here. Omit this section if no cases were picked.

## Proposed first Lab
A specific challenge framing for the first monthly session, grounded in the situation note. 3-5 sentences.

## What this looks like operationally
3-5 bullets: who facilitates, who attends from their team, cadence, artifacts, cost (mention the standard $30K/mo price only if relevant).

Rules:
- Direct, no filler, no hedge language
- Tie every claim back to something in the inputs — don't invent metrics
- Under 550 words total
- The sales team member will edit this; aim for 85% done, not finished`;

  const picksBlock = body.picks
    .map(
      (p) =>
        `- [${p.kind.toUpperCase()}] ${p.title} — ${p.stat}\n  ${p.description}`
    )
    .join("\n");

  const userMessage = `${body.accountName ? `Prospect: ${body.accountName}` : "No specific prospect named"}

Situation note:
${body.situationNote}

Library items selected:
${picksBlock}

Draft the proposal body.`;

  try {
    const client = anthropic();
    const stream = await client.messages.stream({
      model: MODELS.PRACTICE,
      max_tokens: 1800,
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

function mockStream(body: Body) {
  const reply = `## Why now

**[Mock response — no Anthropic API key configured]**

${body.accountName ? body.accountName : "The prospect"} is in a moment where AI access is broad but day-to-day usage is thin. ${body.situationNote.slice(0, 120)}…

## Relevant proof points

${body.picks
  .filter((p) => p.kind === "case")
  .map((p) => `- **${p.title}** (${p.stat}) — ${p.description.slice(0, 120)}…`)
  .join("\n") || "No cases selected."}

## Proposed first Lab

A first session framed around the team's current highest-leverage challenge. 90 minutes, up to 20 people, real work.

## What this looks like operationally

- Monthly facilitation by ArcticBlue
- Up to 20 teammates attend live
- Materials + follow-up each month
- Post-session artifacts shared with the team

---

*Set ANTHROPIC_API_KEY for a real draft.*`;

  const encoder = new TextEncoder();
  const chunks = reply.split(/(\s+)/);
  const readable = new ReadableStream({
    async start(controller) {
      for (const c of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: c })}\n\n`));
        await new Promise((r) => setTimeout(r, 8));
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
