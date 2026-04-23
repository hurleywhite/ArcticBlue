import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { TopNav } from "@/components/shell/top-nav";
import { Footer } from "@/components/shell/footer";
import { NavGate } from "@/components/shell/nav-gate";

export const metadata: Metadata = {
  title: "ArcticMind · Sales workbench",
  description:
    "Sales workbench for ArcticBlue — meeting prep, client-facing demos, reference library.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          {/* NavGate uses useSearchParams internally; wrap in Suspense so
              routes that statically prerender don't bail out of SSG. */}
          <Suspense fallback={<TopNav />}>
            <NavGate>
              <TopNav />
            </NavGate>
          </Suspense>
          <main className="flex-1">{children}</main>
          <Suspense fallback={<Footer />}>
            <NavGate>
              <Footer />
            </NavGate>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
