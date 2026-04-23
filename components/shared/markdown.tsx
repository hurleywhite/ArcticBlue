import { marked } from "marked";

/*
  Editorial markdown renderer. Runs at the server side (no hydration
  cost) and applies the editorial type scale: serif-free, navy section
  headings, tight paragraph spacing, ice-blue blockquote for "look here"
  moments.

  Not full MDX — PROJECT.md calls for MDX in Phase 1B for custom
  components like Callout and ExerciseCard, but for reading modules
  seeded with plain markdown, this is sufficient.
*/

marked.setOptions({ gfm: true, breaks: false });

export function Markdown({ children }: { children: string }) {
  const html = marked.parse(children, { async: false }) as string;
  return (
    <div
      className="prose-editorial"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
