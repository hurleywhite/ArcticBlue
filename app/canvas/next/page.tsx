import { PageHeader } from "@/components/shared/page-header";
import { NextSteps } from "./next-steps";

export const metadata = { title: "What's next · ArcticMind" };

export default function CanvasNextPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="From your Canvas"
        title="What's next for the opportunities you starred."
      />
      <NextSteps />
    </div>
  );
}
