import { PageHeader } from "@/components/shared/page-header";
import { DashboardHome } from "./dashboard-home";

export const metadata = { title: "Dashboard · ArcticMind" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Dashboard"
        title="Pick up where you left off."
      />
      <DashboardHome />
    </div>
  );
}
