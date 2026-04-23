"use client";

import { useState } from "react";
import { marked } from "marked";
import { newArtifactId, useLabState } from "@/lib/state/lab";

/*
  Your-own-artifact panel on the Lab detail page. Add what you built
  during (or after) the session; toggle shared_to_team to make it
  visible to the rest of the org when Supabase is wired. For now,
  artifacts persist in localStorage only.
*/

export function LabArtifactsClient({ labId }: { labId: string }) {
  const [state, setState] = useLabState();
  const yours = state.artifacts.filter((a) => a.lab_id === labId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shared, setShared] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      artifacts: [
        {
          id: newArtifactId(),
          lab_id: labId,
          title: title.trim(),
          content_markdown: content.trim(),
          shared_to_team: shared,
          created_at: now,
        },
        ...prev.artifacts,
      ],
    }));
    setTitle("");
    setContent("");
    setShared(false);
  };

  const toggleShared = (id: string) => {
    setState((prev) => ({
      ...prev,
      artifacts: prev.artifacts.map((a) =>
        a.id === id ? { ...a, shared_to_team: !a.shared_to_team } : a
      ),
    }));
  };

  const remove = (id: string) => {
    setState((prev) => ({
      ...prev,
      artifacts: prev.artifacts.filter((a) => a.id !== id),
    }));
  };

  return (
    <>
      <h2 className="section-header mt-10 mb-2">Your artifacts</h2>

      {yours.length === 0 && (
        <p className="mb-4 text-[12px] text-ink-muted">
          Nothing saved yet. Drop in what you built during the session — a draft brief,
          a prompt you want to reuse, a runbook. Share to team when it's worth other
          people seeing.
        </p>
      )}

      {yours.map((a) => (
        <div key={a.id} className="mb-3 border border-ink-border">
          <div className="flex items-center justify-between bg-bg-card px-4 py-2">
            <div>
              <div className="text-[13px] font-bold text-navy">{a.title}</div>
              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                Added {new Date(a.created_at).toLocaleDateString()}
                {a.shared_to_team ? " · Shared to team" : " · Private"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleShared(a.id)}
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy hover:underline"
              >
                {a.shared_to_team ? "Unshare" : "Share to team"}
              </button>
              <button
                onClick={() => remove(a.id)}
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted hover:text-navy"
              >
                Delete
              </button>
            </div>
          </div>
          <div
            className="prose-editorial px-5 py-4 text-[13px]"
            dangerouslySetInnerHTML={{
              __html: marked.parse(a.content_markdown, { async: false }) as string,
            }}
          />
        </div>
      ))}

      <form onSubmit={submit} className="border border-ink-border bg-bg-card px-5 py-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy">
          Add an artifact
        </div>
        <div className="mt-2">
          <input
            className="input"
            placeholder="Title — e.g. 'My v2 synthesis prompt' or 'Team runbook'"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mt-2">
          <textarea
            className="textarea"
            rows={6}
            placeholder="Markdown content — what you built, what you learned, what's worth sharing"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-[12px]">
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
            />
            Share with my team
          </label>
          <button type="submit" className="btn-primary" disabled={!title.trim() || !content.trim()}>
            Save artifact
          </button>
        </div>
      </form>
    </>
  );
}
