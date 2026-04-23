import { Suspense } from "react";
import { USE_CASES } from "@/lib/content/use-cases";
import { CaseWalkApp } from "./case-walk-app";
import { PresentModeFrame } from "@/components/showcase/present-mode";

export const metadata = { title: "Case walks · Showcase · ArcticMind" };

/*
  Case walks — the "tell the story in 3 minutes" surface. Pick a case,
  step through challenge → approach → outcome → metric with big
  typography. Arrow keys advance slides. Exits to /showcase on Esc.
*/

export default function ShowcaseCasesPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-[12px] text-ink-muted">Loading…</div>}>
      <PresentModeFrame>
        <CaseWalkApp cases={USE_CASES} />
      </PresentModeFrame>
    </Suspense>
  );
}
