"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import type { Template } from "@/lib/content/types";

/*
  Template runner: variable inputs produce a filled markdown body.
  Actions: Copy markdown, Copy formatted (HTML), Print (as PDF via
  the browser), Use with Practice.

  Real PDF export (react-pdf or Puppeteer) replaces the browser print
  path when server-side PDF generation lands.
*/

export function TemplateRunner({ template }: { template: Template }) {
  const router = useRouter();
  const [vars, setVars] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    template.variables.forEach((v) => (init[v.name] = ""));
    return init;
  });
  const [copied, setCopied] = useState<"md" | "html" | null>(null);

  const filled = useMemo(
    () => fillTemplate(template.body_markdown, vars),
    [template, vars]
  );

  const filledHtml = useMemo(() => marked.parse(filled, { async: false }) as string, [filled]);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(filled);
      setCopied("md");
      setTimeout(() => setCopied(null), 1400);
    } catch {}
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(filledHtml);
      setCopied("html");
      setTimeout(() => setCopied(null), 1400);
    } catch {}
  };

  const printPdf = () => {
    if (typeof window === "undefined") return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${template.title}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 24px; color: #1A1A1A; font-size: 13px; line-height: 1.55; }
        h1,h2,h3,h4 { color: #1F3A5F; }
        h1 { font-size: 22px; border-bottom: 1px solid #CCCCCC; padding-bottom: 10px; }
        h2 { font-size: 15px; margin-top: 22px; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #CCCCCC; }
        th, td { border: 1px solid #CCCCCC; padding: 8px 12px; text-align: left; vertical-align: top; }
        thead th { background: #1F3A5F; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
        blockquote { background: #D5E8F0; border-left: 3px solid #1F3A5F; padding: 10px 14px; margin: 10px 0; }
        footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #CCCCCC; color: #555; font-size: 11px; }
      </style>
    </head><body>${filledHtml}
    <footer>Generated with ArcticMind · arcticblue.ai</footer>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  const useInPractice = () => {
    sessionStorage.setItem(
      "arcticmind:seed:template",
      JSON.stringify({
        templateId: template.id,
        templateTitle: template.title,
        filledBody: filled,
      })
    );
    router.push("/tools/practice?seed=template");
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[1fr_1fr]">
      <div>
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
          {template.variables.map((v, idx) => (
            <div
              key={v.name}
              className="grid grid-cols-1 gap-0 md:grid-cols-[200px_1fr]"
              style={{
                borderBottom:
                  idx === template.variables.length - 1
                    ? "none"
                    : "1px solid var(--fg-16)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{
                  background: "var(--ink-deep)",
                  borderRight: "1px solid var(--fg-16)",
                }}
              >
                <div
                  className="serif text-[14px] leading-[1.2]"
                  style={{ color: "var(--fg-100)" }}
                >
                  {v.label}
                </div>
                <div
                  className="mt-1 font-mono text-[10.5px]"
                  style={{ color: "var(--frost)" }}
                >
                  {`{{${v.name}}}`}
                </div>
              </div>
              <div className="px-4 py-3">
                <input
                  className="input"
                  placeholder={v.placeholder ?? ""}
                  value={vars[v.name]}
                  onChange={(e) =>
                    setVars((prev) => ({ ...prev, [v.name]: e.target.value }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <div
          className="mt-5 flex flex-wrap items-center gap-2 border-t pt-5"
          style={{ borderTopColor: "var(--fg-16)" }}
        >
          <button onClick={copyMarkdown} className="btn-secondary">
            {copied === "md" ? "Copied" : "Copy markdown"}
          </button>
          <button onClick={copyHtml} className="btn-secondary">
            {copied === "html" ? "Copied" : "Copy formatted"}
          </button>
          <button onClick={printPdf} className="btn-secondary">
            Export PDF
          </button>
          <button onClick={useInPractice} className="btn-primary ml-auto">
            Use with Practice →
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <span className="kicker">Preview</span>
          <span className="h-px flex-1" style={{ background: "var(--fg-16)" }} />
        </div>
        <div
          className="prose-editorial mt-4 px-6 py-5"
          style={{
            background: "var(--ink-raised)",
            border: "1px solid var(--fg-16)",
            borderRadius: 2,
          }}
          dangerouslySetInnerHTML={{ __html: filledHtml }}
        />
      </div>
    </div>
  );
}

function fillTemplate(body: string, vars: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const v = vars[name];
    return v && v.trim() ? v : `[${name}]`;
  });
}
