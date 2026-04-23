import { NextRequest } from "next/server";
import { MODELS, anthropic } from "@/lib/anthropic";

/*
  Post-meeting follow-up drafter.

  POST { accountName, pocName, pocEmail, meetingSummary, nextSteps, tone }
  Streams a short follow-up email + proposal outline.

  Distinct from /api/workbench/prep (which drafts a pre-meeting brief).
  This runs after a meeting with context the rep captures on the fly.
*/

export const runtime = "nodejs";
export const maxDuration = 90;

type Body = {
  accountName: string;
  pocName: string;
  pocEmail?: string;
  meetingSummary: string;
  nextSteps?: string;
  tone?: "direct" | "warm" | "executive";
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.accountName || !body.meetingSummary) {
    return new Response("accountName and meetingSummary required", { status: 400 });
  }

  const hasKey = !!process.env.ANTHROPIC_API_KEY || !!process.env.CLAUDE_API_KEY;
  if (!hasKey) return mockStream(body);

  const tone = body.tone ?? "direct";
  const system = `You are drafting a post-meeting follow-up email for an ArcticBlue sales team member. ArcticBlue sells AI Practical Labs — monthly live 90-minute sessions where a team of up to 20 works real business problems with AI. Your output is two parts:

1. A short follow-up email. Subject line first. 4-7 sentences. Direct, no filler, no hedge language. Restate what was decided, name the next step, name a specific date if one was mentioned. ${tone === "warm" ? "Tone: warm and human, but still concise." : tone === "executive" ? "Tone: executive — crisp, with a clear ask." : "Tone: direct and professional."}

2. A proposed proposal outline in 3-5 bullet points — what sections we'd include for this specific account, what cases we'd cite, what pilot scope we'd propose.

Use this exact markdown format:

## Follow-up email

**Subject:** ...

Body text here.

## Proposal outline

- Bullet 1
- Bullet 2
- etc.

Keep the whole output under 450 words.`;

  const userMessage = `Account: ${body.accountName}
Point of contact: ${body.pocName}${body.pocEmail ? ` (${body.pocEmail})` : ""}

What happened in the meeting:
${body.meetingSummary}

${body.nextSteps ? `Agreed next steps:\n${body.nextSteps}` : "No specific next steps captured."}

Draft the follow-up.`;

  try {
    const client = anthropic();
    const stream = await client.messages.stream({
      model: MODELS.PRACTICE,
      max_tokens: 1400,
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
  const reply = `## Follow-up email

**Subject:** Following up — ${body.accountName}

**[Mock response — no Anthropic API key configured]**

Hi ${body.pocName},

Thanks for the time today. Quick recap…

## Proposal outline

- Placeholder section 1
- Placeholder section 2
- Placeholder section 3

---

*Set ANTHROPIC_API_KEY in the environment for a real draft.*`;
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
