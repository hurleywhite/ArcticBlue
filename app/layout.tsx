import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ibmPlexMono, ibmPlexSans, instrumentSerif } from "./fonts";
import { TopNav } from "@/components/shell/top-nav";
import { Footer } from "@/components/shell/footer";
import { NavGate } from "@/components/shell/nav-gate";

export const metadata: Metadata = {
  title: "ArcticMind",
  description: "ArcticMind — sales and delivery workbench for ArcticBlue AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        {/*
          Three fixed textural layers behind every surface:
            1 · vignette    — fades edges into ink-deep
            2 · dot lattice — quiet mid-canvas texture
            3 · grain       — multiply-blend noise for analog feel
          Content sits at z-10 above them.
        */}
        <div className="vignette-layer" aria-hidden />
        <div className="dot-layer" aria-hidden />
        <div className="grain-layer" aria-hidden />

        <div className="relative z-10 flex min-h-screen flex-col">
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
