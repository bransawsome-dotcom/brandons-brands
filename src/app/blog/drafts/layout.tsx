import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & social drafts | Brandon's Brands",
  robots: { index: false, follow: false },
};

export default function DraftsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
