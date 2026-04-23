import { PageHeader } from "@/components/shared/page-header";
import { WorkbenchHome } from "./workbench-home";

export const metadata = { title: "Workbench · ArcticMind" };

export default function WorkbenchPage() {
  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Workbench"
        title="Pipeline and meeting prep."
        description="Accounts, drafted pre-meeting briefs, follow-up drafter, and activity log. All state persists locally."
      />
      <WorkbenchHome />
    </div>
  );
}
