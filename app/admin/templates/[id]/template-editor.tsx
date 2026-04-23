"use client";

import { useState } from "react";
import type { Template } from "@/lib/content/types";
import { Markdown } from "@/components/shared/markdown";
import { EditorRow, EditorSection, SaveBar } from "@/components/admin/editor-primitives";

export function TemplateEditor({ template: t }: { template: Template }) {
  const [title, setTitle] = useState(t.title);
  const [description, setDescription] = useState(t.description);
  const [templateType, setTemplateType] = useState(t.template_type);
  const [body, setBody] = useState(t.body_markdown);
  const [variables, setVariables] = useState(t.variables);
  const [topics, setTopics] = useState((t.tags.topics ?? []).join(", "));
  const [roles, setRoles] = useState((t.tags.roles ?? []).join(", "));

  const addVar = () =>
    setVariables((prev) => [
      ...prev,
      { name: `var_${prev.length + 1}`, label: "New variable", type: "text" as const },
    ]);
  const removeVar = (i: number) =>
    setVariables((prev) => prev.filter((_, idx) => idx !== i));

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
        <EditorRow label="Type">
          <select
            className="select"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as Template["template_type"])}
          >
            <option value="email">Email</option>
            <option value="brief">Brief</option>
            <option value="analysis">Analysis</option>
            <option value="plan">Plan</option>
            <option value="other">Other</option>
          </select>
        </EditorRow>
      </EditorSection>

      <h2 className="section-header mt-8 mb-3">Template body</h2>
      <p className="mb-2 text-[12px] text-ink-muted">
        Markdown with <code>{`{{variable_name}}`}</code> placeholders. Preview on the right.
      </p>
      <div className="grid grid-cols-1 gap-0 border border-ink-border md:grid-cols-2">
        <div className="border-b border-ink-border md:border-b-0 md:border-r">
          <div className="bg-navy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Markdown
          </div>
          <textarea
            className="w-full border-0 bg-white p-4 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[12px] leading-[1.55] focus:outline-none"
            style={{ minHeight: 460, resize: "vertical" }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div>
          <div className="bg-navy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Preview
          </div>
          <div className="p-5">
            <Markdown>{body || "_Preview appears here._"}</Markdown>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="section-header mb-0">Variables</h2>
        <button onClick={addVar} className="btn-secondary">
          + Add variable
        </button>
      </div>
      <table className="doc-table mt-2">
        <thead>
          <tr>
            <th style={{ width: "24%" }}>Name</th>
            <th style={{ width: "30%" }}>Label</th>
            <th>Placeholder</th>
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
                  onChange={(e) => {
                    const name = e.target.value;
                    setVariables((prev) => prev.map((vv, idx) => (idx === i ? { ...vv, name } : vv)));
                  }}
                />
              </td>
              <td>
                <input
                  className="input"
                  value={v.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setVariables((prev) => prev.map((vv, idx) => (idx === i ? { ...vv, label } : vv)));
                  }}
                />
              </td>
              <td>
                <input
                  className="input"
                  value={v.placeholder ?? ""}
                  onChange={(e) => {
                    const placeholder = e.target.value;
                    setVariables((prev) =>
                      prev.map((vv, idx) => (idx === i ? { ...vv, placeholder } : vv))
                    );
                  }}
                />
              </td>
              <td>
                <button
                  onClick={() => removeVar(i)}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted hover:text-navy"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {variables.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center italic text-ink-muted">
                No variables defined.
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
      </EditorSection>

      <SaveBar slug={t.slug} id={t.id} />
    </div>
  );
}
