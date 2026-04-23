import Link from "next/link";
import { notFound } from "next/navigation";
import { USE_CASES } from "@/lib/content/use-cases";
import { PageHeader } from "@/components/shared/page-header";
import { UseCaseEditor } from "./use-case-editor";

export async function generateStaticParams() {
  return USE_CASES.map((u) => ({ id: u.id }));
}

export default async function AdminUseCaseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const u = USE_CASES.find((uu) => uu.id === id);
  if (!u) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Use Case"
        title={`Edit: ${u.title}`}
        right={
          <Link href="/admin/use-cases" className="btn-secondary inline-block bg-white">
            ← All use cases
          </Link>
        }
      />
      <UseCaseEditor useCase={u} />
    </div>
  );
}
