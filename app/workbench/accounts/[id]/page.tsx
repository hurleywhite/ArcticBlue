import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { ACCOUNTS } from "@/lib/content/accounts";
import { AccountClient } from "./account-client";

export async function generateStaticParams() {
  return ACCOUNTS.map((a) => ({ id: a.id }));
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Workbench"
        title="Account"
        right={
          <Link href="/workbench" className="btn-secondary">
            ← Pipeline
          </Link>
        }
      />
      <div className="mt-12">
        <AccountClient accountId={id} />
      </div>
    </div>
  );
}
