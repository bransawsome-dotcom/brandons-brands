// Upcoming watch fairs, shows and meetups run by other organizers. Brandon's Brands only lists them; people get tickets
// and RSVP on each event's own site. Moderators add them.
export type SiteEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  description: string | null;
  link: string | null;
  online: boolean;
  created_at: string;
};

export async function loadEvents(): Promise<SiteEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const since = new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString();
    const res = await fetch(`${url}/rest/v1/events?select=*&starts_at=gte.${since}&order=starts_at.asc&limit=100`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60, tags: ["events"] },
    });
    return res.ok ? ((await res.json()) as SiteEvent[]) : [];
  } catch {
    return [];
  }
}

const ET = "America/New_York";
const etParts = (iso: string) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: ET, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
};

// Events entered without a time (multi-day fairs, events abroad) start at midnight New York time.
export function isAllDay(e: Pick<SiteEvent, "starts_at">): boolean {
  return etParts(e.starts_at).time === "00:00";
}

// First and last calendar day (YYYY-MM-DD, New York time) of an all-day event.
export function eventDays(e: Pick<SiteEvent, "starts_at" | "ends_at">): { first: string; last: string } {
  const first = etParts(e.starts_at).date;
  return { first, last: e.ends_at ? etParts(e.ends_at).date : first };
}

export function eventWhen(e: SiteEvent): string {
  const start = new Date(e.starts_at);
  if (isAllDay(e)) {
    const { first, last } = eventDays(e);
    const fmt = (d: string, year: boolean) =>
      new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}) });
    return first === last ? fmt(first, true) : `${fmt(first, false)} – ${fmt(last, true)}`;
  }
  const day = start.toLocaleDateString("en-US", { timeZone: ET, weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const time = start.toLocaleTimeString("en-US", { timeZone: ET, hour: "numeric", minute: "2-digit" });
  const end = e.ends_at ? new Date(e.ends_at).toLocaleTimeString("en-US", { timeZone: ET, hour: "numeric", minute: "2-digit" }) : "";
  return `${day} · ${time}${end ? `–${end}` : ""} ET`;
}

// Upcoming (including ones that started in the last 6 hours) and past events, newest past first.
export function splitEvents(events: SiteEvent[]): { upcoming: SiteEvent[]; past: SiteEvent[] } {
  const cutoff = Date.now() - 6 * 3600 * 1000;
  const upcoming = events.filter((e) => new Date(e.ends_at ?? e.starts_at).getTime() >= cutoff);
  const past = events.filter((e) => !upcoming.includes(e)).reverse();
  return { upcoming, past };
}

// How far back the events list goes (recent events stay visible for a while).
export function eventsSinceIso(): string {
  return new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString();
}
