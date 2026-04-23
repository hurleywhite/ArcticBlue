import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES, getTemplateBySlug } from "@/lib/content/templates";
import { TemplateRunner } from "./template-runner";

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = getTemplateBySlug(slug);
  return { title: t ? `${t.title} · ArcticMind` : "Template · ArcticMind" };
}

const TYPE_LABEL: Record<string, string> = {
  email: "Email",
  brief: "Brief",
  analysis: "Analysis",
  plan: "Plan",
  other: "Other",
};

export default async function TemplateDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = getTemplateBySlug(slug);
  if (!t) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="bg-navy px-6 py-5 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
          <Link href="/tools/templates" className="hover:underline">
            Templates
          </Link>
          <span className="mx-2">·</span>
          <span>{TYPE_LABEL[t.template_type]}</span>
          <span className="mx-2">·</span>
          <span>{t.variables.length} variables</span>
        </div>
        <h1 className="mt-2 text-[22px] font-bold leading-[1.15]">{t.title}</h1>
        <p className="mt-1 text-[13px] opacity-90">{t.description}</p>
      </div>

      <TemplateRunner template={t} />
    </div>
  );
}
