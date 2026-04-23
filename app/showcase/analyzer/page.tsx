import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyzerApp } from "@/app/analyzer/analyzer-app";
import { PresentModeFrame } from "@/components/showcase/present-mode";

export const metadata = { title: "Analyzer · Showcase · ArcticMind" };

export default function ShowcaseAnalyzerPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1200px] px-6 py-8 text-[12px] text-ink-muted">Loading…</div>}>
      <PresentModeFrame>
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <PageHeader
            kicker="Showcase · Analyzer"
            title="Type their domain. Watch the profile build in real time."
          />
          <AnalyzerApp />
        </div>
      </PresentModeFrame>
    </Suspense>
  );
}
