import { PageHeader } from "@/components/shared/page-header";
import { USE_CASES } from "@/lib/content/use-cases";
import { CasesBrowser } from "./cases-browser";

export const metadata = { title: "Use Cases · ArcticMind" };

export default function UseCasesPage() {
  const [hero, ...rest] = USE_CASES;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="Use Cases"
        title="Anonymized proof points from real ArcticBlue engagements."
      />

      <div className="callout mt-6">
        <p>
          Every case is anonymized by default. Named clients appear only when
          ArcticBlue has explicit written permission per record. Each case has
          three form factors — narrative story, one-pager PDF, slide deck.
        </p>
      </div>

      <CasesBrowser hero={hero} rest={rest} />
    </div>
  );
}
