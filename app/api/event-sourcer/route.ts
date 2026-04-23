import { NextRequest } from "next/server";
import { getSystemPrompt, type PromptKey } from "@/lib/event-sourcer/system-prompts";
import {
  composeUserMessage,
  type EventSourcerInputs,
} from "@/lib/event-sourcer/compose";
import { findPreset } from "@/lib/event-sourcer/partner-presets";

/*
  Event Sourcer streaming route.

  POST { inputs: EventSourcerInputs } → SSE stream.
  Each event is `data: {"text": "..."}\n\n`.
  Terminates with `data: [DONE]\n\n`.

  Env vars on Vercel:
    DUST_API_KEY       — required. Dust personal or workspace API key.
    DUST_WORKSPACE_ID  — required. The Dust workspace sId (visible in
                          the URL: dust.tt/w/<sId>/...).
    DUST_AGENT_ID      — optional. Defaults to "dust" (the built-in
                          general assistant). Override with the sId of
                          a custom assistant you've created in Dust
                          with the event-sourcer system prompt baked
                          in — lets you skip prepending the prompt.

  If the API key or workspace id is missing we fall back to a mock
  stream so the UI still renders end-to-end in preview.
*/

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = { inputs?: EventSourcerInputs };

export async function POST(req: NextRequest) {
  try {
    return await handle(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return errorStream(`Unhandled server error: ${msg}`);
  }
}

async function handle(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const inputs = body?.inputs;
  if (!inputs) {
    return new Response("inputs payload is required", { status: 400 });
  }

  // Resolve prompt key from either explicit promptKey or presetId lookup.
  const preset = inputs.presetId ? findPreset(inputs.presetId) : null;
  const promptKey: PromptKey =
    inputs.promptKey ?? preset?.promptKey ?? "generic";
  const isHardcoded = promptKey !== "generic";

  // Validation branches: hardcoded partners only need TIME WINDOW.
  // Generic / Thor / Blank still need the full partner fields.
  if (!inputs.windowStart?.trim() || !inputs.windowEnd?.trim()) {
    return new Response("windowStart and windowEnd are required", {
      status: 400,
    });
  }
  if (!isHardcoded) {
    if (
      !inputs.partnerName?.trim() ||
      !inputs.partnerFocus?.trim() ||
      !inputs.audienceTargets?.trim() ||
      !inputs.themeTargets?.trim()
    ) {
      return new Response(
        "partnerName, partnerFocus, audienceTargets, and themeTargets are required for generic runs",
        { status: 400 }
      );
    }
  }

  const userMessage = composeUserMessage({ ...inputs, promptKey });
  const systemPrompt = getSystemPrompt(promptKey);

  const apiKey = process.env.DUST_API_KEY;
  const workspaceId = process.env.DUST_WORKSPACE_ID;
  const agentId = process.env.DUST_AGENT_ID || "dust";

  if (!apiKey || !workspaceId) {
    return mockStream(inputs);
  }

  try {
    return await dustStream({
      apiKey,
      workspaceId,
      agentId,
      systemPrompt,
      userMessage,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return errorStream(
      `Dust request failed before streaming started: ${msg}. Check DUST_AGENT_ID exists in workspace ${workspaceId}. If you haven't created a custom assistant in Dust, create one with the event-sourcer system prompt and set DUST_AGENT_ID to its sId.`
    );
  }
}

function errorStream(message: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            text: `_[Server error: ${message}]_`,
          })}\n\n`
        )
      );
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Arcticmind-Source": "error",
    },
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
          email: "arcticmind@arcticblue.ai",
          fullName: "ArcticMind Event Sourcer",
        },
      },
      blocking: false,
    }),
  });

  if (!createResp.ok) {
    const errText = await createResp.text().catch(() => "");
    return errorStream(
      `Dust create-conversation failed (${createResp.status}): ${errText.slice(
        0,
        400
      )}. Workspace: ${workspaceId}, agent: ${agentId}.`
    );
  }

  const created = await createResp.json().catch(() => null);
  if (!created) {
    return errorStream(
      `Dust create-conversation returned a non-JSON body. Workspace: ${workspaceId}, agent: ${agentId}.`
    );
  }
  const conversationSid: string | undefined =
    created?.conversation?.sId ?? created?.conversationSid;
  const agentMessage = created?.conversation?.content
    ?.flat?.()
    ?.find((m: { type?: string }) => m?.type === "agent_message");
  const agentMessageSid: string | undefined =
    agentMessage?.sId ?? created?.message?.sId;

  if (!conversationSid || !agentMessageSid) {
    return errorStream(
      `Dust response missing conversation or agent-message id. The "${agentId}" assistant may not exist in workspace ${workspaceId}. Create a custom assistant in Dust and set DUST_AGENT_ID to its sId. Raw: ${JSON.stringify(
        created
      ).slice(0, 500)}`
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
    const errBody = await eventsResp.text().catch(() => "");
    return errorStream(
      `Dust event-stream failed (${eventsResp.status}): ${errBody.slice(
        0,
        400
      )}`
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
        `**Dates**: June 8–10, 2026\n`,
        `**Location**: National Harbor, MD\n`,
        `**Type**: Enterprise\n`,
        `**Why it fits**: ${inputs.partnerName.trim()} — CIO-dense Fortune 1000 audience aligned to enterprise AI rollout focus.\n`,
        `**About**: Gartner's flagship annual gathering for enterprise CIOs on strategy, operating model, and technology investment priorities.\n`,
        `**Focus areas**:\n- AI operating model and governance\n- Measurable ROI from enterprise AI\n- Data + platform foundations\n- Operating-model change\n`,
        `**Typical attendees**: CIO, CTO, VP IT, Chief Data Officer — Fortune 1000 skew.\n`,
        `**Speaking route**:\n- CFP/speaker page: None found on official site\n- Contact: gartner-speakers@gartner.com (via contact form)\n- Deadline: Unknown\n`,
        `**Pay-to-play for speaking**: Unknown\n`,
        `**Travel burden from PARTNER HOME BASE**: Regional\n`,
        `**Priority**: High\n\n---\n\n`,
        `### 2. CDAO Exchange Americas 2026\n\n`,
        `**Link**: https://cdaoexchange.com/americas\n`,
        `**Dates**: July 14–16, 2026\n`,
        `**Location**: Austin, TX\n`,
        `**Type**: Enterprise\n`,
        `**Why it fits**: CDAO / CDO invite-only room — theme-dense on governance and measurable ROI.\n`,
        `**About**: Invite-only 400-seat exchange for Chief Data and Analytics Officers, structured around 1:1 conversations and a CFP-selected speaker track.\n`,
        `**Focus areas**:\n- Data foundations for AI\n- AI governance and risk\n- Enterprise agentic workflows\n- Data-team operating models\n`,
        `**Typical attendees**: CDAO, Chief Data Officer, VP Data & Analytics — 400-seat invite-only cap.\n`,
        `**Speaking route**:\n- CFP/speaker page: https://cdaoexchange.com/speakers\n- Contact: speakers@cdaoexchange.com\n- Deadline: 2026-03-15\n`,
        `**Pay-to-play for speaking**: No\n`,
        `**Travel burden from PARTNER HOME BASE**: Regional\n`,
        `**Priority**: High\n\n---\n\n`,
        `**Calendar Context**: Calendar integration not yet wired — no confirmed travel captured for this run.\n\n`,
        `**Seed Event Status**: No seed events supplied.\n\n`,
        `**Session summary**: 2 Enterprise / 0 Halo / 0 Seed · June 8 – July 16, 2026 · 2 US · 0 EU · 0 other\n\n`,
        `**Verification notes**: Mock output — Dust environment variables not yet detected on the server. Set DUST_API_KEY and DUST_WORKSPACE_ID on Vercel to enable live runs.\n`,
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
