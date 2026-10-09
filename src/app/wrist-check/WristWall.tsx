"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { isModerator } from "@/lib/forum";

type Shot = { id: string; user_id: string; display_name: string; image: string; watch: string | null; caption: string | null; featured_at: string | null; created_at: string };

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-400/70";
const PAGE = 24;

// Shrink a phone photo to a small JPEG (about 100–200 KB) before saving.
async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That photo couldn't be opened. Try a JPEG or PNG."));
      i.src = url;
    });
    const max = 1000;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const q of [0.82, 0.7, 0.58]) {
      const data = canvas.toDataURL("image/jpeg", q);
      if (data.length < 650_000) return data;
    }
    throw new Error("That photo is too large. Try a smaller one.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

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
        <section className="mt-6 grid gap-5 overflow-hidden rounded-[2rem] border border-[#D9A43A]/40 bg-[#D9A43A]/5 p-5 sm:grid-cols-[minmax(0,320px)_1fr] sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={featured.image} alt={featured.watch ?? "Wrist Check of the Week"} className="w-full rounded-2xl object-cover" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#D9A43A]">⭐ Wrist Check of the Week</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{featured.watch ?? "This week's pick"}</h2>
            <p className="mt-1 text-sm text-slate-300">Posted by {featured.display_name}</p>
            {featured.caption ? <p className="mt-3 text-sm leading-6 text-slate-300">&ldquo;{featured.caption}&rdquo;</p> : null}
          </div>
        </section>
      ) : null}

      {user ? (
        <form onSubmit={post} className="mt-6 grid gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <p className="font-semibold text-white">Post today&apos;s wrist shot</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <label className="flex h-40 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-slate-950/60 text-sm text-slate-400 sm:w-40">
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
          <p className="text-[11px] text-slate-500">Only post photos you took. Your public name is shown with it. Up to 3 a day.</p>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button type="submit" disabled={!photo || busy} className="justify-self-start rounded-full bg-[#D9A43A] px-5 py-2 text-sm font-semibold text-black disabled:opacity-40">
            {busy ? "Posting…" : "Post wrist shot"}
          </button>
        </form>
      ) : (
        <p className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          <Link href="/login?next=/wrist-check" className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
            create a free account
          </Link>{" "}
          to post your wrist shot.
        </p>
      )}

      {shots.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shots.map((s) => (
            <li key={s.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.watch ?? "Wrist shot"} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-white">{s.watch ?? "Wrist check"}</p>
                <p className="truncate text-xs text-slate-400">
                  {s.display_name} · {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                {s.caption ? <p className="mt-1 line-clamp-2 text-xs text-slate-300">{s.caption}</p> : null}
                {mod || s.user_id === user?.id ? (
                  <div className="mt-2 flex gap-3 text-[11px]">
                    {mod ? (
                      <button type="button" onClick={() => void feature(s)} className="text-[#D9A43A] hover:text-[#e1b54a]">
                        ⭐ Wrist of the Week
                      </button>
                    ) : null}
                    <button type="button" onClick={() => void remove(s)} className="text-slate-500 hover:text-rose-300">
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 px-1 text-sm text-slate-400">No wrist shots yet. Be the first!</p>
      )}
      {more ? (
        <button
          type="button"
          onClick={() => void load(true, shots[shots.length - 1]?.created_at)}
          className="mx-auto mt-5 block rounded-full border border-white/15 px-5 py-2 text-sm text-slate-200 hover:bg-white/10"
        >
          Show more
        </button>
      ) : null}
    </>
  );
}
