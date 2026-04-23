import Link from "next/link";
import { notFound } from "next/navigation";
import { PROMPTS } from "@/lib/content/prompts";
import { PageHeader } from "@/components/shared/page-header";
import { PromptEditor } from "./prompt-editor";

export async function generateStaticParams() {
  return PROMPTS.map((p) => ({ id: p.id }));
}

export default async function AdminPromptEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = PROMPTS.find((pp) => pp.id === id);
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Admin · Prompt"
        title={`Edit: ${p.title}`}
        right={
          <Link href="/admin/prompts" className="btn-secondary inline-block bg-white">
            ← All prompts
          </Link>
        }
      />
      <PromptEditor prompt={p} />
    </div>
  );
}
