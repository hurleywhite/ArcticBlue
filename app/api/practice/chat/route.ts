import { NextRequest } from "next/server";
import { MODELS, anthropic } from "@/lib/anthropic";

/*
  Practice chat stream.

  Accepts: { systemPrompt?: string, messages: {role, content}[] }
  Returns: text/event-stream with "data: <chunk>" lines.

  If ANTHROPIC_API_KEY is missing, falls back to a mock stream so the
  UI is still exercisable in local dev without keys — clearly marked
  as mock in the response header and in the streamed preamble.

  The mock is intentional: it lets every learner see the practice flow
  end-to-end before the platform operator has wired Anthropic credentials.
*/

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return new Response("Bad request", { status: 400 });
  }

  const hasKey = !!process.env.ANTHROPIC_API_KEY;

  if (!hasKey) {
    return mockStream(body);
  }

  try {
    const client = anthropic();
    const stream = await client.messages.stream({
      model: MODELS.PRACTICE,
      max_tokens: 2048,
      system: body.systemPrompt ?? undefined,
      messages: body.messages.map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
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
      `data: ${JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to call Anthropic",
      })}\n\n`,
      {
        headers: { "Content-Type": "text/event-stream" },
        status: 200,
      }
    );
  }
}

function mockStream(body: { messages: Array<{ role: string; content: string }>; systemPrompt?: string }) {
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const preamble =
    "**[Mock response · no Anthropic API key configured]**\n\n" +
    "This is a practice session running in mock mode. To get real model responses here:\n\n" +
    "1. Add `ANTHROPIC_API_KEY=...` to `.env.local`\n" +
    "2. Restart the dev server\n" +
    "3. Start a new session\n\n" +
    "A real response would arrive here as a streamed reply from Claude Sonnet 4.6, grounded in the seed context above (if any). You can still practice the interaction — draft a question, see the streaming UX, persist sessions.\n\n" +
    "---\n\n**Your message:** ";

  const reply =
    preamble +
    `"${lastUser.slice(0, 280)}${lastUser.length > 280 ? "…" : ""}"\n\n` +
    "A real Claude would engage with the substance of your message. The mock ends here.";

  const encoder = new TextEncoder();
  const chunks = reply.split(/(\s+)/);
  const readable = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        await new Promise((r) => setTimeout(r, 12));
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
