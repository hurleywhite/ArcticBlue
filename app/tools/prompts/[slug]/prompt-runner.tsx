"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Prompt } from "@/lib/content/types";

/*
  Prompt runner: variable inputs → live preview of the filled prompt →
  Copy and "Try in Practice" actions. The filled prompt is passed to
  /tools/practice via query params where a new session is seeded.
*/

export function PromptRunner({ prompt }: { prompt: Prompt }) {
  const router = useRouter();
  const [vars, setVars] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    prompt.variables.forEach((v) => (init[v.name] = ""));
    return init;
  });
  const [copied, setCopied] = useState(false);

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

      <div className="mt-4 flex items-center justify-between border-t border-ink-border pt-4">
        <button onClick={copy} className="btn-secondary">
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
        <button onClick={tryInPractice} className="btn-primary">
          Try in Practice →
        </button>
      </div>
    </div>
  );
}

function fillPrompt(body: string, vars: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const v = vars[name];
    return v && v.trim() ? v : `{{${name}}}`;
  });
}
