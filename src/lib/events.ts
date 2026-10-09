// Meetups and events (The Watch Collective of NJ, fairs, virtual events). Moderators add them; members RSVP.
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

export function eventWhen(e: SiteEvent): string {
  const start = new Date(e.starts_at);
  const day = start.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const time = start.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
  const end = e.ends_at ? new Date(e.ends_at).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }) : "";
  return `${day} · ${time}${end ? `–${end}` : ""} ET`;
}

// Upcoming (including ones that started in the last 6 hours) and past events, newest past first.
export function splitEvents(events: SiteEvent[]): { upcoming: SiteEvent[]; past: SiteEvent[] } {
  const cutoff = Date.now() - 6 * 3600 * 1000;
  const upcoming = events.filter((e) => new Date(e.ends_at ?? e.starts_at).getTime() >= cutoff);
  const past = events.filter((e) => !upcoming.includes(e)).reverse();
  return { upcoming, past };
}
