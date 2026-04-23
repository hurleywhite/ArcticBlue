import { Suspense } from "react";
import { LabShowcase } from "./lab-showcase";
import { PresentModeFrame } from "@/components/showcase/present-mode";

export const metadata = { title: "The Lab · Showcase · ArcticMind" };

/*
  Lab showcase — the one-pager pitch as a four-panel animated explainer.
  Press the right arrow (or Space) to advance. Exits to /showcase on Esc.
*/

export default function ShowcaseLabPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-[12px] text-ink-muted">Loading…</div>}>
      <PresentModeFrame>
        <LabShowcase />
      </PresentModeFrame>
    </Suspense>
  );
}
