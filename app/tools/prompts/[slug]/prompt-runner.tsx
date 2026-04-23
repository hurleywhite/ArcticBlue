"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { marked } from "marked";
import type { Prompt } from "@/lib/content/types";

/*
  Prompt runner: variable inputs → live preview of the filled prompt →
  Copy, Run inline, and "Try in Practice" actions. The filled prompt is
  passed to /tools/practice via sessionStorage where a new session is
  seeded. "Run" streams a response from Claude directly on the page
  without leaving it — same API route as Practice.
*/

export function PromptRunner({ prompt }: { prompt: Prompt }) {
  const router = useRouter();
  const [vars, setVars] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    prompt.variables.forEach((v) => (init[v.name] = ""));
    return init;
  });
  const [copied, setCopied] = useState(false);
  const [runOutput, setRunOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [runModel, setRunModel] = useState<string | null>(null);

  const filled = useMemo(() => fillPrompt(prompt.prompt_body, vars), [prompt, vars]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(filled);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // noop
    }
  };

  const runInline = async () => {
    if (running) return;
    setRunning(true);
    setRunOutput("");
    try {
      const res = await fetch("/api/practice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: filled }] }),
      });
      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);
      setRunModel(res.headers.get("X-Arcticmind-Model"));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
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
            if (evt.text) setRunOutput((prev) => prev + evt.text);
          } catch {}
        }
      }
    } catch (err) {
      setRunOutput(
        `_[Error: ${err instanceof Error ? err.message : String(err)}]_`
      );
    } finally {
      setRunning(false);
    }
  };

  const tryInPractice = () => {
    // Stash the filled prompt in sessionStorage so we don't put the full
    // body in the URL. The Practice page reads it on mount.
    sessionStorage.setItem(
      "arcticmind:seed:prompt",
      JSON.stringify({
        promptId: prompt.id,
        promptTitle: prompt.title,
        filledBody: filled,
      })
    );
    router.push("/tools/practice?seed=prompt");
  };

  return (
    <div>
      <section>
        <div className="flex items-center gap-3">
          <span className="kicker">Fill the variables</span>
          <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
        </div>
        <div
          className="mt-4 overflow-hidden"
          style={{
            background: "var(--ink-raised)",
            border: "1px solid var(--fg-16)",
            borderRadius: 2,
          }}
        >
          {prompt.variables.map((v, idx) => (
            <div
              key={v.name}
              className="grid grid-cols-1 gap-0 md:grid-cols-[240px_1fr]"
              style={{
                borderBottom:
                  idx === prompt.variables.length - 1
                    ? "none"
                    : "1px solid var(--fg-16)",
              }}
            >
              <div
                className="px-5 py-4"
                style={{
                  background: "var(--ink-deep)",
                  borderRight: "1px solid var(--fg-16)",
                }}
              >
                <div
                  className="serif text-[15px] leading-[1.2]"
                  style={{ color: "var(--fg-100)" }}
                >
                  {v.label}
                </div>
                <div
                  className="mt-1.5 font-mono text-[11px]"
                  style={{ color: "var(--frost)" }}
                >
                  {`{{${v.name}}}`}
                </div>
              </div>
              <div className="px-5 py-4">
                {v.type === "textarea" ? (
                  <textarea
                    className="textarea"
                    rows={4}
                    placeholder={v.placeholder ?? ""}
                    value={vars[v.name]}
                    onChange={(e) =>
                      setVars((prev) => ({ ...prev, [v.name]: e.target.value }))
                    }
                  />
                ) : v.type === "select" ? (
                  <select
                    className="select"
                    value={vars[v.name]}
                    onChange={(e) =>
                      setVars((prev) => ({ ...prev, [v.name]: e.target.value }))
                    }
                  >
                    <option value="">—</option>
                    {v.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="input"
                    placeholder={v.placeholder ?? ""}
                    value={vars[v.name]}
                    onChange={(e) =>
                      setVars((prev) => ({ ...prev, [v.name]: e.target.value }))
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="kicker">Filled prompt</span>
          <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
        </div>
        <pre
          className="mt-4 whitespace-pre-wrap px-5 py-4 text-[12.5px] leading-[1.65]"
          style={{
            background: "var(--ink-raised)",
            border: "1px solid var(--fg-16)",
            color: "var(--fg-72)",
            fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace",
            borderRadius: 2,
          }}
        >
          {filled}
        </pre>
      </section>

      <div
        className="mt-6 flex flex-wrap items-center gap-2 border-t pt-5"
        style={{ borderTopColor: "var(--fg-16)" }}
      >
        <button onClick={copy} className="btn-secondary">
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
        <button onClick={runInline} className="btn-secondary" disabled={running}>
          {running ? "Running…" : "Run with Claude"}
        </button>
        <button onClick={tryInPractice} className="btn-primary ml-auto">
          Try in Practice →
        </button>
      </div>

      {(runOutput || running) && (
        <section className="mt-10">
          <div className="flex items-center gap-3">
            <span className="kicker">Output</span>
            <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
            {runModel && (
              <span
                className="font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
                style={{
                  padding: "3px 8px",
                  background:
                    runModel === "mock" ? "transparent" : "var(--ink-deep)",
                  border:
                    runModel === "mock"
                      ? "1px solid var(--fg-16)"
                      : "1px solid var(--frost)",
                  color:
                    runModel === "mock" ? "var(--fg-52)" : "var(--frost)",
                  borderRadius: 2,
                }}
              >
                {runModel === "mock" ? "MOCK" : runModel.replace("claude-", "")}
              </span>
            )}
          </div>
          <div
            className="prose-editorial mt-4 px-6 py-5"
            style={{
              background: "var(--ink-raised)",
              border: "1px solid var(--fg-16)",
              borderRadius: 2,
            }}
            dangerouslySetInnerHTML={{
              __html: marked.parse(
                runOutput || "_Waiting for first tokens…_",
                { async: false }
              ) as string,
            }}
          />
        </section>
      )}
    </div>
  );
}

function fillPrompt(body: string, vars: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const v = vars[name];
    return v && v.trim() ? v : `{{${name}}}`;
  });
}
