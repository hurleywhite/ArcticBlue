import { PageHeader } from "@/components/shared/page-header";
import { AnalyzerApp } from "./analyzer-app";

export const metadata = { title: "Company Analyzer · ArcticMind" };

export default function AnalyzerPage() {
  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Analyzer"
        title="A company's tech stack and AI posture, inferred from public signals."
        description="Public job listings + Claude web search, synthesized into a full company digest — tech stack, products, AI adoption, recent news, actionable insights."
      />
      <div className="mt-12">
        <AnalyzerApp />
      </div>
    </div>
  );
}
