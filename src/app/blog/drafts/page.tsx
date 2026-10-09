"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { isModerator } from "@/lib/forum";
import BlogBody from "@/components/BlogBody";
import { formatPostDate } from "@/lib/blogPosts";
import { slugify, type DbPost, type SocialDrafts } from "@/lib/blogDb";
import { socials } from "@/lib/socials";

// Moderators review Claude's weekly blog + social drafts here: edit, publish to /blog, and copy each social post.

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none transition focus:border-blue-400/70";
const label = "block space-y-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400";

type Platform = "instagram" | "tiktok" | "youtube" | "facebook";
const PLATFORMS: { key: Platform; name: string; icon: string; fields: { key: string; label: string; rows: number }[] }[] = [
  {
    key: "instagram",
    name: "Instagram",
    icon: "📸",
    fields: [
      { key: "caption", label: "Caption", rows: 8 },
      { key: "hashtags", label: "Hashtags", rows: 2 },
      { key: "reel_idea", label: "Reel plan", rows: 5 },
    ],
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: "🎵",
    fields: [
      { key: "hook", label: "Hook (first 2 seconds)", rows: 2 },
      { key: "script", label: "Script", rows: 7 },
      { key: "caption", label: "Caption", rows: 2 },
      { key: "hashtags", label: "Hashtags", rows: 1 },
    ],
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: "▶️",
    fields: [
      { key: "title", label: "Title", rows: 1 },
      { key: "description", label: "Description", rows: 7 },
      { key: "short_script", label: "Shorts script", rows: 6 },
      { key: "tags", label: "Tags", rows: 2 },
    ],
  },
  { key: "facebook", name: "Facebook", icon: "👍", fields: [{ key: "post", label: "Post", rows: 7 }] },
];

type Edit = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  meta_description: string;
  keywords: string;
  body: string;
  social: SocialDrafts;
};

const toEdit = (p: DbPost): Edit => ({
  title: p.title,
  slug: p.slug,
  category: p.category,
  excerpt: p.excerpt,
  meta_description: p.meta_description,
  keywords: (p.keywords ?? []).join(", "),
  body: (p.body ?? []).join("\n\n"),
  social: p.social ?? {},
});

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      disabled={!text}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
    >
      {done ? "Copied ✓" : "Copy"}
    </button>
  );
}

export default function BlogDraftsPage() {
  const { user, loading } = useRequireAuth();
  const [mod, setMod] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [setupMissing, setSetupMissing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Edit | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [topic, setTopic] = useState("");
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (loading) return;
    void isModerator(user?.id).then(setMod);
  }, [loading, user?.id]);

  const load = useCallback(async (keep?: string | null) => {
    if (!supabase) return;
    const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) {
      setSetupMissing(true);
      return;
    }
    const rows = (data ?? []) as DbPost[];
    setPosts(rows);
    const pick = rows.find((r) => r.id === keep) ?? rows.find((r) => r.status === "draft") ?? rows[0] ?? null;
    setSelectedId(pick?.id ?? null);
    setEdit(pick ? toEdit(pick) : null);
    setDirty(false);
  }, []);

  useEffect(() => {
    if (mod) void Promise.resolve().then(() => load());
  }, [mod, load]);

  const selected = useMemo(() => posts.find((p) => p.id === selectedId) ?? null, [posts, selectedId]);

  function choose(p: DbPost) {
    if (dirty && !window.confirm("You have unsaved changes. Leave this draft anyway?")) return;
    setSelectedId(p.id);
    setEdit(toEdit(p));
    setDirty(false);
    setPreview(false);
    setConfirmDelete(false);
    setNote(null);
  }

  const change = (patch: Partial<Edit>) => {
    setEdit((e) => (e ? { ...e, ...patch } : e));
    setDirty(true);
  };
  const changeSocial = (platform: Platform, key: string, value: string) => {
    setEdit((e) => (e ? { ...e, social: { ...e.social, [platform]: { ...(e.social[platform] ?? {}), [key]: value } } } : e));
    setDirty(true);
  };

  async function save(status?: "draft" | "published") {
    if (!supabase || !selected || !edit) return;
    const slug = slugify(edit.slug || edit.title);
    if (!slug || edit.title.trim().length < 3) {
      setNote({ ok: false, text: "Add a title (and a web address) first." });
      return;
    }
    setBusy(status === "published" ? "Publishing…" : status === "draft" ? "Unpublishing…" : "Saving…");
    setNote(null);
    const row = {
      title: edit.title.trim().slice(0, 140),
      slug,
      category: edit.category.trim().slice(0, 40) || "News",
      excerpt: edit.excerpt.trim().slice(0, 400),
      meta_description: edit.meta_description.trim().slice(0, 200),
      keywords: edit.keywords.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 12),
      body: edit.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      social: edit.social,
      ...(status ? { status } : {}),
      ...(status === "published" ? { post_date: new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }) } : {}),
    };
    const { error } = await supabase.from("blog_posts").update(row).eq("id", selected.id);
    setBusy(null);
    if (error) {
      setNote({ ok: false, text: error.message.includes("blog_posts_slug_key") ? "Another post already uses that web address. Change it and try again." : error.message });
      return;
    }
    setNote({
      ok: true,
      text:
        status === "published"
          ? "Published! It will appear on the blog within 5 minutes. Now copy the social posts below and share them."
          : status === "draft"
            ? "Moved back to drafts. It will disappear from the blog within 5 minutes."
            : "Saved.",
    });
    await load(selected.id);
  }

  async function togglePosted(platform: Platform) {
    if (!supabase || !selected || !edit) return;
    const posted = { ...(edit.social.posted ?? {}), [platform]: !edit.social.posted?.[platform] };
    const social = { ...edit.social, posted };
    setEdit({ ...edit, social });
    await supabase.from("blog_posts").update({ social }).eq("id", selected.id);
  }

  async function remove() {
    if (!supabase || !selected) return;
    setBusy("Deleting…");
    await supabase.from("blog_posts").delete().eq("id", selected.id);
    setBusy(null);
    setConfirmDelete(false);
    await load(null);
  }

  async function generate() {
    if (!supabase) return;
    setBusy("Claude is researching and writing… this takes 1–3 minutes.");
    setNote(null);
    const { data } = await supabase.auth.getSession();
    const res = await fetch("/api/blog-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ topic }),
    }).catch(() => null);
    const out = (await res?.json().catch(() => ({}))) as { id?: string; error?: string } | undefined;
    setBusy(null);
    if (!res?.ok || !out?.id) {
      setNote({ ok: false, text: out?.error ?? "Couldn't write the draft. Please try again." });
      return;
    }
    setTopic("");
    setNote({ ok: true, text: "New draft ready below. Review it, then publish." });
    await load(out.id);
  }

  if (loading || mod === null) return <p className="px-2 py-10 text-slate-400">Loading…</p>;
  if (!mod)
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Drafts are for the site team</h1>
        <p className="mt-2 text-slate-300">Only moderators can review blog and social media drafts.</p>
        <Link href="/blog" className="mt-4 inline-block text-blue-300 hover:text-blue-200">
          Read the blog →
        </Link>
      </div>
    );

  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");

  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-6 sm:py-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Content studio</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">Blog & social drafts</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Every Monday at 6 AM (Eastern), Claude researches and writes a new blog post in Brandon&apos;s voice, plus Instagram, TikTok, YouTube and
          Facebook versions, and saves them here as drafts. Nothing goes live until you press Publish. Social posts aren&apos;t posted for you: copy
          each one and paste it into the app, then tick &ldquo;Posted&rdquo;.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={300}
            placeholder="Optional topic, e.g. “Tudor's new Black Bay” (leave empty for this week's theme)"
            className={`${input} sm:flex-1`}
          />
          <button
            type="button"
            onClick={() => void generate()}
            disabled={Boolean(busy)}
            className="shrink-0 rounded-full bg-[#D9A43A] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#e1b54a] disabled:opacity-50"
          >
            ✍️ Write a new draft now
          </button>
        </div>
        {busy ? <p className="mt-3 animate-pulse text-sm text-blue-200">{busy}</p> : null}
        {note ? <p className={`mt-3 text-sm ${note.ok ? "text-emerald-300" : "text-rose-300"}`}>{note.text}</p> : null}
        {setupMissing ? (
          <p className="mt-3 rounded-xl bg-amber-400/10 px-3 py-2 text-sm text-amber-100">The drafts table isn&apos;t set up in the database yet.</p>
        ) : null}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-4">
          {[
            { title: "Drafts", list: drafts },
            { title: "Published", list: published },
          ].map((g) => (
            <div key={g.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3">
              <p className="px-2 pb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                {g.title} ({g.list.length})
              </p>
              {g.list.length ? (
                <ul className="space-y-1">
                  {g.list.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => choose(p)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${p.id === selectedId ? "bg-[#1A7DBF]/40 text-white" : "text-slate-300 hover:bg-white/5"}`}
                      >
                        <span className="line-clamp-2 font-semibold">{p.title}</span>
                        <span className="text-xs text-slate-400">{formatPostDate(p.status === "published" ? p.post_date : p.created_at.slice(0, 10))}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2 text-sm text-slate-500">None yet.</p>
              )}
            </div>
          ))}
        </aside>

        {selected && edit ? (
          <div className="min-w-0 space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${selected.status === "published" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-400/20 text-amber-100"}`}
                >
                  {selected.status === "published" ? "Published" : "Draft"}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPreview((v) => !v)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
                    {preview ? "Edit" : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void save()}
                    disabled={Boolean(busy) || !dirty}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    Save
                  </button>
                  {selected.status === "published" ? (
                    <>
                      <Link href={`/blog/${selected.slug}`} target="_blank" className="rounded-full border border-white/15 px-4 py-2 text-sm text-blue-200 hover:bg-white/10">
                        View live ↗
                      </Link>
                      <button type="button" onClick={() => void save("draft")} disabled={Boolean(busy)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
                        Unpublish
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void save("published")}
                      disabled={Boolean(busy)}
                      className="rounded-full bg-[#D9A43A] px-5 py-2 text-sm font-semibold text-black hover:bg-[#e1b54a] disabled:opacity-50"
                    >
                      Publish to blog
                    </button>
                  )}
                </div>
              </div>

              {preview ? (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#D9A43A]">{edit.category}</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{edit.title}</h2>
                  <BlogBody paragraphs={edit.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)} />
                </div>
              ) : (
                <div className="mt-5 grid gap-4">
                  <label className={label}>
                    Title
                    <input value={edit.title} onChange={(e) => change({ title: e.target.value })} maxLength={140} className={input} />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={label}>
                      Web address
                      <input value={edit.slug} onChange={(e) => change({ slug: e.target.value })} maxLength={80} className={input} />
                      <span className="block normal-case tracking-normal text-slate-500">brandonsbrands17.com/blog/{slugify(edit.slug || edit.title)}</span>
                    </label>
                    <label className={label}>
                      Category
                      <input value={edit.category} onChange={(e) => change({ category: e.target.value })} maxLength={40} className={input} />
                    </label>
                  </div>
                  <label className={label}>
                    Summary (shown on the blog list)
                    <textarea value={edit.excerpt} onChange={(e) => change({ excerpt: e.target.value })} maxLength={400} rows={2} className={input} />
                  </label>
                  <label className={label}>
                    Google description ({edit.meta_description.length}/160)
                    <textarea value={edit.meta_description} onChange={(e) => change({ meta_description: e.target.value })} maxLength={200} rows={2} className={input} />
                  </label>
                  <label className={label}>
                    SEO keywords (comma-separated)
                    <input value={edit.keywords} onChange={(e) => change({ keywords: e.target.value })} className={input} />
                  </label>
                  <label className={label}>
                    Post
                    <span className="block normal-case tracking-normal text-slate-500">
                      Leave a blank line between paragraphs. Start a line with ## for a subheading. Links: [words](/learn/guide-name).
                    </span>
                    <textarea value={edit.body} onChange={(e) => change({ body: e.target.value })} rows={22} className={`${input} font-mono text-[13px] leading-6`} />
                  </label>
                  {selected.sources?.length ? (
                    <details className="text-sm text-slate-400">
                      <summary className="cursor-pointer text-slate-300">Sources Claude used ({selected.sources.length})</summary>
                      <ul className="mt-2 space-y-1">
                        {selected.sources.map((s) => (
                          <li key={s.url}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-blue-300 hover:text-blue-200">
                              {s.title || s.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-7">
              <h2 className="text-xl font-semibold text-white">Social media drafts</h2>
              <p className="mt-1 text-sm text-slate-400">Edit, copy and paste into each app. Publish the blog post first so the links work. Remember to Save after editing.</p>
              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                {PLATFORMS.map((pl) => {
                  const values = (edit.social[pl.key] ?? {}) as Record<string, string | undefined>;
                  const posted = Boolean(edit.social.posted?.[pl.key]);
                  const account = socials.find((s) => s.name === pl.name);
                  const all = pl.fields
                    .filter((f) => !["reel_idea", "hook", "script", "short_script"].includes(f.key))
                    .map((f) => values[f.key] ?? "")
                    .filter(Boolean)
                    .join("\n\n");
                  return (
                    <div key={pl.key} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-white">
                          <span aria-hidden>{pl.icon}</span> {pl.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <CopyButton text={all} />
                          {account ? (
                            <a href={account.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-300 hover:text-blue-200">
                              Open ↗
                            </a>
                          ) : null}
                          <label className="flex items-center gap-1 text-xs text-slate-300">
                            <input type="checkbox" checked={posted} onChange={() => void togglePosted(pl.key)} className="h-4 w-4 accent-emerald-400" />
                            Posted
                          </label>
                        </div>
                      </div>
                      <div className="mt-3 space-y-3">
                        {pl.fields.map((f) => (
                          <div key={f.key}>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{f.label}</span>
                              <CopyButton text={values[f.key] ?? ""} />
                            </div>
                            <textarea
                              value={values[f.key] ?? ""}
                              onChange={(e) => changeSocial(pl.key, f.key, e.target.value)}
                              rows={f.rows}
                              className={`${input} leading-6`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex justify-end">
              {confirmDelete ? (
                <span className="flex items-center gap-3 text-sm text-slate-300">
                  Delete this post for good?
                  <button type="button" onClick={() => void remove()} className="rounded-full bg-rose-500/80 px-4 py-1.5 font-semibold text-white hover:bg-rose-500">
                    Delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="text-sm text-slate-500 hover:text-rose-300">
                  Delete this post
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
            No drafts yet. The first one arrives Monday morning, or press &ldquo;Write a new draft now&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}
