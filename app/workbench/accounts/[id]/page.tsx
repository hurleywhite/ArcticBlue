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
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Workbench"
        title="Account"
        right={
          <Link href="/workbench" className="btn-secondary inline-block bg-white">
            ← Pipeline
          </Link>
        }
      />
      <AccountClient accountId={id} />
    </div>
  );
}
