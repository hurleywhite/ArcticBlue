import { MirrorApp } from "./mirror-app";
import { ibmPlexMono, ibmPlexSans, instrumentSerif } from "./fonts";
import "./mirror.css";

export const metadata = { title: "AI Mirror · ArcticMind" };

/*
  The Mirror is a set-piece visual surface — deliberately dark, cosmic,
  and serif-led. That's a conscious divergence from the editorial Arial
  system used elsewhere in the app. It's intentional: the orbital-field
  metaphor depends on the starfield.

  Everything is scoped to `.mirror-root` so the styles don't leak.
*/

export default function MirrorPage() {
  return (
    <div
      className={`mirror-root bg-space ${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <MirrorApp />
      <div className="grain" />
    </div>
  );
}
