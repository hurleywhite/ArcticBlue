import { Suspense } from "react";
import { CaseDeck } from "./case-deck";
import { PresentModeFrame } from "@/components/showcase/present-mode";

export const metadata = { title: "Case studies · Showcase · ArcticMind" };

/*
  Case studies deck. One index slide + six per-case slides, each
  revealing Business Challenge → Solution → Impact as the presenter
  clicks through. Arrow keys advance; Esc exits present mode.
*/

export default function ShowcaseCasesPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-[12px] text-ink-muted">Loading…</div>}>
      <PresentModeFrame>
        <CaseDeck />
      </PresentModeFrame>
    </Suspense>
  );
}
