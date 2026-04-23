import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PracticeApp } from "@/app/tools/practice/practice-app";
import { PresentModeFrame } from "@/components/showcase/present-mode";

export const metadata = { title: "Practice · Showcase · ArcticMind" };

export default function ShowcasePracticePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1200px] px-6 py-8 text-[12px] text-ink-muted">Loading…</div>}>
      <PresentModeFrame>
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <PageHeader
            kicker="Showcase · Practice"
            title="Claude, working on the thing they mentioned on the call."
          />
          <PracticeApp />
        </div>
      </PresentModeFrame>
    </Suspense>
  );
}
