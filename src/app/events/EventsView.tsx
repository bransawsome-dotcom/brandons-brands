"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { isModerator } from "@/lib/forum";
import { eventWhen, splitEvents, type SiteEvent } from "@/lib/events";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-400/70";

// Upcoming and past events with RSVP, plus an "Add event" form for moderators.
export default function EventsView({ initial }: { initial: SiteEvent[] }) {
  const { user } = useAuth();
  const [events, setEvents] = useState(initial);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [mod, setMod] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", start: "18:00", end: "20:00", location: "", description: "", link: "", online: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void isModerator(user?.id).then(setMod);
  }, [user?.id]);

  useEffect(() => {
    if (!supabase) return;
    let live = true;
    void supabase.rpc("event_rsvp_counts").then(({ data }) => {
      if (live && data) setCounts(Object.fromEntries((data as { event_id: string; going: number }[]).map((r) => [r.event_id, Number(r.going)])));
    });
    if (user) {
      void supabase
        .from("event_rsvps")
        .select("event_id")
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (live && data) setMine(new Set(data.map((r: { event_id: string }) => r.event_id)));
        });
    }
    return () => {
      live = false;
    };
  }, [user]);

  const reload = async () => {
    if (!supabase) return;
    const since = new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString();
    const { data } = await supabase.from("events").select("*").gte("starts_at", since).order("starts_at");
    if (data) setEvents(data as SiteEvent[]);
  };

  const rsvp = async (e: SiteEvent) => {
    if (!supabase || !user) return;
    const going = mine.has(e.id);
    const next = new Set(mine);
    if (going) {
      await supabase.from("event_rsvps").delete().eq("event_id", e.id).eq("user_id", user.id);
      next.delete(e.id);
    } else {
      await supabase.from("event_rsvps").insert({ event_id: e.id, user_id: user.id });
      next.add(e.id);
    }
    setMine(next);
    setCounts((c) => ({ ...c, [e.id]: Math.max(0, (c[e.id] ?? 0) + (going ? -1 : 1)) }));
  };

  const add = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!supabase) return;
    setError(null);
    if (form.link && !/^https:\/\//.test(form.link.trim())) return setError("The link must start with https://");
    // Times are entered in New York time.
    const toIso = (d: string, t: string) => {
      const guess = new Date(`${d}T${t}:00Z`);
      const ny = new Date(guess.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const utc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
      return new Date(guess.getTime() + (utc.getTime() - ny.getTime())).toISOString();
    };
    const { error: err } = await supabase.from("events").insert({
      title: form.title.trim(),
      starts_at: toIso(form.date, form.start),
      ends_at: form.end ? toIso(form.date, form.end) : null,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      link: form.link.trim() || null,
      online: form.online,
      created_by: user?.id ?? null,
    });
    if (err) return setError(err.message);
    setForm({ title: "", date: "", start: "18:00", end: "20:00", location: "", description: "", link: "", online: false });
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
        {!isPast ? (
          user ? (
            <button
              type="button"
              onClick={() => void rsvp(e)}
              className={`rounded-full px-4 py-2 font-semibold ${mine.has(e.id) ? "border border-emerald-400/50 bg-emerald-500/15 text-emerald-200" : "bg-[#D9A43A] text-black hover:bg-[#e1b54a]"}`}
            >
              {mine.has(e.id) ? "✓ You're going (tap to cancel)" : "I'm going"}
            </button>
          ) : (
            <Link href={`/login?next=${encodeURIComponent(`/events#${e.id}`)}`} className="rounded-full bg-[#D9A43A] px-4 py-2 font-semibold text-black hover:bg-[#e1b54a]">
              Log in to RSVP
            </Link>
          )
        ) : null}
        {counts[e.id] ? <span className="text-slate-400">{counts[e.id]} going</span> : null}
        {!isPast ? (
          <a href={`/events/${e.id}/ics`} className="rounded-full border border-white/15 px-3 py-1.5 text-slate-200 hover:bg-white/10">
            📅 Add to calendar
          </a>
        ) : null}
        {e.link ? (
          <a href={e.link} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-1.5 text-blue-200 hover:bg-white/10">
            Details ↗
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
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} className={input} placeholder="Title, e.g. The Watch Collective of NJ: October meetup" />
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className={input} aria-label="Date" />
            <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required className={input} aria-label="Start time (ET)" />
            <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className={input} aria-label="End time (ET)" />
          </div>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={160} className={input} placeholder="Place, e.g. The Timepiece Collection, Englewood NJ" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} rows={3} className={input} placeholder="What to expect (optional)" />
          <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={input} placeholder="Link for tickets or the stream (optional, https://…)" />
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
          No events scheduled yet. Sign up for the newsletter below and we&apos;ll let you know about the next meetup.
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
