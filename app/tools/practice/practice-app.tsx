"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { marked } from "marked";
import {
  newSessionId,
  usePracticeState,
  type PracticeSession,
} from "@/lib/state/practice";
import { MODULES } from "@/lib/content/modules";
import { useStarState, sessionKey } from "@/lib/state/stars";
import { DEMO_DATA } from "@/lib/canvas/demo-data";

/*
  Practice chat application.

  Top-level layout: sidebar (past sessions + seed picker) on the left,
  active session on the right. Messages stream from /api/practice/chat.

  Seed entry points (read from ?seed= query and sessionStorage):
  - ?seed=prompt   → pulls { promptId, promptTitle, filledBody } from sessionStorage
  - ?seed=template → pulls { templateId, templateTitle, filledBody } from sessionStorage
  - ?seed=module&id=… → exercise prompt from the module record
  - ?seed=canvas&id=… → opportunity from DEMO_DATA
  - no seed → blank session

  State is localStorage-backed (lib/state/practice). When Supabase is
  wired, swap this for server-action reads/writes without touching UI.
*/

export function PracticeApp() {
  const params = useSearchParams();
  const [state, setState] = usePracticeState();
  const [starState] = useStarState();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const [modelInfo, setModelInfo] = useState<{ source: string; model: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = state.sessions.find((s) => s.id === activeId) ?? null;

  // Seed a new session on mount when ?seed= is present
  useEffect(() => {
    const seed = params.get("seed");
    if (!seed) {
      // Default: open the most recent session if one exists
      if (!activeId && state.sessions.length > 0) {
        setActiveId(state.sessions[0].id);
      }
      return;
    }
    const session = buildSessionFromSeed(seed, params);
    if (!session) return;
    setState((prev) => ({ sessions: [session, ...prev.sessions] }));
    setActiveId(session.id);
    // Clear the query so it doesn't re-seed on every reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("seed");
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages.length, pending]);

  const starredOpportunities = useMemo(() => {
    if (!starState.lastRole || !starState.lastIndustry) return [];
    const ids = starState.stars[sessionKey(starState.lastRole, starState.lastIndustry)] ?? [];
    const all = Object.values(DEMO_DATA).flat();
    return all.filter((o) => ids.includes(o.id));
  }, [starState]);

  const startBlank = () => {
    const s: PracticeSession = {
      id: newSessionId(),
      title: "Blank session",
      seed_type: "blank",
      messages: [],
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };
    setState((prev) => ({ sessions: [s, ...prev.sessions] }));
    setActiveId(s.id);
  };

  const startFromOpportunity = (opId: string) => {
    const all = Object.values(DEMO_DATA).flat();
    const op = all.find((o) => o.id === opId);
    if (!op) return;
    const s: PracticeSession = {
      id: newSessionId(),
      title: `Canvas: ${op.title.slice(0, 60)}`,
      seed_type: "canvas_opportunity",
      seed_entity_id: op.id,
      seed_label: op.title,
      system_prompt: buildCanvasSystemPrompt(op.title, op.detail, op.experiment, op.risk),
      messages: [],
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };
    setState((prev) => ({ sessions: [s, ...prev.sessions] }));
    setActiveId(s.id);
  };

  const send = async () => {
    if (!active || !draft.trim() || pending) return;
    const userMessage = {
      role: "user" as const,
      content: draft.trim(),
      created_at: new Date().toISOString(),
    };
    const nextTitle =
      active.title === "Blank session" && active.messages.length === 0
        ? autoTitle(userMessage.content)
        : active.title;

    setState((prev) => ({
      sessions: prev.sessions.map((s) =>
        s.id === active.id
          ? {
              ...s,
              title: nextTitle,
              messages: [...s.messages, userMessage],
              last_message_at: userMessage.created_at,
            }
          : s
      ),
    }));
    setDraft("");
    setPending(true);

    // Kick off stream with a placeholder assistant message we grow
    const asstStartTime = new Date().toISOString();
    setState((prev) => ({
      sessions: prev.sessions.map((s) =>
        s.id === active.id
          ? {
              ...s,
              messages: [
                ...s.messages,
                { role: "assistant", content: "", created_at: asstStartTime },
              ],
            }
          : s
      ),
    }));

    try {
      const res = await fetch("/api/practice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: active.system_prompt,
          messages: [...active.messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`Chat request failed: ${res.status}`);
      }
      setModelInfo({
        source: res.headers.get("X-Arcticmind-Source") ?? "unknown",
        model: res.headers.get("X-Arcticmind-Model") ?? "unknown",
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.text) {
              acc += evt.text;
              setState((prev) => ({
                sessions: prev.sessions.map((s) =>
                  s.id === active.id
                    ? {
                        ...s,
                        messages: s.messages.map((m, idx, arr) =>
                          idx === arr.length - 1 && m.role === "assistant"
                            ? { ...m, content: acc }
                            : m
                        ),
                      }
                    : s
                ),
              }));
            }
            if (evt.error) {
              acc += `\n\n_[Error from model: ${evt.error}]_`;
            }
          } catch {
            // non-JSON chunk, ignore
          }
        }
      }
    } catch (err) {
      setState((prev) => ({
        sessions: prev.sessions.map((s) =>
          s.id === active.id
            ? {
                ...s,
                messages: s.messages.map((m, idx, arr) =>
                  idx === arr.length - 1 && m.role === "assistant"
                    ? {
                        ...m,
                        content: `_[Network error: ${err instanceof Error ? err.message : String(err)}]_`,
                      }
                    : m
                ),
              }
            : s
        ),
      }));
    } finally {
      setPending(false);
    }
  };

  const exportSession = () => {
    if (!active) return;
    const md = [
      `# ${active.title}`,
      ``,
      `**Created:** ${new Date(active.created_at).toLocaleString()}`,
      active.seed_label ? `**Seed:** ${active.seed_label}` : "",
      "",
      "---",
      "",
      ...active.messages.map(
        (m) => `## ${m.role === "user" ? "You" : "Claude"}\n\n${m.content}`
      ),
    ].join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteSession = (id: string) => {
    setState((prev) => ({ sessions: prev.sessions.filter((s) => s.id !== id) }));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-[260px_1fr]" style={{ minHeight: 560 }}>
      {/* Sidebar */}
      <div className="border-b border-ink-border bg-bg-card md:border-b-0 md:border-r">
        <div className="border-b border-ink-border px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            New session
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            <button onClick={startBlank} className="btn-secondary bg-white">
              Blank session
            </button>
            {starredOpportunities.length > 0 && (
              <details className="border border-ink-border bg-white px-3 py-2">
                <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
                  From Canvas ({starredOpportunities.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {starredOpportunities.map((op) => (
                    <li key={op.id}>
                      <button
                        onClick={() => startFromOpportunity(op.id)}
                        className="w-full text-left text-[12px] text-navy hover:underline"
                      >
                        {op.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
        <div className="max-h-[520px] overflow-y-auto">
          <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
            Past sessions
          </div>
          {state.sessions.length === 0 && (
            <div className="px-4 pb-4 text-[11px] italic text-ink-muted">
              No past sessions yet.
            </div>
          )}
          <ul className="m-0 list-none p-0">
            {state.sessions.map((s) => (
              <li
                key={s.id}
                className={`group flex items-start gap-2 border-t border-ink-border px-4 py-2 ${
                  s.id === activeId ? "bg-ice" : "hover:bg-white"
                }`}
              >
                <button
                  onClick={() => setActiveId(s.id)}
                  className="flex-1 text-left"
                >
                  <div className="text-[12px] font-bold text-navy">{s.title}</div>
                  <div className="mt-0.5 text-[10px] text-ink-muted">
                    {s.messages.length} messages · {new Date(s.last_message_at).toLocaleDateString()}
                  </div>
                </button>
                <button
                  onClick={() => deleteSession(s.id)}
                  className="opacity-0 transition hover:text-navy group-hover:opacity-70"
                  aria-label="Delete session"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex min-h-[560px] flex-col bg-white">
        {active ? (
          <>
            <div className="flex items-center justify-between border-b border-ink-border px-5 py-3">
              <div>
                <div className="text-[14px] font-bold text-navy">{active.title}</div>
                {active.seed_label && (
                  <div className="mt-0.5 text-[11px] text-ink-muted">
                    Practicing: {active.seed_label}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {modelInfo && (
                  <span
                    className={
                      modelInfo.source === "mock"
                        ? "border border-ink-border bg-bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted"
                        : "border border-navy bg-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy"
                    }
                    title={modelInfo.source === "mock" ? "Mock mode — no API key" : `Model: ${modelInfo.model}`}
                  >
                    {modelInfo.source === "mock" ? "MOCK" : modelInfo.model.replace("claude-", "")}
                  </span>
                )}
                <button
                  onClick={exportSession}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
                >
                  Export
                </button>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
              {active.messages.length === 0 && (
                <div className="mx-auto max-w-lg">
                  {active.system_prompt ? (
                    <div className="callout">
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                        Seed context
                      </div>
                      <p className="mt-1 text-[12px] leading-[1.55]">
                        This session is seeded with a system prompt about "
                        {active.seed_label}". Ask a specific question or paste
                        a draft to work on it.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-[13px] text-ink-muted">
                      Type a message below to start the session.
                    </div>
                  )}
                </div>
              )}
              {active.messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} />
              ))}
              {pending &&
                active.messages[active.messages.length - 1]?.role === "assistant" &&
                active.messages[active.messages.length - 1]?.content === "" && (
                  <div className="mt-2 text-[11px] italic text-ink-muted">Claude is thinking…</div>
                )}
            </div>
            <div className="border-t border-ink-border bg-bg-card px-5 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-end gap-3"
              >
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  disabled={pending}
                />
                <button
                  type="submit"
                  className="btn-primary shrink-0"
                  disabled={pending || !draft.trim()}
                >
                  {pending ? "Sending…" : "Send"}
                </button>
              </form>
              <div className="mt-1 text-[10px] text-ink-muted">
                ⌘/Ctrl + Enter to send · Text only in Phase 1
              </div>
            </div>
          </>
        ) : (
          <EmptyPractice onBlank={startBlank} />
        )}
      </div>
    </div>
  );
}

function EmptyPractice({ onBlank }: { onBlank: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
      <div className="max-w-lg">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
          Practice
        </div>
        <h2 className="mt-2 text-[20px] font-bold leading-[1.15] text-navy">
          Start a seeded session.
        </h2>
        <p className="mt-2 text-[13px] leading-[1.55]">
          Pick a starting point from the sidebar — a Canvas opportunity, a module
          exercise, a prompt from the library — or start blank.
        </p>
        <div className="mt-5">
          <button onClick={onBlank} className="btn-primary">
            Start blank session
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const html = useMemo(() => {
    if (role === "user") return null;
    return marked.parse(content || "", { async: false }) as string;
  }, [content, role]);

  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        {role === "user" ? "You" : "Claude"}
      </div>
      {role === "user" ? (
        <div className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.55]">{content}</div>
      ) : (
        <div
          className="prose-editorial mt-1 text-[13px]"
          dangerouslySetInnerHTML={{ __html: html ?? "" }}
        />
      )}
    </div>
  );
}

function autoTitle(s: string) {
  const trimmed = s.trim().replace(/\s+/g, " ");
  return trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed;
}

function buildCanvasSystemPrompt(
  title: string,
  detail: string,
  experiment: string,
  risk: string
) {
  return [
    "You are an ArcticBlue facilitator helping a learner practice scoping and executing an AI opportunity they starred on their Opportunity Canvas.",
    "",
    `Starred opportunity: "${title}"`,
    "",
    `Context: ${detail}`,
    "",
    `Smallest experiment: ${experiment}`,
    "",
    `Primary risk: ${risk}`,
    "",
    "Your job is to help the learner take one concrete step on this opportunity. Ask sharp, specific questions. Push back on vague answers. Use the ArcticBlue method: make them name a decision, the evidence that would change their mind, and the smallest experiment that could produce that evidence in four weeks.",
    "",
    "Keep responses tight and decision-oriented. Do not pad. No hedging language.",
  ].join("\n");
}

function buildSessionFromSeed(
  seed: string,
  params: URLSearchParams
): PracticeSession | null {
  const now = new Date().toISOString();
  if (seed === "prompt") {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("arcticmind:seed:prompt");
    sessionStorage.removeItem("arcticmind:seed:prompt");
    if (!raw) return null;
    try {
      const { promptTitle, filledBody } = JSON.parse(raw);
      return {
        id: newSessionId(),
        title: `Prompt: ${promptTitle}`,
        seed_type: "prompt",
        seed_label: promptTitle,
        messages: [{ role: "user", content: filledBody, created_at: now }],
        created_at: now,
        last_message_at: now,
      };
    } catch {
      return null;
    }
  }
  if (seed === "template") {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("arcticmind:seed:template");
    sessionStorage.removeItem("arcticmind:seed:template");
    if (!raw) return null;
    try {
      const { templateTitle, filledBody } = JSON.parse(raw);
      return {
        id: newSessionId(),
        title: `Template: ${templateTitle}`,
        seed_type: "prompt",
        seed_label: templateTitle,
        system_prompt: `You are helping the learner fill out this template. They will iterate on sections with you. Stay focused on filling the template; don't wander.`,
        messages: [
          {
            role: "user",
            content: `I'm working with this template and would like your help filling it in with real content. Here's the current state:\n\n${filledBody}`,
            created_at: now,
          },
        ],
        created_at: now,
        last_message_at: now,
      };
    } catch {
      return null;
    }
  }
  if (seed === "module") {
    const id = params.get("id");
    if (!id) return null;
    const m = MODULES.find((mm) => mm.id === id);
    if (!m || !m.exercise_prompt) return null;
    return {
      id: newSessionId(),
      title: `Exercise: ${m.title}`,
      seed_type: "module_exercise",
      seed_entity_id: m.id,
      seed_label: m.title,
      system_prompt: m.exercise_prompt,
      messages: [],
      created_at: now,
      last_message_at: now,
    };
  }
  if (seed === "canvas") {
    const id = params.get("id");
    if (!id) return null;
    const all = Object.values(DEMO_DATA).flat();
    const op = all.find((o) => o.id === id);
    if (!op) return null;
    return {
      id: newSessionId(),
      title: `Canvas: ${op.title.slice(0, 60)}`,
      seed_type: "canvas_opportunity",
      seed_entity_id: op.id,
      seed_label: op.title,
      system_prompt: buildCanvasSystemPrompt(op.title, op.detail, op.experiment, op.risk),
      messages: [],
      created_at: now,
      last_message_at: now,
    };
  }
  return null;
}
