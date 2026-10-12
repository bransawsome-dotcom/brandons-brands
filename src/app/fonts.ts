import localFont from "next/font/local";

// Self-hosted fonts for the dark luxury look (SIL Open Font License). Each exposes a CSS variable
// that globals.css maps to font-display / font-sans / font-serif.
export const displayFont = localFont({
  src: [
    { path: "../fonts/barlow-condensed-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/barlow-condensed-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-display-face",
  display: "swap",
  fallback: ["Arial Narrow", "sans-serif"],
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
