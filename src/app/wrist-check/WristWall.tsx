"use client";

import { shrinkPhoto } from "@/lib/photos";
import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { isModerator } from "@/lib/forum";

type Shot = { id: string; user_id: string; display_name: string; image: string; watch: string | null; caption: string | null; featured_at: string | null; created_at: string };

const input =
  "w-full rounded border border-hairline bg-raised px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold/70";
const PAGE = 24;

const shrink = (file: File) => shrinkPhoto(file, 1000);

export default function WristWall() {
  const { user } = useAuth();
  const [shots, setShots] = useState<Shot[]>([]);
  const [featured, setFeatured] = useState<Shot | null>(null);
  const [more, setMore] = useState(false);
  const [mod, setMod] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [watch, setWatch] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void isModerator(user?.id).then(setMod);
  }, [user?.id]);

  const load = useCallback(async (append = false, before?: string) => {
    if (!supabase) return;
    let q = supabase.from("wrist_shots").select("*").order("created_at", { ascending: false }).limit(PAGE + 1);
    if (before) q = q.lt("created_at", before);
    const { data } = await q;
    const rows = (data ?? []) as Shot[];
    setMore(rows.length > PAGE);
    setShots((cur) => (append ? [...cur, ...rows.slice(0, PAGE)] : rows.slice(0, PAGE)));
    if (!append) {
      const since = new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString();
      const { data: f } = await supabase.from("wrist_shots").select("*").gte("featured_at", since).order("featured_at", { ascending: false }).limit(1);
      setFeatured(((f ?? []) as Shot[])[0] ?? null);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      setPhoto(await shrink(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't use that photo.");
    }
  };

  const post = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !photo) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase
      .from("wrist_shots")
      .insert({ user_id: user.id, image: photo, watch: watch.trim() || null, caption: caption.trim() || null });
    setBusy(false);
    if (err) return setError(err.message.includes("3 wrist shots") ? "You can post up to 3 wrist shots a day." : err.message);
    setPhoto(null);
    setWatch("");
    setCaption("");
    await load();
  };

  const feature = async (s: Shot) => {
    if (!supabase) return;
    await supabase.from("wrist_shots").update({ featured_at: new Date().toISOString() }).eq("id", s.id);
    await load();
  };
  const remove = async (s: Shot) => {
    if (!supabase || !window.confirm("Remove this wrist shot?")) return;
    await supabase.from("wrist_shots").delete().eq("id", s.id);
    await load();
  };

  return (
    <>
      {featured ? (
        <section className="mt-6 grid gap-5 overflow-hidden rounded-md border border-gold/40 bg-gold/5 p-5 sm:grid-cols-[minmax(0,320px)_1fr] sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={featured.image} alt={featured.watch ?? "Wrist Check of the Week"} className="w-full rounded object-cover" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">⭐ Wrist Check of the Week</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{featured.watch ?? "This week's pick"}</h2>
            <p className="mt-1 text-sm text-ink/80">Posted by {featured.display_name}</p>
            {featured.caption ? <p className="mt-3 text-sm leading-6 text-ink/80">&ldquo;{featured.caption}&rdquo;</p> : null}
          </div>
        </section>
      ) : null}

      {user ? (
        <form onSubmit={post} className="mt-6 grid gap-3 rounded-md border border-hairline bg-surface p-5">
          <p className="font-semibold text-ink">Post today&apos;s wrist shot</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <label className="flex h-40 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border border-dashed border-hairline-strong bg-raised text-sm text-muted sm:w-40">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Your wrist shot" className="h-full w-full object-cover" />
              ) : (
                <span>📸 Choose photo</span>
              )}
              <input type="file" accept="image/*" onChange={(e) => void pick(e)} className="hidden" />
            </label>
            <div className="grid flex-1 gap-2">
              <input value={watch} onChange={(e) => setWatch(e.target.value)} maxLength={100} className={input} placeholder="What's the watch? e.g. Tudor Black Bay 58" />
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={280} rows={3} className={input} placeholder="Say something about it (optional)" />
            </div>
          </div>
          <p className="text-[11px] text-muted">Only post photos you took. Your public name is shown with it. Up to 3 a day.</p>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button type="submit" disabled={!photo || busy} className="justify-self-start rounded-full bg-navy px-5 py-2 text-sm font-semibold text-on-navy disabled:opacity-40">
            {busy ? "Posting…" : "Post wrist shot"}
          </button>
        </form>
      ) : (
        <p className="mt-6 rounded-md border border-hairline bg-surface p-5 text-sm text-ink/80">
          <Link href="/login?next=/wrist-check" className="font-semibold text-gold hover:text-gold-bright">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-semibold text-gold hover:text-gold-bright">
            create a free account
          </Link>{" "}
          to post your wrist shot.
        </p>
      )}

      {shots.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shots.map((s) => (
            <li key={s.id} className="overflow-hidden rounded border border-hairline bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.watch ?? "Wrist shot"} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-ink">{s.watch ?? "Wrist check"}</p>
                <p className="truncate text-xs text-muted">
                  {s.display_name} · {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                {s.caption ? <p className="mt-1 line-clamp-2 text-xs text-ink/80">{s.caption}</p> : null}
                {mod || s.user_id === user?.id ? (
                  <div className="mt-2 flex gap-3 text-[11px]">
                    {mod ? (
                      <button type="button" onClick={() => void feature(s)} className="text-gold hover:text-gold-bright">
                        ⭐ Wrist of the Week
                      </button>
                    ) : null}
                    <button type="button" onClick={() => void remove(s)} className="text-muted hover:text-rose-700">
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 px-1 text-sm text-muted">No wrist shots yet. Be the first!</p>
      )}
      {more ? (
        <button
          type="button"
          onClick={() => void load(true, shots[shots.length - 1]?.created_at)}
          className="mx-auto mt-5 block rounded-full border border-hairline px-5 py-2 text-sm text-ink hover:bg-surface"
        >
          Show more
        </button>
      ) : null}
    </>
  );
}
