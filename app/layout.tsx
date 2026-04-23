import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/shell/top-nav";
import { Footer } from "@/components/shell/footer";
import { NavGate } from "@/components/shell/nav-gate";

export const metadata: Metadata = {
  title: "ArcticMind · Continuous AI enablement",
  description:
    "ArcticMind is ArcticBlue AI's continuous-enablement platform for enterprise teams — Canvas, Learning, Use Cases, Tools.",
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
          <NavGate>
            <TopNav />
          </NavGate>
          <main className="flex-1">{children}</main>
          <NavGate>
            <Footer />
          </NavGate>
        </div>
      </body>
    </html>
  );
}
