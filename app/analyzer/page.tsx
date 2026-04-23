import { PageHeader } from "@/components/shared/page-header";
import { AnalyzerApp } from "./analyzer-app";

export const metadata = { title: "Company Analyzer · ArcticMind" };

export default function AnalyzerPage() {
  return (
    <div className="shell pb-32">
      <PageHeader
        kicker="Analyzer"
        title="A company's tech stack and AI posture, inferred from public signals."
        description="Apollo firmographics + Exa-sourced recent content + Claude synthesis. Domain in, full profile out."
      />
      <div className="mt-12">
        <AnalyzerApp />
      </div>
    </div>
  );
}
