"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ForumIdentity from "@/components/ForumIdentity";
import { listFavorites, setFavoriteNotify, setFollowSubject, type Favorite } from "@/lib/inbox";
import { NEW_SUBJECT, SubjectSelect, useSubjectTree } from "@/components/ForumSubjects";
import { useAuth } from "@/components/AuthProvider";
import {
  BODY_MAX,
  BRANDS_FOLDER,
  CLUBS_FOLDER,
  TITLE_MAX,
  createPost,
  createSubject,
  deleteSubject,
  describeSubject,
  inSubject,
  isModerator,
  listPosts,
  parentOf,
  subjectLabel,
  timeAgo,
  watchPosts,
  type ForumPost,
  type SubjectNode,
} from "@/lib/forum";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

const BRANDS_PREVIEW = 8;

export default function ForumHome() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const subject = params.get("subject") ?? "";
  const { user } = useAuth();
  const { tree, reload: reloadSubjects } = useSubjectTree();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"active" | "new" | "popular">("active");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ subject: "general", title: "", body: "" });
  const [newSubject, setNewSubject] = useState({ name: "", kind: "subject" as "subject" | "sub", parent: CLUBS_FOLDER as string, description: "" });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [moderator, setModerator] = useState(false);
  // Which main subject the "+ Add a sub-folder" form is adding to (null = closed).
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favBusy, setFavBusy] = useState(false);

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
    return watchPosts(() => {
      void load();
      void reloadSubjects();
    });
  }, [load, reloadSubjects]);

  useEffect(() => {
    void isModerator(user?.id).then(setModerator);
  }, [user?.id]);

  const loadFavorites = useCallback(async () => {
    setFavorites(user?.id ? await listFavorites(user.id) : []);
  }, [user?.id]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const favoriteOf = (slug: string) => favorites.find((f) => f.subject === slug);

  const toggleFavorite = async (slug: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setFavBusy(true);
    try {
      const on = !favoriteOf(slug);
      await setFollowSubject(slug, on);
      await loadFavorites();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update favorites.");
    } finally {
      setFavBusy(false);
    }
  };

  const toggleNotify = async (fav: Favorite) => {
    setFavBusy(true);
    try {
      await setFavoriteNotify(fav.subject, !fav.notify);
      await loadFavorites();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update alerts.");
    } finally {
      setFavBusy(false);
    }
  };

  // Counts include sub-folders: "Watch Brands" counts every brand's posts.
  const countFor = useCallback((slug: string) => posts.filter((p) => inSubject(p.subject, slug)).length, [posts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = posts.filter((p) => (!subject || inSubject(p.subject, subject)) && (!q || `${p.title} ${p.body} ${p.author_name}`.toLowerCase().includes(q)));
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

  // The main subject currently open (its sub-folders are shown), if any.
  const openFolder = subject ? parentOf(subject) ?? subject : null;
  const openFolderName = openFolder ? describeSubject(tree, openFolder).node.name : "";

  const openComposer = () => {
    let start = draft.subject;
    if (subject === BRANDS_FOLDER) start = `${BRANDS_FOLDER}/misc`;
    else if (subject) start = subject;
    setDraft((d) => ({ ...d, subject: start }));
    if (openFolder) setNewSubject((n) => ({ ...n, parent: openFolder }));
    setComposing(true);
    setPostError(null);
    setTimeout(() => document.getElementById("new-post")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handlePost = async (event: FormEvent, authorName: string) => {
    event.preventDefault();
    if (draft.title.trim().length < 3) return setPostError("Give your post a title (at least 3 characters).");
    if (!draft.body.trim()) return setPostError("Write something in your post.");
    setPosting(true);
    setPostError(null);
    try {
      let subjectSlug = draft.subject;
      if (subjectSlug === NEW_SUBJECT) {
        const created = await createSubject({
          name: newSubject.name,
          parent: newSubject.kind === "sub" ? newSubject.parent : null,
          description: newSubject.description,
        });
        subjectSlug = created.slug;
        await reloadSubjects();
      }
      const created = await createPost({ ...draft, subject: subjectSlug, author_name: authorName });
      setDraft({ subject: subjectSlug, title: "", body: "" });
      setNewSubject({ name: "", kind: "subject", parent: CLUBS_FOLDER, description: "" });
      setComposing(false);
      router.push(`/forum/${created.id}`);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Couldn't post that.");
    } finally {
      setPosting(false);
    }
  };

  // "+ Add a sub-folder" (or "+ Add a club") opens a small form that creates the sub-folder right away.
  const startAddSubfolder = (parent: string) => {
    if (openFolder !== parent) chooseSubject(parent);
    setAddingTo(parent);
    setTimeout(() => document.getElementById("add-subfolder")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };
  const addLabel = (parent: string) => (parent === CLUBS_FOLDER ? "+ Add a club" : parent === BRANDS_FOLDER ? "+ Add a brand" : "+ Add a sub-folder");

  const removeSubject = async (node: SubjectNode) => {
    if (!window.confirm(`Remove "${node.name}"? This only works when it has no posts.`)) return;
    try {
      await deleteSubject(node.slug);
      await reloadSubjects();
      chooseSubject(node.parent ?? "");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't remove that.");
    }
  };

  const current = subject ? describeSubject(tree, subject) : null;
  const folderChildren = openFolder ? tree.children.get(openFolder) ?? [] : [];
  // Brands with posts first, so the long brand list stays useful.
  const sortedFolderChildren =
    openFolder === BRANDS_FOLDER
      ? [...folderChildren].sort((a, b) => countFor(b.slug) - countFor(a.slug) || (a.slug.endsWith("/misc") ? 1 : 0) - (b.slug.endsWith("/misc") ? 1 : 0) || a.name.localeCompare(b.name))
      : folderChildren;
  const shownChildren =
    openFolder === BRANDS_FOLDER && !showAllBrands
      ? sortedFolderChildren.filter((c, i) => i < BRANDS_PREVIEW || countFor(c.slug) > 0 || c.slug === subject || c.slug.endsWith("/misc"))
      : sortedFolderChildren;
  const canRemove = (n: SubjectNode) => n.community && (moderator || (user?.id && n.created_by === user.id)) && countFor(n.slug) === 0;

  const subjectButton = (s: { slug: string; name: string; icon: string }, opts: { indent?: boolean } = {}) => {
    const active = subject === s.slug;
    const count = s.slug ? countFor(s.slug) : posts.length;
    return (
      <button
        key={s.slug || "all"}
        type="button"
        onClick={() => chooseSubject(s.slug)}
        aria-current={active ? "page" : undefined}
        className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm transition ${opts.indent ? "lg:ml-5 lg:py-2" : ""} ${
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
  };

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
            onClick={() => openComposer()}
            className="shrink-0 rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_20px_60px_rgba(217,164,58,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e1b54a]"
          >
            + New post
          </button>
        </div>

        <GettingStarted onNewPost={() => openComposer()} />

        {composing ? (
          <div id="new-post" className="mt-6 scroll-mt-6">
            <ForumIdentity action="start a discussion">
              {(authorName) => (
                <form onSubmit={(e) => handlePost(e, authorName)} className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-300">New discussion</p>
                    <p className="text-xs text-slate-400">
                      Posting as <span className="font-semibold text-white">{authorName}</span>
                    </p>
                  </div>
                  <label className="space-y-2 text-sm text-slate-300">
                    Subject
                    <SubjectSelect tree={tree} value={draft.subject} onChange={(slug) => setDraft({ ...draft, subject: slug })} allowNew className={input} />
                  </label>

                  {draft.subject === NEW_SUBJECT ? (
                    <div className="grid gap-3 rounded-2xl border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-4">
                      <p className="text-sm font-semibold text-white">Add a new subject or sub-folder</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "subject" as const, label: "New main subject" },
                          { key: "sub" as const, label: "New sub-folder inside a subject" },
                        ].map((o) => (
                          <button
                            key={o.key}
                            type="button"
                            onClick={() => setNewSubject({ ...newSubject, kind: o.key })}
                            aria-pressed={newSubject.kind === o.key}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                              newSubject.kind === o.key ? "border-[#D9A43A] bg-[#D9A43A] text-black" : "border-white/15 text-slate-200 hover:bg-white/5"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      {newSubject.kind === "sub" ? (
                        <label className="space-y-1 text-xs text-slate-300">
                          Put it inside
                          <select value={newSubject.parent} onChange={(e) => setNewSubject({ ...newSubject, parent: e.target.value })} className={input}>
                            {tree.top.map((t) => (
                              <option key={t.slug} value={t.slug}>
                                {t.icon} {t.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <input
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        maxLength={50}
                        required
                        placeholder={
                          newSubject.kind === "sub"
                            ? newSubject.parent === CLUBS_FOLDER
                              ? "Club name, e.g. NJ Watch Collectors"
                              : "Sub-folder name, e.g. Dive Watches"
                            : "Subject name, e.g. Watch Photography"
                        }
                        className={input}
                      />
                      {newSubject.kind === "sub" && newSubject.parent === CLUBS_FOLDER ? (
                        <input
                          value={newSubject.description}
                          onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                          maxLength={300}
                          placeholder="Optional: where and when you meet, e.g. Hoboken, first Saturday monthly"
                          className={input}
                        />
                      ) : null}
                      <p className="text-xs text-slate-400">
                        {newSubject.kind === "sub"
                          ? `Creates a new sub-folder inside ${describeSubject(tree, newSubject.parent).node.name}. Your post will be its first discussion.`
                          : "Creates a new main subject everyone can post in. Your post will be its first discussion."}
                      </p>
                    </div>
                  ) : null}

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

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          {favorites.length ? (
            <div className="mb-5">
              <p className="mb-3 px-1 text-xs uppercase tracking-[0.3em] text-[#D9A43A]">★ Favorites</p>
              <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Favorite forum folders">
                {favorites.map((f) => {
                  const d = describeSubject(tree, f.subject);
                  return (
                    <div key={f.subject} className="flex shrink-0 items-center gap-1 lg:w-full">
                      <div className="min-w-0 flex-1 [&>button]:w-full">
                        {subjectButton({ slug: f.subject, name: d.node.name, icon: d.node.folder ? "📁" : d.node.icon })}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotify(f)}
                        disabled={favBusy}
                        title={f.notify ? "Alerts on: tap to turn off" : "Alerts off: tap to turn on"}
                        aria-label={`${f.notify ? "Turn off" : "Turn on"} alerts for ${d.node.name}`}
                        className={`shrink-0 rounded-full px-2 py-2 text-sm transition ${f.notify ? "text-[#D9A43A]" : "text-slate-600"} hover:bg-white/10`}
                      >
                        {f.notify ? "🔔" : "🔕"}
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>
          ) : null}
          <p className="mb-3 px-1 text-xs uppercase tracking-[0.3em] text-blue-300">Subjects</p>
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[calc(100vh-6rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0" aria-label="Forum subjects">
            {subjectButton({ slug: "", name: "All discussions", icon: "🗂️" })}
            {tree.top.map((s) => (
              <div key={s.slug} className="contents lg:flex lg:flex-col lg:gap-2">
                {subjectButton({ ...s, icon: s.folder || tree.children.get(s.slug)?.length ? `${openFolder === s.slug ? "📂" : "📁"}` : s.icon })}
                {/* On large screens the open subject shows its sub-folders right under it. */}
                {openFolder === s.slug ? (
                  <div className="hidden lg:flex lg:flex-col lg:gap-2">
                    {shownChildren.map((c) => subjectButton(c, { indent: true }))}
                    {openFolder === BRANDS_FOLDER && shownChildren.length < sortedFolderChildren.length ? (
                      <button type="button" onClick={() => setShowAllBrands(true)} className="ml-5 text-left text-xs font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
                        Show all {sortedFolderChildren.length} brands
                      </button>
                    ) : null}
                    <button type="button" onClick={() => startAddSubfolder(s.slug)} className="ml-5 text-left text-xs font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
                      {addLabel(s.slug)}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
          <button type="button" onClick={() => { setDraft((d) => ({ ...d, subject: NEW_SUBJECT })); setNewSubject((n) => ({ ...n, kind: "subject" })); setComposing(true); setTimeout(() => document.getElementById("new-post")?.scrollIntoView({ behavior: "smooth" }), 50); }} className="mt-3 hidden px-1 text-xs font-semibold text-[#D9A43A] hover:text-[#e1b54a] lg:block">
            + Add a subject
          </button>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {current?.parent ? (
                <button type="button" onClick={() => chooseSubject(current.parent!.slug)} className="mb-1 text-xs text-slate-400 hover:text-white">
                  {current.parent.name} ›
                </button>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-white">
                  {current ? (
                    <>
                      <span className="mr-2">{current.node.icon}</span>
                      {current.node.name}
                    </>
                  ) : (
                    "All discussions"
                  )}
                </h2>
                {current ? (
                  <FavoriteControls
                    favorite={favoriteOf(current.node.slug)}
                    busy={favBusy}
                    onToggle={() => toggleFavorite(current.node.slug)}
                    onToggleNotify={(fav) => toggleNotify(fav)}
                  />
                ) : null}
                {current && canRemove(current.node) ? (
                  <button type="button" onClick={() => removeSubject(current.node)} className="text-xs text-slate-500 hover:text-rose-300">
                    Remove
                  </button>
                ) : null}
              </div>
              {current?.node.description ? <p className="mt-1 text-sm text-slate-400">{current.node.description}</p> : null}
            </div>
            <div className="flex gap-3">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the forum" className={`${input} sm:w-56`} />
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={`${input} w-auto`} aria-label="Sort">
                <option value="active">Latest activity</option>
                <option value="new">Newest</option>
                <option value="popular">Most replies</option>
              </select>
            </div>
          </div>

          {/* Sub-folders of the open folder (always shown on small screens; on large screens they're also in the sidebar). */}
          {openFolder ? (
            <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
              {shownChildren.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => chooseSubject(c.slug)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    subject === c.slug ? "border-blue-400/40 bg-blue-500/15 text-blue-100" : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {c.name} <span className="text-slate-500">{countFor(c.slug)}</span>
                </button>
              ))}
              {openFolder === BRANDS_FOLDER && shownChildren.length < sortedFolderChildren.length ? (
                <button type="button" onClick={() => setShowAllBrands(true)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#D9A43A]">
                  All {sortedFolderChildren.length} brands…
                </button>
              ) : null}
              <button type="button" onClick={() => startAddSubfolder(openFolder)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#D9A43A]">
                {addLabel(openFolder)}
              </button>
            </div>
          ) : null}

          {addingTo ? (
            <AddSubfolderForm
              parent={addingTo}
              parentName={describeSubject(tree, addingTo).node.name}
              signedIn={Boolean(user)}
              onCancel={() => setAddingTo(null)}
              onAdded={async (slug) => {
                await reloadSubjects();
                setAddingTo(null);
                chooseSubject(slug);
              }}
            />
          ) : null}

          {!addingTo && openFolder === CLUBS_FOLDER && subject === CLUBS_FOLDER && !(tree.children.get(CLUBS_FOLDER) ?? []).length ? (
            <div className="mb-4 rounded-[1.5rem] border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">No clubs yet.</p>
              <p className="mt-1">Belong to a watch club or meetup group? Add it as its own folder here so members can find events and chat.</p>
              <button type="button" onClick={() => startAddSubfolder(CLUBS_FOLDER)} className="mt-3 rounded-full bg-[#D9A43A] px-4 py-2 text-xs font-semibold text-black hover:bg-[#e1b54a]">
                + Add a club
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">Loading discussions…</div>
          ) : error ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-10 text-center text-amber-200">{error}</div>
          ) : !visible.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300">
              <div className="text-4xl">💬</div>
              <p className="mt-3 font-semibold text-white">{search ? "No posts match your search." : "No discussions here yet."}</p>
              {!search ? (
                <button type="button" onClick={() => openComposer()} className="mt-4 rounded-full bg-[#D9A43A] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#e1b54a]">
                  Start the first one
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {visible.map((post) => {
                const s = describeSubject(tree, post.subject).node;
                return (
                  <li key={post.id}>
                    <Link
                      href={`/forum/${post.id}`}
                      className="group flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-[#D9A43A]/40 hover:bg-white/[0.07] sm:p-5"
                    >
                      <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/30 text-xl sm:flex">{s.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-300">{subjectLabel(tree, post.subject)}</p>
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

const STEPS = [
  { title: "Log in or join", text: "Reading is open to everyone. To post or reply, log in or create a free account." },
  { title: "Tap + New post", text: "The first time, choose your forum name. It's what everyone sees, and your email stays private." },
  { title: "Pick a subject and post", text: "Choose a subject, brand or club. Not listed? Add a new subject, or open any subject and tap + Add a sub-folder (or + Add a club)." },
  { title: "Favorite and follow", text: "Tap ☆ Add to favorites on any folder to pin it and get inbox alerts for new posts, replies and clubs. Follow single discussions too." },
];

const HIDE_KEY = "bb-forum-getting-started-hidden";

// Directions box at the top of the forum. Members can collapse it; the choice is remembered on this device.
function GettingStarted({ onNewPost }: { onNewPost: () => void }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(window.localStorage.getItem(HIDE_KEY) === "1");
    } catch {
      // storage unavailable: keep it open
    }
  }, []);

  const toggle = () => {
    const next = !hidden;
    setHidden(next);
    try {
      window.localStorage.setItem(HIDE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
  };

  return (
    <section className="mt-6 rounded-[1.5rem] border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-5" aria-labelledby="forum-getting-started">
      <div className="flex items-center justify-between gap-3">
        <h2 id="forum-getting-started" className="text-xs uppercase tracking-[0.3em] text-[#D9A43A]">
          Getting started
        </h2>
        <button type="button" onClick={toggle} className="text-xs font-semibold text-slate-400 hover:text-white" aria-expanded={!hidden}>
          {hidden ? "Show" : "Hide"}
        </button>
      </div>
      {!hidden ? (
        <>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D9A43A] text-sm font-bold text-black">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-5 text-slate-400">
            Not sure where to start? Say hello in <span className="text-slate-200">General Discussion</span> or post a &ldquo;Friday wrist check&rdquo; in{" "}
            <span className="text-slate-200">Wrist Shots</span>. You can edit or delete your own posts any time. Please keep it friendly and respectful; moderators may remove posts that aren&apos;t.{" "}
            <button type="button" onClick={onNewPost} className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
              Start a post →
            </button>
          </p>
        </>
      ) : null}
    </section>
  );
}

// Adds a new sub-folder inside a main subject (a club under Watch Clubs & Meetups, a brand under Watch Brands, etc.).
function AddSubfolderForm({
  parent,
  parentName,
  signedIn,
  onCancel,
  onAdded,
}: {
  parent: string;
  parentName: string;
  signedIn: boolean;
  onCancel: () => void;
  onAdded: (slug: string) => Promise<void>;
}) {
  const isClub = parent === CLUBS_FOLDER;
  const thing = isClub ? "club" : parent === BRANDS_FOLDER ? "brand" : "sub-folder";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createSubject({ name, parent, description });
      await onAdded(created.slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Couldn't add that ${thing}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div id="add-subfolder" className="mb-4 rounded-[1.5rem] border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-5 text-sm">
      <p className="font-semibold text-white">Add a {thing}</p>
      <p className="mt-1 text-slate-400">
        Creates a new sub-folder inside {parentName}
        {isClub ? " for your club's events and chat." : " that everyone can post in."}
      </p>
      {!signedIn ? (
        <p className="mt-3 text-slate-300">
          <Link href="/login" className="font-semibold text-[#D9A43A]">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-semibold text-[#D9A43A]">
            create a free account
          </Link>{" "}
          to add a {thing}.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
            autoFocus
            placeholder={isClub ? "Club name, e.g. NJ Watch Collectors" : parent === BRANDS_FOLDER ? "Brand name" : "Sub-folder name, e.g. Dive Watches"}
            className={input}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            placeholder={isClub ? "Optional: where and when you meet, e.g. Hoboken, first Saturday monthly" : "Optional: a short description"}
            className={input}
          />
          {error ? <p className="text-rose-300">{error}</p> : null}
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="rounded-full bg-[#D9A43A] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#e1b54a] disabled:opacity-60">
              {busy ? "Adding…" : `Add ${thing}`}
            </button>
            <button type="button" onClick={onCancel} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/5">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ☆ Favorite / ★ Favorite button with an alerts switch for the open folder.
function FavoriteControls({
  favorite,
  busy,
  onToggle,
  onToggleNotify,
}: {
  favorite: Favorite | undefined;
  busy: boolean;
  onToggle: () => void;
  onToggleNotify: (fav: Favorite) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        aria-pressed={Boolean(favorite)}
        title={favorite ? "Remove from your favorites" : "Add to your favorites and get alerts for new activity"}
        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition disabled:opacity-60 ${
          favorite ? "border-[#D9A43A]/60 bg-[#D9A43A]/15 text-[#D9A43A]" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
        }`}
      >
        {favorite ? "★ Favorite" : "☆ Add to favorites"}
      </button>
      {favorite ? (
        <button
          type="button"
          onClick={() => onToggleNotify(favorite)}
          disabled={busy}
          aria-pressed={favorite.notify}
          title="New discussions, replies and sub-folders here go to your inbox"
          className={`rounded-full border px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
            favorite.notify ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-white/15 bg-white/5 text-slate-400"
          }`}
        >
          {favorite.notify ? "🔔 Alerts on" : "🔕 Alerts off"}
        </button>
      ) : null}
    </div>
  );
}
