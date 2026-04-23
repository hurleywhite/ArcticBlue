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
      <h2 className="section-header mb-3">Fill the variables</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: "28%" }}>Variable</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {prompt.variables.map((v) => (
            <tr key={v.name}>
              <td>
                <div>
                  <strong>{v.label}</strong>
                </div>
                <div className="mt-0.5 text-[11px] text-ink-muted">
                  <code>{`{{${v.name}}}`}</code>
                </div>
              </td>
              <td>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section-header mt-8 mb-3">Filled prompt</h2>
      <pre className="card-surface whitespace-pre-wrap text-[12px] leading-[1.55]">
        {filled}
      </pre>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-border pt-4">
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
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="section-header mb-0">Output</h2>
            {runModel && (
              <span className="border border-navy bg-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                {runModel === "mock" ? "MOCK" : runModel.replace("claude-", "")}
              </span>
            )}
          </div>
          <div
            className="card-surface prose-editorial mt-2"
            dangerouslySetInnerHTML={{
              __html: marked.parse(runOutput || "_Waiting for first tokens…_", { async: false }) as string,
            }}
          />
        </div>
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
