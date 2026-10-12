import Link from "next/link";
import { SALES_DISCLAIMER } from "@/lib/legal";

// The forum's ground rules for buying and selling: a short disclaimer plus four safety tips.
const tips = [
  { n: "01", title: "Check the member", text: "Look at their profile, post history and collection before you deal." },
  { n: "02", title: "Ask for proof", text: "Request recent photos with a dated note, the serial and box and papers." },
  { n: "03", title: "Pay with protection", text: "Use a protected payment method or escrow. Never send money as a gift." },
  { n: "04", title: "Report anything off", text: "If something feels wrong, stop and report it. Moderators will take a look." },
];

export default function ForumSafety({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="forum-safety" className={`rounded-md border border-hairline bg-raised ${className}`}>
      <div className="border-b border-hairline px-5 py-4 sm:px-6">
        <h2 id="forum-safety" className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
          Buying &amp; selling safely
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/80">
          {SALES_DISCLAIMER}{" "}
          <Link href="/terms" className="font-semibold text-gold underline-offset-2 hover:underline">
            Terms &amp; Disclaimers
          </Link>
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-px bg-hairline lg:grid-cols-4">
        {tips.map((t) => (
          <li key={t.n} className="bg-raised p-4 sm:p-5">
            <span className="font-display text-sm font-semibold text-gold">{t.n}</span>
            <h3 className="mt-1 font-display text-lg font-semibold uppercase leading-tight text-ink">{t.title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-muted sm:text-sm sm:leading-6">{t.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
