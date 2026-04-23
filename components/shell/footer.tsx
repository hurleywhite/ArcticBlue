/*
  Footer — mono metadata, middle-dot separators, low opacity. Matches
  the Bloomberg-Terminal-texture feel: data + timestamp + provenance.
*/

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-auto border-t"
      style={{ borderTopColor: "var(--fg-16)" }}
    >
      <div className="shell flex flex-col gap-2 py-6 font-mono text-[10px] uppercase tracking-[0.18em] sm:flex-row sm:items-center sm:justify-between">
        <div style={{ color: "var(--fg-52)" }}>
          ArcticMind · ArcticBlue AI · © {year}
        </div>
        <div className="flex items-center gap-4" style={{ color: "var(--fg-52)" }}>
          <a
            href="https://arcticblue.ai"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-[color:var(--fg-100)]"
          >
            arcticblue.ai
          </a>
          <span style={{ color: "var(--fg-16)" }}>·</span>
          <a
            href="/privacy"
            className="transition-colors hover:text-[color:var(--fg-100)]"
          >
            Privacy
          </a>
          <span style={{ color: "var(--fg-16)" }}>·</span>
          <a
            href="/terms"
            className="transition-colors hover:text-[color:var(--fg-100)]"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
