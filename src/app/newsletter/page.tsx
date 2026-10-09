import type { Metadata } from "next";
import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Weekly Watch Newsletter | Brandon's Brands",
  description:
    "Get Brandon Volosov's week in watches: new hands-on videos, microbrand finds, meetups, the Wrist Check of the week and watches for sale. Free, with a pre-owned buying checklist.",
  alternates: { canonical: "/newsletter" },
};

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const unsubscribed = sp.unsubscribed === "1";
  const failed = sp.unsubscribe === "failed";
  return (
    <div className="mx-auto w-full max-w-3xl px-0 py-4 sm:px-6 sm:py-10">
      <h1 className="sr-only">Brandon&apos;s Brands weekly watch newsletter</h1>
      {unsubscribed ? (
        <p className="mb-6 rounded-2xl bg-white/5 px-5 py-4 text-slate-200">You&apos;ve been unsubscribed. Sorry to see you go! You can sign up again below anytime.</p>
      ) : null}
      {failed ? <p className="mb-6 rounded-2xl bg-rose-500/10 px-5 py-4 text-rose-200">That unsubscribe link didn&apos;t work. Email us and we&apos;ll remove you.</p> : null}
      <NewsletterSignup source="newsletter-page" />
      <p className="mt-6 px-1 text-sm text-slate-400">
        Meanwhile: read the <Link href="/blog" className="text-blue-300 hover:text-blue-200">blog</Link>, browse{" "}
        <Link href="/favorites" className="text-blue-300 hover:text-blue-200">Brandon&apos;s Favorites</Link> or{" "}
        <Link href="/collection" className="text-blue-300 hover:text-blue-200">track your collection</Link>.
      </p>
    </div>
  );
}
