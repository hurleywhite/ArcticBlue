import { PageHeader } from "@/components/shared/page-header";
import { EventSourcerApp } from "./event-sourcer-app";

export const metadata = { title: "Event Sourcer · ArcticMind" };

export default function EventSourcerPage() {
  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Partner tools"
        title="Event sourcer."
        description="Partner details in, in-person event list out. Primary + halo streams, speaking/sponsorship routes verified, sorted by date."
      />
      <div className="mt-12">
        <EventSourcerApp />
      </div>
    </div>
  );
}
