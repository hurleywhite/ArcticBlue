import { NextRequest } from "next/server";
import { BASE_SYSTEM_PROMPT } from "@/lib/event-sourcer/system-prompt";
import {
  composeUserMessage,
  type EventSourcerInputs,
} from "@/lib/event-sourcer/compose";

/*
  Event Sourcer streaming route.

  POST { inputs: EventSourcerInputs } → SSE stream.
  Each event is `data: {"text": "..."}\n\n`.
  Terminates with `data: [DONE]\n\n`.

  Env vars expected on Vercel (confirm names match):
    DUST_API_KEY       — Dust personal or workspace API key
    DUST_WORKSPACE_ID  — the Dust workspace (sId)
    DUST_AGENT_ID      — the assistant/agent to message (sId)

  If any var is missing we fall back to a mock stream so the UI still
  renders end-to-end in preview.
*/

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = { inputs?: EventSourcerInputs };

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const inputs = body?.inputs;
  if (!inputs) {
    return new Response("inputs payload is required", { status: 400 });
  }

  // Minimal required-field check matching what the base prompt can't work
  // without. UI should gate the submit button on these, but defend here too.
  if (
    !inputs.partnerName?.trim() ||
    !inputs.partnerFocus?.trim() ||
    !inputs.audienceTargets?.trim() ||
    !inputs.themeTargets?.trim() ||
    !inputs.windowStart?.trim() ||
    !inputs.windowEnd?.trim()
  ) {
    return new Response(
      "partnerName, partnerFocus, audienceTargets, themeTargets, windowStart, and windowEnd are required",
      { status: 400 }
    );
  }

  const userMessage = composeUserMessage(inputs);

  const apiKey = process.env.DUST_API_KEY;
  const workspaceId = process.env.DUST_WORKSPACE_ID;
  const agentId = process.env.DUST_AGENT_ID;

  if (!apiKey || !workspaceId || !agentId) {
    return mockStream(inputs);
  }

  return dustStream({
    apiKey,
    workspaceId,
    agentId,
    systemPrompt: BASE_SYSTEM_PROMPT,
    userMessage,
  });
}

async function dustStream({
  apiKey,
  workspaceId,
  agentId,
  systemPrompt,
  userMessage,
}: {
  apiKey: string;
  workspaceId: string;
  agentId: string;
  systemPrompt: string;
  userMessage: string;
}): Promise<Response> {
  /*
    Dust v1 conversations API — create a conversation with a single
    mention of the target agent, then stream events back as SSE.

    Reference: https://docs.dust.tt/reference/post_api-v1-w-wid-assistant-conversations
  */

  const createUrl = `https://dust.tt/api/v1/w/${workspaceId}/assistant/conversations`;

  const createResp = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      visibility: "unlisted",
      title: "Event sourcer run",
      message: {
        content: `${systemPrompt}\n\n---\n\n${userMessage}`,
        mentions: [{ configurationId: agentId }],
        context: {
          username: "arcticmind-event-sourcer",
          timezone: "America/New_York",
        },
      },
      blocking: false,
    }),
  });

  if (!createResp.ok) {
    const errText = await createResp.text().catch(() => "");
    return new Response(
      `Dust create-conversation failed: ${createResp.status} ${errText}`,
      { status: 502 }
    );
  }

  const created = await createResp.json();
  const conversationSid: string | undefined =
    created?.conversation?.sId ?? created?.conversationSid;
  const agentMessage = created?.conversation?.content
    ?.flat?.()
    ?.find((m: { type?: string }) => m?.type === "agent_message");
  const agentMessageSid: string | undefined =
    agentMessage?.sId ?? created?.message?.sId;

  if (!conversationSid || !agentMessageSid) {
    return new Response(
      `Dust response missing conversation or agent-message id. Raw: ${JSON.stringify(
        created
      ).slice(0, 400)}`,
      { status: 502 }
    );
  }

  const eventsUrl = `https://dust.tt/api/v1/w/${workspaceId}/assistant/conversations/${conversationSid}/messages/${agentMessageSid}/events`;

  const eventsResp = await fetch(eventsUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "text/event-stream",
    },
  });

  if (!eventsResp.ok || !eventsResp.body) {
    return new Response(
      `Dust event-stream failed: ${eventsResp.status}`,
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = eventsResp.body!.getReader();
      let buffer = "";
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";
          for (const chunk of chunks) {
            const line = chunk
              .split("\n")
              .find((l) => l.startsWith("data:"));
            if (!line) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const evt = JSON.parse(payload);
              // Dust event shape varies; handle common text tokens.
              const text: string | undefined =
                evt?.data?.text ??
                evt?.text ??
                evt?.data?.delta?.text ??
                (evt?.type === "generation_tokens"
                  ? evt?.data?.chunk
                  : undefined);
              if (typeof text === "string" && text.length > 0) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text })}\n\n`
                  )
                );
              }
              if (
                evt?.type === "agent_message_success" ||
                evt?.data?.type === "agent_message_success"
              ) {
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              }
              if (
                evt?.type === "agent_error" ||
                evt?.data?.type === "agent_error"
              ) {
                const errText =
                  evt?.data?.error?.message ??
                  evt?.error?.message ??
                  "Dust agent error";
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      text: `\n\n_[${errText}]_`,
                    })}\n\n`
                  )
                );
              }
            } catch {
              // Non-JSON heartbeat; ignore.
            }
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              text: `\n\n_[Stream error: ${
                err instanceof Error ? err.message : String(err)
              }]_`,
            })}\n\n`
          )
        );
      } finally {
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Arcticmind-Source": "dust",
    },
  });
}

function mockStream(inputs: EventSourcerInputs): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (text: string) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
        );
      const sleep = (ms: number) =>
        new Promise<void>((r) => setTimeout(r, ms));

      const mock = [
        `### 1. Gartner CIO Leadership Forum 2026\n\n`,
        `**Link**: https://www.gartner.com/en/conferences\n`,
        `**Dates**: 2026-06-08 – 2026-06-10\n`,
        `**Location**: National Harbor, MD · Gaylord Resort\n`,
        `**Stream**: PRIMARY\n`,
        `**Audience fit**: Expected 1,500+ CIOs/CTOs from Fortune 1000 — direct match for CIO/CAIO targeting.\n`,
        `**Theme fit**: AI operating model, governance, and measurable ROI headline the agenda.\n`,
        `**Speaking route**: Speaker nomination via Gartner contact form. No open CFP.\n`,
        `**Sponsorship route**: Published sponsor deck, tiered.\n`,
        `**Pay-to-play flag**: Partial — tier-gated breakout slots.\n`,
        `**Why this partner**: ${inputs.partnerName.trim()} — aligned to enterprise AI rollout focus; CIO-dense room.\n`,
        `**Travel burden**: Moderate (US East Coast).\n\n---\n\n`,
        `### 2. CDAO Exchange Americas 2026\n\n`,
        `**Link**: https://cdaoexchange.com/americas\n`,
        `**Dates**: 2026-07-14 – 2026-07-16\n`,
        `**Location**: Austin, TX · Fairmont Austin\n`,
        `**Stream**: PRIMARY\n`,
        `**Audience fit**: CDAO / Chief Data Officer / VP Data & Analytics — 400-seat cap, invite-only.\n`,
        `**Theme fit**: Data foundations, AI governance, enterprise agentic workflows.\n`,
        `**Speaking route**: Open CFP closes 2026-03-15.\n`,
        `**Sponsorship route**: Sponsor prospectus on request.\n`,
        `**Pay-to-play flag**: None (CFP-selected).\n`,
        `**Why this partner**: Theme-dense on governance + measurable ROI.\n`,
        `**Travel burden**: Moderate.\n\n---\n\n`,
        `**Session summary**: 2 primary / 0 halo · 2026-06-08 – 2026-07-16 · 2 US · 0 EU · 0 other\n\n`,
        `**Verification notes**: Mock output — Dust environment variables not yet detected on the server.\n`,
      ];
      for (const chunk of mock) {
        emit(chunk);
        await sleep(60);
      }
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Arcticmind-Source": "mock",
    },
  });
}
