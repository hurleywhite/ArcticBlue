/*
  Footer: muted gray, middle-dot separators, tight type.
  Matches the ArcticBrief footer treatment — arcticblue.ai as a
  plain-text signoff, not a logo lockup.
*/

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink-border">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-5 text-[12px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          ArcticMind · Continuous AI enablement · © {year} ArcticBlue AI
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://arcticblue.ai"
            className="hover:text-navy"
            target="_blank"
            rel="noreferrer"
          >
            arcticblue.ai
          </a>
          <span>·</span>
          <a href="/privacy" className="hover:text-navy">
            Privacy
          </a>
          <span>·</span>
          <a href="/terms" className="hover:text-navy">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
