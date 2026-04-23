import { PageHeader } from "@/components/shared/page-header";
import { FACILITATORS } from "@/lib/content/facilitators";
import { FacilitatorBrowser } from "./facilitator-browser";

export const metadata = { title: "Facilitators · ArcticMind" };

/*
  Facilitator pool. Ported from the Joe's Facilitators prototype —
  the card + filter view, not the Leaflet map. Map can return as
  its own `/facilitators/map` route if useful.
*/

export default function FacilitatorsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Facilitators"
        title="The global pool."
      />

      <div className="callout mt-6">
        <p>
          External consultants and trainers available for ArcticBlue
          engagements. Filter by focus (facilitation, tech, both), experience
          level, and region. Use this when matching a facilitator to a client
          Lab or building a multi-facilitator proposal.
        </p>
      </div>

      <FacilitatorBrowser facilitators={FACILITATORS} />
    </div>
  );
}
