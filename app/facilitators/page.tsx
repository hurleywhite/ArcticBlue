import { PageHeader } from "@/components/shared/page-header";
import { FACILITATORS } from "@/lib/content/facilitators";
import { FacilitatorBrowser } from "./facilitator-browser";

export const metadata = { title: "Facilitators · ArcticMind" };

export default function FacilitatorsPage() {
  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Facilitators"
        title="The global pool."
        description="External consultants and trainers available for engagements. Filter by focus, experience level, and region. Pull into proposals or match to a client Lab."
      />
      <div className="mt-12">
        <FacilitatorBrowser facilitators={FACILITATORS} />
      </div>
    </div>
  );
}
