import { PageHeader } from "@/components/shared/page-header";
import { DeliverableGalleryClient } from "./gallery-client";

export const metadata = { title: "Deliverables · ArcticMind" };

export default function DeliverablesPage() {
  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Deliverables"
        title="Run ArcticBlue methods on your client work."
        description="Guided workflows that produce a branded PDF you can send straight to a client — with an optional partner co-brand and a referral block back to ArcticBlue."
      />
      <DeliverableGalleryClient />
    </div>
  );
}
