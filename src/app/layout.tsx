import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AskBrandon from "@/components/AskBrandon";
import MobileTabBar from "@/components/MobileTabBar";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import ScrollReveal from "@/components/ScrollReveal";
import { ViewTransition } from "react";
import { displayFont, serifFont, textFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Brandon's Brands",
  description:
    "Luxury and microbrand watch reviews by Brandon Volosov, plus a free watch collection tracker, wishlist, value estimates and a community of collectors.",
  openGraph: {
    type: "website",
    siteName: "Brandon's Brands",
    locale: "en_US",
    images: [{ url: "/og-image.png?v=2", width: 1200, height: 630, alt: "Brandon's Brands: watches worth knowing" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png?v=2"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${textFont.variable} ${serifFont.variable} h-full antialiased bg-[var(--background)]`}>
      <body className="min-h-screen bg-[var(--background)] pb-16 text-ink md:pb-0">
        <AuthProvider>
          <SiteHeader />
          <div className="mx-auto w-full max-w-[1320px] px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
            <ViewTransition name="bb-page">
              <main className="flex-1">{children}</main>
            </ViewTransition>
          </div>
          <ScrollReveal />
          <SiteFooter />
          <AskBrandon />
          <MobileTabBar />
        </AuthProvider>
        {/* Vercel Web Analytics: page views per page/post, no cookies. Enable it in the Vercel project's Analytics tab. */}
        <Analytics />
      </body>
    </html>
  );
}
