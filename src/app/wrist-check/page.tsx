import type { Metadata } from "next";
import WristWall from "@/app/wrist-check/WristWall";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Wrist Check: What's on Your Wrist Today? | Brandon's Brands",
  description:
    "Share a photo of the watch on your wrist today and see what other collectors are wearing. Brandon picks a Wrist Check of the Week every week.",
  alternates: { canonical: "/wrist-check" },
};

export default function WristCheckPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-0 py-4 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Wrist Check</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">What&apos;s on your wrist today?</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Post a wrist shot of the watch you&apos;re wearing and see what everyone else picked today. Every week Brandon chooses a Wrist Check of the Week to feature on
          the site, in the newsletter and on his socials.
        </p>
      </section>
      <WristWall />
      <NewsletterSignup source="wrist-check" compact className="mt-10" />
    </div>
  );
}
