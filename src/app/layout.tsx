import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import MainNav from "@/components/MainNav";
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
  title: "Brandon's Brands",
  description: "Luxury watch collection and wishlist for Brandon's Brands.",
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
            <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-300 sm:text-sm">Brandon&apos;s Brands</p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">Luxury Watch Curation</h1>
              </div>
              <nav className="w-full overflow-x-auto text-sm sm:w-auto">
                <MainNav />
              </nav>
            </header>

            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
