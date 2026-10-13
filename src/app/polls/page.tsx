import type { Metadata } from "next";
import Link from "next/link";
import { loadPollResults, loadPolls } from "@/lib/polls";
import PollsView from "@/app/polls/PollsView";
import NewsletterSignup from "@/components/NewsletterSignup";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

const DESCRIPTION =
  "Weekly watch polls from Brandon's Brands: two watches, one pick. Vote on luxury and microbrand match-ups, see what other collectors chose, and browse past poll results.";

export const metadata: Metadata = {
  title: "Watch Polls: Which Would You Pick? | Brandon's Brands",
  description: DESCRIPTION,
  alternates: { canonical: "/polls" },
  openGraph: { type: "website", url: "/polls", title: "Watch Polls | Brandon's Brands", description: DESCRIPTION, images: ["/og-image.png?v=3"] },
};

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

export default async function PollsPage() {
  const polls = await loadPolls(30);
  // Finished polls: show the result as plain text so each match-up is a small, searchable record.
  const past = polls.filter((p) => !p.active).slice(0, 12);
  const results = await Promise.all(past.map((p) => loadPollResults(p.id)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Watch Polls",
    description: DESCRIPTION,
    url: `${SITE_URL}/polls`,
    isPartOf: { "@type": "WebSite", name: "Brandon's Brands", url: SITE_URL },
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-0 py-4 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="px-4 sm:px-0">
        <span aria-hidden className="block h-px w-10 bg-gold" />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">Weekly polls</p>
        <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] text-ink sm:text-6xl">
          Which would you <span className="font-light text-gold">pick?</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-ink/80 sm:text-lg">
          Every week Brandon puts two watches head to head: a luxury icon against a microbrand challenger, two dial colors, two takes on the
          same complication. Tap to vote, see what other collectors chose, and share the poll with a friend. Results from past polls are
          kept below, so you can see how the community&apos;s taste has shifted over time.
        </p>
      </header>

      <PollsView initial={polls} />

      {past.length ? (
        <section aria-labelledby="past-polls" className="mt-14 px-4 sm:px-0">
          <h2 id="past-polls" className="font-display text-3xl font-semibold uppercase text-ink sm:text-4xl">
            Past results
          </h2>
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {past.map((p, i) => {
              const r = results[i];
              const total = r ? r.a + r.b : 0;
              return (
                <li key={p.id} className="py-5">
                  <h3 className="font-serif text-2xl text-ink">{p.question || `${p.a_label} or ${p.b_label}?`}</h3>
                  <p className="mt-1 text-sm text-ink/80">
                    {p.a_label} vs {p.b_label}
                    {total ? ` · ${p.a_label} ${pct(r!.a, total)}%, ${p.b_label} ${pct(r!.b, total)}% (${total} vote${total === 1 ? "" : "s"})` : ""}
                    {" · "}
                    {new Date(p.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 px-4 text-sm text-muted sm:px-0">
        Want more? Join the conversation in <Link href="/forum" className="text-gold hover:underline">The Salon</Link> or post your watch in{" "}
        <Link href="/wrist-check" className="text-gold hover:underline">Wrist Check</Link>.
      </p>
      <NewsletterSignup source="polls" compact className="mt-10" />
    </div>
  );
}
