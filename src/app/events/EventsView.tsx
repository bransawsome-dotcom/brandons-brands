"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { isModerator } from "@/lib/forum";
import { eventsSinceIso, eventWhen, splitEvents, type SiteEvent } from "@/lib/events";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-400/70";

// Upcoming and recent watch events run by other organizers (tickets and RSVPs are on each event's own site),
// plus an "Add event" form for moderators.
export default function EventsView({ initial }: { initial: SiteEvent[] }) {
  const { user } = useAuth();
  const [events, setEvents] = useState(initial);
  const [mod, setMod] = useState(false);
  const blank = { title: "", date: "", endDate: "", allDay: true, start: "18:00", end: "20:00", location: "", description: "", link: "", online: false };
  const [form, setForm] = useState(blank);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void isModerator(user?.id).then(setMod);
  }, [user?.id]);

  const reload = async () => {
    if (!supabase) return;
    const since = eventsSinceIso();
    const { data } = await supabase.from("events").select("*").gte("starts_at", since).order("starts_at");
    if (data) setEvents(data as SiteEvent[]);
  };

  const add = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!supabase) return;
    setError(null);
    if (!/^https:\/\//.test(form.link.trim())) return setError("Add the event's own website (starting with https://) so people can get tickets or RSVP there.");
    if (form.allDay && form.endDate && form.endDate < form.date) return setError("The last day can't be before the first day.");
    // Times are entered in New York time.
    const toIso = (d: string, t: string) => {
      const guess = new Date(`${d}T${t}:00Z`);
      const ny = new Date(guess.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const utc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
      return new Date(guess.getTime() + (utc.getTime() - ny.getTime())).toISOString();
    };
    const { error: err } = await supabase.from("events").insert({
      title: form.title.trim(),
      // All-day events start at midnight New York time and end at 23:59 on the last day.
      starts_at: form.allDay ? toIso(form.date, "00:00") : toIso(form.date, form.start),
      ends_at: form.allDay ? toIso(form.endDate || form.date, "23:59") : form.end ? toIso(form.date, form.end) : null,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      link: form.link.trim() || null,
      online: form.online,
      created_by: user?.id ?? null,
    });
    if (err) return setError(err.message);
    setForm(blank);
    await reload();
  };

  const remove = async (e: SiteEvent) => {
    if (!supabase || !window.confirm(`Delete "${e.title}"?`)) return;
    await supabase.from("events").delete().eq("id", e.id);
    await reload();
  };

  const { upcoming, past } = splitEvents(events);

  const card = (e: SiteEvent, isPast: boolean) => (
    <li key={e.id} id={e.id} className="scroll-mt-24 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#D9A43A]">{eventWhen(e)}</p>
      <h2 className="mt-1 text-xl font-semibold text-white">{e.title}</h2>
      <p className="mt-1 text-sm text-slate-300">{e.online ? "Online" : e.location ?? "New Jersey"}</p>
      {e.description ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">{e.description}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {e.link ? (
          <a
            href={e.link}
            target="_blank"
            rel="noopener noreferrer"
            className={isPast ? "rounded-full border border-white/15 px-3 py-1.5 text-blue-200 hover:bg-white/10" : "rounded-full bg-[#D9A43A] px-4 py-2 font-semibold text-black hover:bg-[#e1b54a]"}
          >
            {isPast ? "Event site ↗" : "Details & RSVP on the event site ↗"}
          </a>
        ) : null}
        {!isPast ? (
          <a href={`/events/${e.id}/ics`} className="rounded-full border border-white/15 px-3 py-1.5 text-slate-200 hover:bg-white/10">
            📅 Add to calendar
          </a>
        ) : null}
        {mod ? (
          <button type="button" onClick={() => void remove(e)} className="ml-auto text-xs text-slate-500 hover:text-rose-300">
            Delete
          </button>
        ) : null}
      </div>
    </li>
  );

  return (
    <>
      {mod ? (
        <form onSubmit={add} className="mt-6 grid gap-3 rounded-[2rem] border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-5">
          <p className="text-sm font-semibold text-[#D9A43A]">Add an event (only moderators see this)</p>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} className={input} placeholder="Title, e.g. Windup Watch Fair NYC" />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} className="h-4 w-4" /> All day or several days (no set time)
          </label>
          {form.allDay ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className={input} aria-label="First day" />
              <input type="date" value={form.endDate} min={form.date} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={input} aria-label="Last day (optional)" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className={input} aria-label="Date" />
              <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required className={input} aria-label="Start time (ET)" />
              <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className={input} aria-label="End time (ET)" />
            </div>
          )}
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={160} className={input} placeholder="Place, e.g. Center415, 415 Fifth Ave, New York, NY" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} rows={3} className={input} placeholder="What to expect (optional)" />
          <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={input} required placeholder="Event's own website for tickets or RSVP (https://…)" />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.online} onChange={(e) => setForm({ ...form, online: e.target.checked })} className="h-4 w-4" /> Online event
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button type="submit" className="justify-self-start rounded-full bg-[#D9A43A] px-5 py-2 text-sm font-semibold text-black">
            Add event
          </button>
        </form>
      ) : null}
      <h2 className="mt-8 px-1 text-lg font-semibold text-white">Upcoming</h2>
      {upcoming.length ? (
        <ul className="mt-3 grid gap-4">{upcoming.map((e) => card(e, false))}</ul>
      ) : (
        <p className="mt-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          No upcoming events listed right now. Sign up for the newsletter below to hear about the next watch fair.
        </p>
      )}
      {past.length ? (
        <>
          <h2 className="mt-8 px-1 text-lg font-semibold text-white">Recent</h2>
          <ul className="mt-3 grid gap-4 opacity-80">{past.map((e) => card(e, true))}</ul>
        </>
      ) : null}
    </>
  );
}
