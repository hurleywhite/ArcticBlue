"use client";

import { useMemo, useState } from "react";
import type { Prompt, PromptVariable } from "@/lib/content/types";
import { EditorRow, EditorSection, SaveBar } from "@/components/admin/editor-primitives";

/*
  Prompt editor. Monospace textarea for the body (highlights {{variables}} via
  CSS nested span styling on change). Below it, a variable builder — add rows
  with name, label, type, options (for selects). Preview at the bottom shows
  how the prompt will render in the library with variables substituted to
  sample values.
*/

export function PromptEditor({ prompt: p }: { prompt: Prompt }) {
  const [title, setTitle] = useState(p.title);
  const [description, setDescription] = useState(p.description);
  const [body, setBody] = useState(p.prompt_body);
  const [variables, setVariables] = useState<PromptVariable[]>(p.variables);
  const [topics, setTopics] = useState((p.tags.topics ?? []).join(", "));
  const [roles, setRoles] = useState((p.tags.roles ?? []).join(", "));
  const [categories, setCategories] = useState((p.tags.categories ?? []).join(", "));

  const missingVars = useMemo(() => {
    const used = new Set<string>();
    body.replace(/\{\{(\w+)\}\}/g, (_, name) => {
      used.add(name);
      return "";
    });
    const defined = new Set(variables.map((v) => v.name));
    return {
      undefined: Array.from(used).filter((n) => !defined.has(n)),
      unused: variables.map((v) => v.name).filter((n) => !used.has(n)),
    };
  }, [body, variables]);

  const addVariable = () => {
    setVariables((prev) => [
      ...prev,
      { name: `var_${prev.length + 1}`, label: "New variable", type: "text" },
    ]);
  };
  const removeVariable = (i: number) =>
    setVariables((prev) => prev.filter((_, idx) => idx !== i));
  const updateVariable = (i: number, patch: Partial<PromptVariable>) =>
    setVariables((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  return (
    <div className="mt-6">
      <EditorSection title="Basics">
        <EditorRow label="Title">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </EditorRow>
        <EditorRow label="Description">
          <textarea
            className="textarea"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </EditorRow>
      </EditorSection>

      <h2 className="section-header mt-8 mb-3">Prompt body</h2>
      <p className="mb-2 text-[12px] text-ink-muted">
        Use <code>{`{{variable_name}}`}</code> to mark fillable variables.
      </p>
      <textarea
        className="w-full border border-ink-border bg-white p-4 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[12px] leading-[1.55] focus:outline-none focus:border-navy"
        style={{ minHeight: 340, resize: "vertical" }}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {(missingVars.undefined.length > 0 || missingVars.unused.length > 0) && (
        <div className="callout mt-3 text-[12px]">
          {missingVars.undefined.length > 0 && (
            <div>
              <strong>Undefined variables in body:</strong>{" "}
              {missingVars.undefined.map((n) => (
                <code key={n} className="mx-1">{`{{${n}}}`}</code>
              ))}
            </div>
          )}
          {missingVars.unused.length > 0 && (
            <div className="mt-1">
              <strong>Defined but unused:</strong>{" "}
              {missingVars.unused.map((n) => (
                <code key={n} className="mx-1">{`{{${n}}}`}</code>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="section-header mb-0">Variables</h2>
        <button onClick={addVariable} className="btn-secondary">
          + Add variable
        </button>
      </div>
      <table className="doc-table mt-2">
        <thead>
          <tr>
            <th style={{ width: "18%" }}>Name</th>
            <th style={{ width: "22%" }}>Label</th>
            <th style={{ width: "14%" }}>Type</th>
            <th>Placeholder / options</th>
            <th style={{ width: "8%" }}></th>
          </tr>
        </thead>
        <tbody>
          {variables.map((v, i) => (
            <tr key={i}>
              <td>
                <input
                  className="input"
                  value={v.name}
                  onChange={(e) => updateVariable(i, { name: e.target.value })}
                />
              </td>
              <td>
                <input
                  className="input"
                  value={v.label}
                  onChange={(e) => updateVariable(i, { label: e.target.value })}
                />
              </td>
              <td>
                <select
                  className="select"
                  value={v.type}
                  onChange={(e) =>
                    updateVariable(i, { type: e.target.value as PromptVariable["type"] })
                  }
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                </select>
              </td>
              <td>
                {v.type === "select" ? (
                  <input
                    className="input"
                    placeholder="Option A, Option B, Option C"
                    value={(v.options ?? []).join(", ")}
                    onChange={(e) =>
                      updateVariable(i, {
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                ) : (
                  <input
                    className="input"
                    placeholder="Placeholder text"
                    value={v.placeholder ?? ""}
                    onChange={(e) => updateVariable(i, { placeholder: e.target.value })}
                  />
                )}
              </td>
              <td>
                <button
                  onClick={() => removeVariable(i)}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted hover:text-navy"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {variables.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center italic text-ink-muted">
                No variables defined. Add one with the button above.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <EditorSection title="Tags">
        <EditorRow label="Topics">
          <input className="input" value={topics} onChange={(e) => setTopics(e.target.value)} />
        </EditorRow>
        <EditorRow label="Roles">
          <input className="input" value={roles} onChange={(e) => setRoles(e.target.value)} />
        </EditorRow>
        <EditorRow label="Opportunity categories">
          <input className="input" value={categories} onChange={(e) => setCategories(e.target.value)} />
        </EditorRow>
      </EditorSection>

      <SaveBar slug={p.slug} id={p.id} />
    </div>
  );
}
