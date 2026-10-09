import type { Metadata } from "next";
import { loadPolls } from "@/lib/polls";
import PollsView from "@/app/polls/PollsView";
import NewsletterSignup from "@/components/NewsletterSignup";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Which Would You Pick? Watch Polls | Brandon's Brands",
  description: "Vote on watch match-ups from Brandon's Brands: two watches, one pick. See what other collectors chose and share your favorite.",
  alternates: { canonical: "/polls" },
};

export default async function PollsPage() {
  const polls = await loadPolls(30);
  return (
    <div className="mx-auto w-full max-w-4xl px-0 py-4 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Polls</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Which would you pick?</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">Two great watches, one choice. Tap to vote, see what other collectors picked, and share the poll with a friend.</p>
      </section>
      <PollsView initial={polls} />
      <NewsletterSignup source="polls" compact className="mt-10" />
    </div>
  );
}
