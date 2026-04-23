import { IBM_Plex_Sans, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";

/*
  Three-face type system loaded app-wide via next/font.
  Instrument Serif for display + headlines, IBM Plex Sans for reading,
  IBM Plex Mono for labels + metadata.
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
  weight: ["300", "400", "500"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});
