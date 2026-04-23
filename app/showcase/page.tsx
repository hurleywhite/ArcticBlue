import { PageHeader } from "@/components/shared/page-header";
import { ShowcaseGallery } from "./gallery-client";

export const metadata = { title: "Showcase · ArcticMind" };

export default function ShowcasePage() {
  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Showcase"
        title="Demos for screen share."
        description="Each demo has a present mode — full-bleed, keyboard-navigable, no app chrome. Esc exits."
      />
      <ShowcaseGallery />
    </div>
  );
}
