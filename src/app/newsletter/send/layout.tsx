import type { Metadata } from "next";

export const metadata: Metadata = { title: "Send newsletter | Brandon's Brands", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
