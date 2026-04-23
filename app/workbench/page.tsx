import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { WorkbenchHome } from "./workbench-home";

export const metadata = { title: "Workbench · ArcticMind" };

/*
  Workbench shell. All pipeline interaction (accounts, filtering,
  upcoming, CRUD) happens in the WorkbenchHome client component so
  localStorage overlays render live.
*/

export default function WorkbenchPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Workbench"
        title="Pipeline and meeting prep."
        right={
          <Link
            href="/workbench/accounts/new"
            className="btn-secondary inline-block bg-white"
          >
            + New account
          </Link>
        }
      />
      <WorkbenchHome />
    </div>
  );
}
