import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import MainNav from "@/components/MainNav";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Brandon's Brands",
  description: "Luxury watch collection and wishlist for Brandon's Brands.",
  openGraph: {
    type: "website",
    siteName: "Brandon's Brands",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Brandon's Brands – Luxury Watch Curation" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[var(--background)]`}
    >
      <body className="min-h-screen bg-[var(--background)] text-white">
        <AuthProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
            <header className="site-header relative z-30 mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
              <Link href="/" className="flex items-center gap-3 sm:gap-4" aria-label="Brandon's Brands home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-256.webp" alt="" width={64} height={64} className="h-12 w-12 shrink-0 drop-shadow-[0_6px_18px_rgba(59,130,246,0.35)] sm:h-16 sm:w-16" />
                <span className="space-y-1">
                  <span className="block whitespace-nowrap text-xs uppercase tracking-[0.3em] text-blue-300 sm:text-sm">Brandon&apos;s Brands</span>
                  <span className="block text-xl font-semibold text-white sm:text-2xl">Luxury Watch Curation</span>
                </span>
              </Link>
              <nav className="relative z-40 w-full text-sm sm:w-auto">
                <MainNav />
              </nav>
            </header>

            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
