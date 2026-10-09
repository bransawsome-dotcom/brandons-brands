"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { FAVORITES_SUBJECT, isModerator, loadFolderOwners } from "@/lib/forum";
import { loadCollectionData } from "@/lib/storage";
import type { Watch } from "@/lib/localData";
import { isAllowedLink, linkInfo, type Favorite } from "@/lib/favorites";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

type Draft = { id?: string; watch_id: string | null; brand: string; model: string; reference_number: string; image_url: string; link_url: string; note: string; features: string };
const EMPTY: Draft = { watch_id: null, brand: "", model: "", reference_number: "", image_url: "", link_url: "", note: "", features: "" };

function db() {
  if (!supabase) throw new Error("Favorites aren't available right now.");
  return supabase;
}

function friendly(message: string): string {
  if (/brand_favorites/.test(message) && /(does not exist|Could not find)/i.test(message)) return "Favorites are being set up. Please try again soon.";
  if (/row-level security/i.test(message)) return "Only Brandon can change the favorites.";
  if (/image_url/.test(message)) return "The photo must be a web address starting with https://";
  if (/link_url/.test(message)) return "The link must start with https:// (or /blog/… for a review on this site).";
  return message;
}

export default function FavoritesView({ initial }: { initial: Favorite[] }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Favorite[]>(initial);
  const [moderator, setModerator] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState<string | null>(null);

  // Same as the Friday job: Claude reviews Brandon's latest videos and adds one new favorite.
  const pickNow = async () => {
    setError(null);
    setPicking("Claude is reviewing Brandon's latest videos… this takes 1–3 minutes.");
    const { data } = await db().auth.getSession();
    const res = await fetch("/api/favorites-weekly", {
      method: "POST",
      headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    }).catch(() => null);
    const out = (await res?.json().catch(() => ({}))) as { added?: boolean; brand?: string; model?: string; reason?: string; error?: string } | undefined;
    if (!res?.ok) {
      setPicking(null);
      return setError(out?.error ?? "Couldn't add a favorite. Please try again.");
    }
    setPicking(out?.added ? `Added ${out.brand} ${out.model}, with a forum discussion.` : out?.reason ?? "No new watch found.");
    await reload();
  };

  useEffect(() => {
    let live = true;
    // Moderators and Brandon (owner of the Brandon's Favorites folder) can edit the gallery.
    void Promise.all([isModerator(user?.id), loadFolderOwners()]).then(([m, owners]) => {
      if (live) setModerator(m || Boolean(user?.id && owners?.[FAVORITES_SUBJECT]?.includes(user.id)));
    });
    return () => {
      live = false;
    };
  }, [user?.id]);

  const reload = async () => {
    const { data } = await db().from("brand_favorites").select("*").order("sort").order("created_at");
    if (data) setItems(data as Favorite[]);
  };

  // The page itself is cached for up to a minute; fetch the latest list as soon as it opens.
  useEffect(() => {
    if (!supabase) return;
    let live = true;
    supabase
      .from("brand_favorites")
      .select("*")
      .order("sort")
      .order("created_at")
      .then(({ data }) => {
        if (live && data) setItems(data as Favorite[]);
      });
    return () => {
      live = false;
    };
  }, []);

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    setError(null);
    // Save the new order.
    const results = await Promise.all(next.map((f, i) => db().from("brand_favorites").update({ sort: i }).eq("id", f.id)));
    const failed = results.find((r) => r.error);
    if (failed?.error) setError(friendly(failed.error.message));
  };

  const remove = async (f: Favorite) => {
    if (!window.confirm(`Remove ${f.brand} ${f.model} from Brandon's Favorites?`)) return;
    const { error: err } = await db().from("brand_favorites").delete().eq("id", f.id);
    if (err) setError(friendly(err.message));
    else setItems((cur) => cur.filter((x) => x.id !== f.id));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const link = editing.link_url.trim();
    const image = editing.image_url.trim();
    if (link && !isAllowedLink(link)) return setError("The link must start with https:// (or /blog/… for a review on this site).");
    if (image && !/^https:\/\//i.test(image)) return setError("The photo must be a web address starting with https://");
    setBusy(true);
    setError(null);
    const row = {
      watch_id: editing.watch_id,
      brand: editing.brand.trim(),
      model: editing.model.trim(),
      reference_number: editing.reference_number.trim() || null,
      image_url: image || null,
      link_url: link || null,
      note: editing.note.trim() || null,
      features: editing.features.trim() || null,
    };
    const res = editing.id
      ? await db().from("brand_favorites").update(row).eq("id", editing.id)
      : await db().from("brand_favorites").insert({ ...row, sort: items.length });
    setBusy(false);
    if (res.error) return setError(friendly(res.error.message));
    setEditing(null);
    await reload();
  };

  return (
    <>
      {moderator ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#D9A43A]/30 bg-[#D9A43A]/5 px-4 py-3 text-sm">
          <span className="text-[#D9A43A]">Only you see this · editing the gallery</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setEditing({ ...EMPTY });
            }}
            className="rounded-full bg-[#D9A43A] px-4 py-2 font-semibold text-black hover:bg-[#e1b54a]"
          >
            + Add a favorite
          </button>
          <button
            type="button"
            onClick={() => void pickNow()}
            disabled={Boolean(picking?.endsWith("minutes."))}
            className="rounded-full border border-[#D9A43A]/50 px-4 py-2 font-semibold text-[#D9A43A] hover:bg-[#D9A43A]/10 disabled:opacity-50"
          >
            ⭐ Pick this week&apos;s favorite now
          </button>
          <Link href={`/forum?subject=${FAVORITES_SUBJECT}`} className="text-blue-200 hover:text-white">
            Post about one in the forum →
          </Link>
          <span className="w-full text-xs text-slate-400">
            Every Friday morning Claude reviews Brandon&apos;s latest videos and adds one new watch here (and in the forum folder) automatically.
          </span>
          {picking ? <span className={`w-full ${picking.endsWith("minutes.") ? "animate-pulse text-blue-200" : "text-emerald-300"}`}>{picking}</span> : null}
          {error && !editing ? <span className="w-full text-rose-300">{error}</span> : null}
        </div>
      ) : null}

      {!items.length ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-12 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">Brandon&apos;s favorites are coming soon</p>
          <p className="mt-2 text-sm">
            Follow along on social media, or join the conversation in the{" "}
            <Link href={`/forum?subject=${FAVORITES_SUBJECT}`} className="text-[#D9A43A] hover:text-[#e1b54a]">
              Brandon&apos;s Favorites forum
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {items.map((f, i) => {
            const info = linkInfo(f.link_url);
            const photo = f.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.image_url} alt={`${f.brand} ${f.model}`} referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain" />
            ) : (
              <span className="text-5xl" aria-hidden>
                ⌚
              </span>
            );
            return (
              <li key={f.id} className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.28)]">
                {info && f.link_url ? (
                  <a
                    href={f.link_url}
                    {...(info.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`group relative flex h-60 items-center justify-center p-4 ${f.image_url ? "bg-white" : "bg-slate-950/80"}`}
                    aria-label={`${info.label}: ${f.brand} ${f.model}`}
                  >
                    {photo}
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white opacity-90 transition group-hover:bg-[#0E5A8F]">
                      {info.icon} {info.label}
                    </span>
                  </a>
                ) : (
                  <div className={`flex h-60 items-center justify-center p-4 ${f.image_url ? "bg-white" : "bg-slate-950/80"}`}>{photo}</div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-blue-300">{f.brand}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{f.model}</h2>
                  {f.reference_number ? <p className="text-sm text-slate-400">Ref. {f.reference_number}</p> : null}
                  {f.note ? <p className="mt-3 text-sm leading-6 text-slate-300">{f.note}</p> : null}
                  {f.features ? (
                    <details className="group mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                      <summary className="cursor-pointer list-none font-semibold text-blue-200 marker:hidden">
                        <span className="group-open:hidden">What I love about it ▾</span>
                        <span className="hidden group-open:inline">What I love about it ▴</span>
                      </summary>
                      <p className="mt-2 whitespace-pre-line leading-6 text-slate-300">{f.features.replace(/^What I love about it:\s*/i, "")}</p>
                    </details>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
                    {info && f.link_url ? (
                      <a
                        href={f.link_url}
                        {...(info.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="inline-flex rounded-full border border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] px-4 py-2 text-sm font-semibold text-white hover:from-[#2290D6] hover:to-[#136AA6]"
                      >
                        {info.label} {info.external ? "↗" : "→"}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500">Review coming soon</span>
                    )}
                    <Link href={f.post_id ? `/forum/${f.post_id}` : `/forum?subject=${FAVORITES_SUBJECT}`} className="text-sm text-[#D9A43A] hover:text-[#e1b54a]">
                      Discuss →
                    </Link>
                  </div>
                  {moderator ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3 text-xs">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full border border-white/15 px-3 py-1 text-slate-200 disabled:opacity-30">
                        ↑ Move up
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === items.length - 1}
                        className="rounded-full border border-white/15 px-3 py-1 text-slate-200 disabled:opacity-30"
                      >
                        ↓ Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setEditing({
                            id: f.id,
                            watch_id: f.watch_id,
                            brand: f.brand,
                            model: f.model,
                            reference_number: f.reference_number ?? "",
                            image_url: f.image_url ?? "",
                            link_url: f.link_url ?? "",
                            note: f.note ?? "",
                            features: f.features ?? "",
                          });
                        }}
                        className="rounded-full border border-white/15 px-3 py-1 text-slate-200"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => remove(f)} className="rounded-full border border-rose-400/30 px-3 py-1 text-rose-200">
                        Remove
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && typeof document !== "undefined"
        ? createPortal(
            <FavoriteForm
              draft={editing}
              setDraft={setEditing}
              userId={user?.id ?? null}
              busy={busy}
              error={error}
              onSubmit={save}
              onClose={() => {
                setEditing(null);
                setError(null);
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function FavoriteForm({
  draft,
  setDraft,
  userId,
  busy,
  error,
  onSubmit,
  onClose,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  userId: string | null;
  busy: boolean;
  error: string | null;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  const [watches, setWatches] = useState<Watch[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    loadCollectionData(userId)
      .then((w) => live && setWatches(w))
      .catch(() => live && setWatches([]));
    return () => {
      live = false;
    };
  }, [userId]);

  const pick = (id: string) => {
    const w = watches?.find((x) => x.id === id);
    if (!w) return setDraft({ ...draft, watch_id: null });
    setDraft({
      ...draft,
      watch_id: w.id,
      brand: w.brand,
      model: w.model,
      reference_number: w.reference_number ?? "",
      image_url: /^https:\/\//i.test(w.image_url ?? "") ? w.image_url : "",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="fav-form-title">
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h2 id="fav-form-title" className="text-xl font-semibold text-white">
            {draft.id ? "Edit favorite" : "Add a favorite"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-2 text-2xl leading-none text-slate-400 hover:text-white">
            ×
          </button>
        </div>

        {!draft.id ? (
          <label className="mt-5 block text-sm text-slate-300">
            From your collection (optional)
            <select value={draft.watch_id ?? ""} onChange={(e) => pick(e.target.value)} className={`${input} mt-1`}>
              <option value="">{watches === null ? "Loading your collection…" : "Choose a watch, or type it in below"}</option>
              {(watches ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.brand} {w.model}
                  {w.reference_number ? ` · ${w.reference_number}` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Brand
            <input value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} required maxLength={60} className={`${input} mt-1`} />
          </label>
          <label className="block text-sm text-slate-300">
            Model
            <input value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} required maxLength={100} className={`${input} mt-1`} />
          </label>
        </div>
        <label className="mt-3 block text-sm text-slate-300">
          Reference (optional)
          <input value={draft.reference_number} onChange={(e) => setDraft({ ...draft, reference_number: e.target.value })} maxLength={60} className={`${input} mt-1`} />
        </label>
        <label className="mt-3 block text-sm text-slate-300">
          Review or reel link
          <input
            value={draft.link_url}
            onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
            placeholder="https://www.instagram.com/reel/… or /blog/…"
            inputMode="url"
            className={`${input} mt-1`}
          />
          <span className="mt-1 block text-xs text-slate-500">Instagram, TikTok, YouTube or Facebook reel, or a review on the blog. You can add it later.</span>
        </label>
        <label className="mt-3 block text-sm text-slate-300">
          Photo link (optional)
          <input
            value={draft.image_url}
            onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
            placeholder="https://…"
            inputMode="url"
            className={`${input} mt-1`}
          />
        </label>
        <label className="mt-3 block text-sm text-slate-300">
          Short note (optional)
          <span className="mt-0.5 block text-xs text-slate-500">Say &quot;one of Brandon&apos;s favorites&quot;, never &quot;his favorite&quot;, so no brand feels left out.</span>
          <textarea
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            maxLength={300}
            rows={3}
            placeholder="e.g. One of Brandon's favorites: …"
            className={`${input} mt-1 resize-none`}
          />
        </label>
        <label className="mt-3 block text-sm text-slate-300">
          What I love about it (optional)
          <span className="mt-0.5 block text-xs text-slate-500">
            The watch&apos;s unique features from the brand&apos;s website, written in Brandon&apos;s voice. Shown on the card and in the forum discussion.
          </span>
          <textarea
            value={draft.features}
            onChange={(e) => setDraft({ ...draft, features: e.target.value })}
            maxLength={1500}
            rows={5}
            placeholder="What I love about it: …"
            className={`${input} mt-1`}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={busy} className="rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold text-black hover:bg-[#e1b54a] disabled:opacity-60">
            {busy ? "Saving…" : draft.id ? "Save" : "Add to favorites"}
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-6 py-3 text-sm text-slate-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
