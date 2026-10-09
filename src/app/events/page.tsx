import type { Metadata } from "next";
import Link from "next/link";
import { loadEvents, splitEvents } from "@/lib/events";
import EventsView from "@/app/events/EventsView";
import NewsletterSignup from "@/components/NewsletterSignup";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Upcoming Watch Fairs & Microbrand Events | Brandon's Brands",
  description:
    "Upcoming microbrand watch fairs, watch shows and collector meetups in New York, New Jersey and around the world, with dates, venues and links to each event's own site.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const events = await loadEvents();
  const { upcoming } = splitEvents(events);
  const jsonLd = upcoming.slice(0, 10).map((e) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: e.starts_at,
    ...(e.ends_at ? { endDate: e.ends_at } : {}),
    eventAttendanceMode: e.online ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: e.online
      ? { "@type": "VirtualLocation", url: e.link ?? `${SITE_URL}/events` }
      : { "@type": "Place", name: e.location ?? "New Jersey", address: e.location ?? "New Jersey" },
    description: e.description ?? e.title,
    url: e.link ?? `${SITE_URL}/events#${e.id}`,
  }));
  return (
    <div className="mx-auto w-full max-w-4xl px-0 py-4 sm:px-6 sm:py-10">
      {jsonLd.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /> : null}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Events</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Upcoming watch events</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Microbrand watch fairs, watch shows and collector meetups worth knowing about, near New Jersey and around the world. These events are run by
          their own organizers, not by Brandon&apos;s Brands: get tickets and RSVP on each event&apos;s own site. Going? Tell other collectors in the{" "}
          <Link href="/forum?subject=clubs" className="text-[#D9A43A] hover:text-[#e1b54a]">
            Watch Clubs & Meetups forum
          </Link>
          .
        </p>
      </section>
      <EventsView initial={events} />
      <NewsletterSignup source="events" compact className="mt-10" />
    </div>
  );
}
