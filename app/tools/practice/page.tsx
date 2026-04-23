import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PracticeApp } from "./practice-app";

export const metadata = { title: "Practice · ArcticMind" };

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Practice"
        title="A focused sandbox for trying AI on real work."
      />
      <Suspense fallback={<div className="mt-6 text-[12px] text-ink-muted">Loading practice…</div>}>
        <PracticeApp />
      </Suspense>
    </div>
  );
}
