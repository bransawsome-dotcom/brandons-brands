import localFont from "next/font/local";

// Self-hosted fonts for the dark luxury look (SIL Open Font License). Each exposes a CSS variable
// that globals.css maps to font-display / font-sans / font-serif.
export const displayFont = localFont({
  src: [
    // Cinzel: engraved Roman capitals (SIL OFL), set heavier than its names for a pronounced look:
    // "light" accent words use 500, regular 600, semibold and bold 700.
    { path: "../fonts/cinzel-500.woff2", weight: "300", style: "normal" },
    { path: "../fonts/cinzel-600.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cinzel-700.woff2", weight: "600", style: "normal" },
    { path: "../fonts/cinzel-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display-face",
  display: "swap",
  fallback: ["Times New Roman", "serif"],
});

export const textFont = localFont({
  src: "../fonts/instrument-sans.woff2",
  weight: "400 700",
  variable: "--font-text",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const serifFont = localFont({
  src: [
    { path: "../fonts/cormorant-garamond.woff2", weight: "300 700", style: "normal" },
    { path: "../fonts/cormorant-garamond-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-serif-face",
  display: "swap",
  fallback: ["Garamond", "Times New Roman", "serif"],
});
