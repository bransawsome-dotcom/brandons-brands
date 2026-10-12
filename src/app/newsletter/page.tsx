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
        <p className="mb-6 rounded bg-surface px-5 py-4 text-ink">You&apos;ve been unsubscribed. Sorry to see you go! You can sign up again below anytime.</p>
      ) : null}
      {failed ? <p className="mb-6 rounded bg-rose-500/10 px-5 py-4 text-rose-700">That unsubscribe link didn&apos;t work. Email us and we&apos;ll remove you.</p> : null}
      <NewsletterSignup source="newsletter-page" />
      <p className="mt-6 px-1 text-sm text-muted">
        Meanwhile: read the <Link href="/blog" className="text-gold hover:text-gold">blog</Link>, browse{" "}
        <Link href="/favorites" className="text-gold hover:text-gold">Brandon&apos;s Favorites</Link> or{" "}
        <Link href="/collection" className="text-gold hover:text-gold">track your collection</Link>.
      </p>
    </div>
  );
}
