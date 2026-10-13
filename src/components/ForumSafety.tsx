// The forum's ground rules for buying and selling: the disclaimer plus four safety tips.
export const FORUM_DISCLAIMER =
  "Brandon's Brands does not take part in or guarantee sales, trades or payments between members. We don't hold funds, verify watches, or verify sellers or buyers.";

const tips = [
  { title: "Check the member", text: "Look at when they joined and how long they've been part of the community." },
  { title: "Ask for proof", text: "Request a photo with today's date and the seller's name, plus serial and papers where they exist." },
  { title: "Pay with protection", text: "Use a payment method with buyer protection or a third-party escrow service." },
  { title: "Report anything off", text: 'Every listing has a "Report listing" button. Moderators review each report.' },
];

export default function ForumSafety({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="forum-safety" className={className}>
      <h2 id="forum-safety" className="sr-only">
        Buying and selling safely
      </h2>
      <p role="note" className="border border-hairline-strong bg-raised px-5 py-4 text-sm leading-6 text-ink/80 sm:px-6">
        {FORUM_DISCLAIMER}
      </p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tips.map((t) => (
          <li key={t.title} className="rounded-md border p-5 shadow-card bb-sheen sm:p-6">
            <h3 className="font-display text-lg font-semibold uppercase leading-tight text-ink">{t.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/75">{t.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
