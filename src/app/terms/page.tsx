import type { Metadata } from "next";
import Link from "next/link";
import { EMAIL_SHARE_CONSENT, SALES_DISCLAIMER, TERMS_UPDATED } from "@/lib/legal";
import { collabEmail } from "@/lib/socials";

export const metadata: Metadata = {
  title: "Terms & Disclaimers | Brandon's Brands",
  description:
    "Terms of use and disclaimers for Brandon's Brands: sales between members, offers, email sharing, forum content and watch information.",
  alternates: { canonical: "/terms" },
};

const updated = new Date(`${TERMS_UPDATED}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Sales between members",
    paragraphs: [
      SALES_DISCLAIMER,
      "Offers, messages, forum posts in For Sale and Seeking to Buy, and public collections and wishlists are ways for people to connect. Any sale, trade or payment that follows is solely between the people involved. Brandon's Brands does not handle money, provide escrow, ship watches, authenticate watches or settle disputes, and is not liable for any loss, fraud, counterfeit, damage or non-payment.",
      "Deal at your own risk. Verify the watch and the other person, ask for photos and serial details, use a secure payment method or a trusted escrow or authentication service, and never send money by gift card, wire or crypto to someone you haven't verified.",
    ],
  },
  {
    heading: "Your email address",
    paragraphs: [
      EMAIL_SHARE_CONSENT,
      "Your email is never shown on your public collection, wishlist or forum posts. It is shared only when you send an offer (the owner sees it so they can reply) or when you reply to an offer email (the person who made the offer sees your reply address). Messages sent through the site Inbox don't show your email.",
      "We use your email to run your account and to send notifications you can turn off on your Account page. We don't sell your email address.",
    ],
  },
  {
    heading: "Watch information and values",
    paragraphs: [
      "Estimated values, prices, reviews, guides and favorites on this site are for information only and may be out of date or wrong. They are not appraisals, financial advice or a guarantee of what a watch is worth.",
    ],
  },
  {
    heading: "Forum, messages and member content",
    paragraphs: [
      "You are responsible for what you post and send. Don't post anything illegal, misleading, abusive or that you don't have the right to share. We may remove content or accounts at our discretion. Report anything inappropriate to the email below.",
    ],
  },
  {
    heading: "Accounts",
    paragraphs: [
      "Keep your password private. You can make your collection and wishlist public or private at any time. By creating an account you agree to these Terms & Disclaimers.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-0 py-4 sm:px-6 sm:py-10">
      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">Terms & Disclaimers</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated {updated}</p>
        {SECTIONS.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-xl font-semibold text-white">{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="mt-3 text-sm leading-7 text-slate-300">
                {p}
              </p>
            ))}
          </section>
        ))}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Questions or reports:{" "}
            <a href={`mailto:${collabEmail}`} className="text-[#D9A43A] hover:text-[#e1b54a]">
              {collabEmail}
            </a>
            . See also{" "}
            <Link href="/about" className="text-blue-300 hover:text-blue-200">
              About us
            </Link>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
