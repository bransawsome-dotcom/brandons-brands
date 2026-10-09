import { SITE_URL } from "@/lib/site";
import { eventDays, isAllDay } from "@/lib/events";

// "Add to calendar" file for one event (works with Apple, Google and Outlook calendars).
export const revalidate = 300;

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const fold = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(`${url}/rest/v1/events?id=eq.${id}&select=*`, { headers: { apikey: key ?? "", Authorization: `Bearer ${key}` } }).catch(() => null);
  const e = ((await res?.json().catch(() => [])) as { id: string; title: string; starts_at: string; ends_at: string | null; location: string | null; description: string | null; link: string | null }[])?.[0];
  if (!e) return new Response("Not found", { status: 404 });
  const end = e.ends_at ?? new Date(new Date(e.starts_at).getTime() + 2 * 3600 * 1000).toISOString();
  const allDay = isAllDay(e);
  const { first, last } = eventDays(e);
  const dayAfter = new Date(Date.parse(`${last}T12:00:00Z`) + 24 * 3600 * 1000).toISOString().slice(0, 10);
  const pageUrl = e.link ?? `${SITE_URL}/events#${e.id}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Brandon's Brands//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@brandonsbrands17.com`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    allDay ? `DTSTART;VALUE=DATE:${first.replace(/-/g, "")}` : `DTSTART:${stamp(e.starts_at)}`,
    allDay ? `DTEND;VALUE=DATE:${dayAfter.replace(/-/g, "")}` : `DTEND:${stamp(end)}`,
    `SUMMARY:${fold(e.title)}`,
    e.location ? `LOCATION:${fold(e.location)}` : "",
    `DESCRIPTION:${fold(`${e.description ?? ""}\n\nTickets and details: ${pageUrl}`)}`,
    `URL:${pageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="brandons-brands-event.ics"` } });
}
