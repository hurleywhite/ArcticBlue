import type { Config } from "tailwindcss";

/*
  ArcticMind design tokens — dark-first, precision-engineered.
  Base canvas is ink-deep navy; cards raise to ink-raised.
  Accents are the glacier-blue frost family + sparing warm/sage/rose.
*/

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canvas
        ink: {
          DEFAULT: "#0B1E3F",
          deep: "#060F22",
          raised: "#11254B",
        },
        paper: {
          DEFAULT: "#F6F3EC",
          raised: "#FFFFFF",
        },
        chalk: "#E8E2D3",

        // Accents — used sparingly, two max per screen
        frost: {
          DEFAULT: "#8BB2ED",
          deep: "#3E6CB0",
        },
        amber: "#FFD074",
        sage: "#A3D9B1",
        rose: "#D89AC9",

        // Legacy token aliases — keep working until migrated,
        // but resolve to the new palette on dark backgrounds.
        navy: {
          DEFAULT: "#0B1E3F",
          hover: "#11254B",
        },
        ice: "rgba(139, 178, 237, 0.12)",
        bg: {
          page: "#0B1E3F",
          card: "#11254B",
          callout: "rgba(139, 178, 237, 0.10)",
        },
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: [
          "var(--font-ibm-plex-sans)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "var(--font-ibm-plex-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      fontSize: {
        // Honor the brief's scale exactly
        display: ["72px", { lineHeight: "0.95", letterSpacing: "-0.025em", fontWeight: "400" }],
        "display-sm": ["56px", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "400" }],
        h1: ["40px", { lineHeight: "1.05", letterSpacing: "-0.015em", fontWeight: "400" }],
        h2: ["28px", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "400" }],
        h3: ["17px", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["15px", { lineHeight: "1.55", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        kicker: ["11px", { lineHeight: "1.3", fontWeight: "500", letterSpacing: "0.18em" }],
        "kicker-sm": ["10px", { lineHeight: "1.3", fontWeight: "500", letterSpacing: "0.2em" }],
      },
      borderRadius: {
        none: "0",
        xs: "1px",
        sm: "2px",
        DEFAULT: "2px",
        md: "4px",
        lg: "4px",
        xl: "6px",
        "2xl": "6px", // cap — no rounded-2xl bubbly corners
      },
      boxShadow: {
        none: "none",
        paper: "0 20px 60px rgba(11, 30, 63, 0.08)",
      },
      transitionTimingFunction: {
        house: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
        "400": "400ms",
      },
      spacing: {
        "px": "1px",
        "0.5": "4px",
      },
      maxWidth: {
        shell: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
