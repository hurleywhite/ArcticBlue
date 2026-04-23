import { IBM_Plex_Sans, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";

/*
  Scoped fonts for the /mirror route. Loaded via next/font so the CSS
  custom properties are only applied where the Mirror renders — the rest
  of the app stays Arial per the editorial design system.
*/

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});
