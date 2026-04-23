import { Suspense } from "react";
import { OpportunityCanvas } from "@/components/canvas/opportunity-canvas";
import { PresentModeFrame } from "@/components/showcase/present-mode";

export const metadata = { title: "Canvas · Showcase · ArcticMind" };

export default function ShowcaseCanvasPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1200px] px-6 py-8 text-[12px] text-ink-muted">Loading…</div>}>
      <PresentModeFrame>
        <OpportunityCanvas />
      </PresentModeFrame>
    </Suspense>
  );
}
