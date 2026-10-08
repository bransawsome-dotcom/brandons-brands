"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ForumIdentity from "@/components/ForumIdentity";
import {
  BODY_MAX,
  FORUM_SUBJECTS,
  TITLE_MAX,
  createPost,
  listPosts,
  subjectInfo,
  timeAgo,
  watchPosts,
  type ForumPost,
} from "@/lib/forum";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

export default function ForumHome() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const subject = params.get("subject") ?? "";

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"active" | "new" | "popular">("active");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ subject: "general", title: "", body: "" });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // All posts are loaded once; subject filtering and counts happen in the browser.
  const load = useCallback(async () => {
    try {
      setPosts(await listPosts());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the forum.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return watchPosts(() => void load());
  }, [load]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) map.set(p.subject, (map.get(p.subject) ?? 0) + 1);
    return map;
  }, [posts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = posts.filter((p) => (!subject || p.subject === subject) && (!q || `${p.title} ${p.body} ${p.author_name}`.toLowerCase().includes(q)));
    if (sort === "new") list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else if (sort === "popular") list.sort((a, b) => b.comment_count - a.comment_count || b.last_activity_at.localeCompare(a.last_activity_at));
    else list.sort((a, b) => b.last_activity_at.localeCompare(a.last_activity_at));
    return list;
  }, [posts, subject, search, sort]);

  const chooseSubject = (slug: string) => {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set("subject", slug);
    else next.delete("subject");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const openComposer = () => {
    setDraft((d) => ({ ...d, subject: subject || d.subject }));
    setComposing(true);
    setPostError(null);
  };

  const handlePost = async (event: FormEvent, authorName: string) => {
    event.preventDefault();
    if (draft.title.trim().length < 3) return setPostError("Give your post a title (at least 3 characters).");
    if (!draft.body.trim()) return setPostError("Write something in your post.");
    setPosting(true);
    setPostError(null);
    try {
      const created = await createPost({ ...draft, author_name: authorName });
      setDraft({ subject: draft.subject, title: "", body: "" });
      setComposing(false);
      router.push(`/forum/${created.id}`);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Couldn't post that.");
    } finally {
      setPosting(false);
    }
  };

  const current = subject ? subjectInfo(subject) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-14 lg:px-16">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Community Forum</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">Talk watches.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Ask questions, share wrist shots, and swap buying advice with fellow collectors. Pick a subject or start a new discussion.
            </p>
          </div>
          <button
            type="button"
            onClick={openComposer}
            className="shrink-0 rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_20px_60px_rgba(217,164,58,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e1b54a]"
          >
            + New post
          </button>
        </div>

        {composing ? (
          <div id="new-post" className="mt-6">
            <ForumIdentity action="start a discussion">
              {(authorName) => (
                <form onSubmit={(e) => handlePost(e, authorName)} className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-300">New discussion</p>
                    <p className="text-xs text-slate-400">Posting as <span className="font-semibold text-white">{authorName}</span></p>
                  </div>
                  <label className="space-y-2 text-sm text-slate-300">
                    Subject
                    <select value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className={input}>
                      {FORUM_SUBJECTS.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Title
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      maxLength={TITLE_MAX}
                      placeholder="e.g. Is the new Pelagos 39 worth it over the BB58?"
                      className={input}
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Post
                    <textarea
                      value={draft.body}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                      maxLength={BODY_MAX}
                      rows={6}
                      placeholder="Share details, questions, links…"
                      className={input}
                      required
                    />
                    <span className="block text-right text-xs text-slate-500">
                      {draft.body.length}/{BODY_MAX}
                    </span>
                  </label>
                  {postError ? <p className="text-sm text-rose-300">{postError}</p> : null}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={posting}
                      className="rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black hover:bg-[#e1b54a] disabled:opacity-60"
                    >
                      {posting ? "Posting…" : "Post"}
                    </button>
                    <button type="button" onClick={() => setComposing(false)} className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </ForumIdentity>
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 px-1 text-xs uppercase tracking-[0.3em] text-blue-300">Subjects</p>
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {[{ slug: "", name: "All discussions", icon: "🗂️" }, ...FORUM_SUBJECTS].map((s) => {
              const active = subject === s.slug;
              const count = s.slug ? counts.get(s.slug) ?? 0 : posts.length;
              return (
                <button
                  key={s.slug || "all"}
                  type="button"
                  onClick={() => chooseSubject(s.slug)}
                  className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm transition ${
                    active ? "border-blue-400/40 bg-blue-500/15 text-blue-100" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="whitespace-nowrap lg:whitespace-normal">
                    <span className="mr-2">{s.icon}</span>
                    {s.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-black/30 px-2 py-0.5 text-xs text-slate-400">{count}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {current ? (
                <>
                  <span className="mr-2">{current.icon}</span>
                  {current.name}
                </>
              ) : (
                "All discussions"
              )}
            </h2>
            <div className="flex gap-3">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the forum" className={`${input} sm:w-56`} />
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={`${input} w-auto`} aria-label="Sort">
                <option value="active">Latest activity</option>
                <option value="new">Newest</option>
                <option value="popular">Most replies</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">Loading discussions…</div>
          ) : error ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-10 text-center text-amber-200">{error}</div>
          ) : !visible.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300">
              <div className="text-4xl">💬</div>
              <p className="mt-3 font-semibold text-white">{search ? "No posts match your search." : "No discussions here yet."}</p>
              {!search ? (
                <button type="button" onClick={openComposer} className="mt-4 rounded-full bg-[#D9A43A] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#e1b54a]">
                  Start the first one
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {visible.map((post) => {
                const s = subjectInfo(post.subject);
                return (
                  <li key={post.id}>
                    <Link
                      href={`/forum/${post.id}`}
                      className="group flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-[#D9A43A]/40 hover:bg-white/[0.07] sm:p-5"
                    >
                      <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/30 text-xl sm:flex">{s.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-300">{s.name}</p>
                        <h3 className="mt-1 text-lg font-semibold text-white group-hover:text-[#e1b54a]">{post.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-400">{post.body}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          by <span className="text-slate-300">{post.author_name}</span> · {timeAgo(post.created_at)}
                          {post.last_activity_at !== post.created_at ? ` · active ${timeAgo(post.last_activity_at)}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-center">
                        <p className="text-xl font-semibold text-white">{post.comment_count}</p>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">{post.comment_count === 1 ? "reply" : "replies"}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
