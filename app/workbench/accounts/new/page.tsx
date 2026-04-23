import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { NewAccountForm } from "./new-account-form";

export const metadata = { title: "New account · ArcticMind" };

export default function NewAccountPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Workbench · Accounts"
        title="New account."
        right={
          <Link href="/workbench" className="btn-secondary inline-block bg-white">
            ← Pipeline
          </Link>
        }
      />
      <NewAccountForm />
    </div>
  );
}
