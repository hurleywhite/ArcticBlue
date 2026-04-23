import { PageHeader } from "@/components/shared/page-header";
import { AnalyzerApp } from "./analyzer-app";

export const metadata = { title: "Company Analyzer · ArcticMind" };

export default function AnalyzerPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Company Analyzer"
        title="Infer a company's tech stack, products, and AI posture from public signals."
      />
      <AnalyzerApp />
    </div>
  );
}
