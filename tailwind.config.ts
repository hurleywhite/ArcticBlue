import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial palette — the two blues do the work
        navy: {
          DEFAULT: "#1F3A5F",
          hover: "#2A4A7A",
        },
        ice: {
          DEFAULT: "#D5E8F0",
        },
        bg: {
          page: "#FFFFFF",
          card: "#F3F6F9", // light gray-blue — subtle card grouping
          callout: "#D5E8F0", // ice blue — "pay attention here"
        },
        ink: {
          DEFAULT: "#1A1A1A", // near-black body
          muted: "#555555",
          border: "#CCCCCC",
        },
      },
      fontFamily: {
        // Arial is the identity. Explicit stack to survive doc conversion.
        sans: ['Arial', 'Helvetica', '"Helvetica Neue"', 'sans-serif'],
      },
      fontSize: {
        // 9/10/10/10/14 pt hierarchy translated to px
        footer: ["12px", { lineHeight: "1.4" }],
        body: ["13px", { lineHeight: "1.55" }],
        subhead: ["14px", { lineHeight: "1.3", fontWeight: "700" }],
        section: ["14px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "0.08em" }],
        display: ["20px", { lineHeight: "1.15", fontWeight: "700" }],
      },
      borderRadius: {
        // No rounded corners above 2px. Enforce it in the token.
        none: "0",
        sm: "2px",
        DEFAULT: "2px",
      },
      spacing: {
        // Tight spacing discipline — half of default
        "cell-y": "10px",
        "cell-x": "18px",
      },
      boxShadow: {
        // Kill all shadows. Modals use a single hairline border instead.
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
