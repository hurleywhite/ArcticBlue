import { PageHeader } from "@/components/shared/page-header";
import { MyPath } from "./my-path";

export const metadata = { title: "My Path · ArcticMind" };

export default function MyPathPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        kicker="My Path"
        title="Your learning path, based on what you starred."
      />
      <MyPath />
    </div>
  );
}
