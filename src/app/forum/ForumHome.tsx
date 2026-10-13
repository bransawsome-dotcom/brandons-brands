"use client";

import { SkeletonList } from "@/components/Skeleton";

import PhotoPicker from "@/components/PhotoPicker";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ForumIdentity from "@/components/ForumIdentity";
import SalesDisclaimer from "@/components/SalesDisclaimer";
import ForumSafety from "@/components/ForumSafety";
import Glyph, { glyphName } from "@/components/Glyph";
import { listFavorites, setFavoriteNotify, setFollowSubject, type Favorite } from "@/lib/inbox";
import { NEW_SUBJECT, SubjectSelect, useSubjectTree } from "@/components/ForumSubjects";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { linkInfo, type Favorite as FavoriteWatch } from "@/lib/favorites";
import {
  BODY_MAX,
  BRANDS_FOLDER,
  FAVORITES_SUBJECT,
  CLUBS_FOLDER,
  TITLE_MAX,
  createPost,
  createSubject,
  deleteSubject,
  describeSubject,
  inSubject,
  isModerator,
  loadFolderOwners,
  lockedSubjects,
  type FolderOwners,
  listPosts,
  parentOf,
  subjectLabel,
  timeAgo,
  watchPosts,
  type ForumPost,
  type SubjectNode,
} from "@/lib/forum";

const input =
  "w-full rounded border border-hairline bg-raised px-4 py-3 text-ink outline-none transition focus:border-gold/70";

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
  const [draft, setDraft] = useState<{ subject: string; title: string; body: string; images: string[] }>({ subject: "general", title: "", body: "", images: [] });
  const [newSubject, setNewSubject] = useState({ name: "", kind: "subject" as "subject" | "sub", parent: CLUBS_FOLDER as string, description: "" });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  // Phones: the Topics drop-down menu.
  const [menuOpen, setMenuOpen] = useState(false);
  const [moderator, setModerator] = useState(false);
  const [owners, setOwners] = useState<FolderOwners | null>(null);
  const [favWatches, setFavWatches] = useState<FavoriteWatch[]>([]);
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
    void loadFolderOwners().then(setOwners);
    // Brandon's Favorites folder shows the gallery watches at the top.
    supabase
      ?.from("brand_favorites")
      .select("*")
      .order("sort")
      .order("created_at")
      .then(({ data }) => setFavWatches((data ?? []) as FavoriteWatch[]));
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
    // Keep the phone menu open on a folder so its sub-folders can be picked; close it otherwise.
    const isFolder = Boolean(slug) && !slug.includes("/") && (tree.children.get(slug)?.length ?? 0) > 0;
    if (!isFolder) setMenuOpen(false);
  };

  // The main subject currently open (its sub-folders are shown), if any.
  const openFolder = subject ? parentOf(subject) ?? subject : null;
  const openFolderName = openFolder ? describeSubject(tree, openFolder).node.name : "";

  const locked = lockedSubjects(owners, user?.id, moderator);

  const openComposer = () => {
    let start = draft.subject;
    if (subject === BRANDS_FOLDER) start = `${BRANDS_FOLDER}/misc`;
    else if (subject && locked.includes(subject)) start = "general";
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
      setDraft({ subject: subjectSlug, title: "", body: "", images: [] });
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
        className={`flex items-center justify-between gap-3 rounded border px-4 py-2.5 text-left text-sm transition ${opts.indent ? "ml-5 self-stretch py-2" : "w-full"} ${
          active ? "border-gold/40 bg-gold/15 text-gold" : "border-hairline bg-surface text-ink/80 hover:bg-surface"
        }`}
      >
        <span className="min-w-0">
          <Glyph e={s.icon} className="mr-2 text-gold" />
          {s.name}
        </span>
        <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{count}</span>
      </button>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-14 lg:px-16">
      <div>
        <div>
          <span aria-hidden className="block h-px w-10 bg-gold" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">Forum</p>
          <h1 className="mt-3 font-display text-[34px] font-semibold uppercase min-[400px]:text-[40px] leading-[1.05] text-ink sm:text-6xl">
            The <span className="font-serif text-[1.15em] font-normal normal-case italic tracking-normal text-gold">Salon.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/80 sm:text-lg">
            Questions, finds, and watches for sale or wanted. Start a conversation or join one.
          </p>
          <button
            type="button"
            onClick={() => openComposer()}
            className="mt-6 inline-flex min-h-12 items-center bg-navy px-8 text-xs font-semibold uppercase tracking-[0.25em] text-on-navy shadow-card transition hover:bg-navy-deep"
          >
            + Start a thread
          </button>
          <nav aria-label="Filter threads" className="mt-8 flex flex-wrap gap-2.5">
            {[
              { label: "All", slug: "" },
              { label: "Question", slug: "general" },
              { label: "Find", slug: "new-releases" },
              { label: "For sale", slug: "for-sale" },
              { label: "Wanted", slug: "seeking-to-buy" },
            ].map((c) => {
              const on = subject === c.slug;
              return (
                <Link
                  key={c.label}
                  href={c.slug ? `/forum?subject=${c.slug}` : "/forum"}
                  scroll={false}
                  aria-current={on ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full border px-5 text-[11px] font-semibold uppercase tracking-[0.22em] transition ${
                    on ? "border-gold bg-gold text-on-gold" : "border-hairline-strong text-ink/80 hover:border-navy hover:text-ink"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <GettingStarted onNewPost={() => openComposer()} />
        <ForumSafety className="mt-6" />

        {composing ? (
          <div id="new-post" className="mt-6 scroll-mt-6">
            <ForumIdentity action="start a discussion">
              {(authorName) => (
                <form onSubmit={(e) => handlePost(e, authorName)} className="grid gap-4 rounded-md border border-hairline bg-raised shadow-card p-5 bb-sheen">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-gold">New discussion</p>
                    <p className="text-xs text-muted">
                      Posting as <span className="font-semibold text-ink">{authorName}</span>
                    </p>
                  </div>
                  <label className="space-y-2 text-sm text-ink/80">
                    Topic
                    <SubjectSelect
                      tree={tree}
                      value={draft.subject}
                      onChange={(slug) => setDraft({ ...draft, subject: slug })}
                      allowNew
                      exclude={locked}
                      className={input}
                    />
                  </label>

                  {draft.subject === NEW_SUBJECT ? (
                    <div className="grid gap-3 rounded border border-gold/40 bg-raised shadow-card p-4 bb-sheen">
                      <p className="text-sm font-semibold text-ink">Add a new topic or sub-folder</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "subject" as const, label: "New main topic" },
                          { key: "sub" as const, label: "New sub-folder inside a topic" },
                        ].map((o) => (
                          <button
                            key={o.key}
                            type="button"
                            onClick={() => setNewSubject({ ...newSubject, kind: o.key })}
                            aria-pressed={newSubject.kind === o.key}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                              newSubject.kind === o.key ? "border-gold bg-navy text-on-navy" : "border-hairline text-ink hover:bg-surface"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      {newSubject.kind === "sub" ? (
                        <label className="space-y-1 text-xs text-ink/80">
                          Put it inside
                          <select value={newSubject.parent} onChange={(e) => setNewSubject({ ...newSubject, parent: e.target.value })} className={input}>
                            {tree.top.map((t) => (
                              <option key={t.slug} value={t.slug}>
                                {t.name}
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
                            : "Topic name, e.g. Watch Photography"
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
                      <p className="text-xs text-muted">
                        {newSubject.kind === "sub"
                          ? `Creates a new sub-folder inside ${describeSubject(tree, newSubject.parent).node.name}. Your post will be its first discussion.`
                          : "Creates a new main topic everyone can post in. Your post will be its first discussion."}
                      </p>
                    </div>
                  ) : null}

                  <label className="space-y-2 text-sm text-ink/80">
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
                  <label className="space-y-2 text-sm text-ink/80">
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
                    <span className="block text-right text-xs text-muted">
                      {draft.body.length}/{BODY_MAX}
                    </span>
                  </label>
                  <PhotoPicker photos={draft.images} onChange={(images) => setDraft((d) => ({ ...d, images }))} />
                  {postError ? <p className="text-sm text-rose-700">{postError}</p> : null}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={posting}
                      className="rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-on-navy hover:bg-navy-deep disabled:opacity-60"
                    >
                      {posting ? "Posting…" : "Post"}
                    </button>
                    <button type="button" onClick={() => setComposing(false)} className="rounded-full border border-hairline px-6 py-3 text-sm font-semibold text-ink hover:bg-surface">
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
          {/* On phones the topics live in a drop-down menu that scrolls up and down. */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="forum-topics"
            className="flex w-full items-center justify-between gap-3 rounded border border-gold/40 bg-raised shadow-card px-4 py-3 text-left lg:hidden"
          >
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-[0.25em] text-gold">Topics</span>
              <span className="block truncate text-base font-semibold text-ink">
                {current ? `${current.parent ? `${current.parent.name} › ` : ""}${current.node.name}` : "All discussions"}
              </span>
            </span>
            <span aria-hidden className={`shrink-0 text-lg text-gold transition ${menuOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          <div
            id="forum-topics"
            className={`${menuOpen ? "block" : "hidden"} mt-2 max-h-[65vh] overflow-y-auto overscroll-contain rounded border border-hairline bg-raised p-2 lg:mt-0 lg:block lg:max-h-[calc(100vh-6rem)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0`}
          >
            {favorites.length ? (
              <div className="mb-5">
                <p className="mb-3 px-1 text-xs uppercase tracking-[0.3em] text-gold">★ Favorites</p>
                <nav className="flex flex-col gap-2" aria-label="Favorite forum folders">
                  {favorites.map((f) => {
                    const d = describeSubject(tree, f.subject);
                    return (
                      <div key={f.subject} className="flex w-full items-center gap-1">
                        <div className="min-w-0 flex-1 [&>button]:w-full">
                          {subjectButton({ slug: f.subject, name: d.node.name, icon: d.node.folder ? "folder" : d.node.icon })}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleNotify(f)}
                          disabled={favBusy}
                          title={f.notify ? "Alerts on: tap to turn off" : "Alerts off: tap to turn on"}
                          aria-label={`${f.notify ? "Turn off" : "Turn on"} alerts for ${d.node.name}`}
                          className={`shrink-0 rounded-full px-2 py-2 text-sm transition ${f.notify ? "text-gold" : "text-muted"} hover:bg-surface`}
                        >
                          <Glyph e={f.notify ? "🔔" : "🔕"} />
                        </button>
                      </div>
                    );
                  })}
                </nav>
              </div>
            ) : null}
            <p className="mb-3 px-1 text-xs uppercase tracking-[0.3em] text-gold">Topics</p>
            <nav className="flex flex-col gap-2" aria-label="Forum topics">
              {subjectButton({ slug: "", name: "All discussions", icon: "folder" })}
              {tree.top.map((s) => (
                <div key={s.slug} className="flex flex-col gap-2">
                  {subjectButton({ ...s, icon: s.folder || tree.children.get(s.slug)?.length ? `${openFolder === s.slug ? "folder" : "folder"}` : s.icon })}
                  {/* The open topic shows its sub-folders right under it. */}
                  {openFolder === s.slug ? (
                    <div className="flex flex-col gap-2">
                      {shownChildren.map((c) => subjectButton(c, { indent: true }))}
                      {openFolder === BRANDS_FOLDER && shownChildren.length < sortedFolderChildren.length ? (
                        <button type="button" onClick={() => setShowAllBrands(true)} className="ml-5 py-1 text-left text-xs font-semibold text-gold hover:text-gold-bright">
                          Show all {sortedFolderChildren.length} brands
                        </button>
                      ) : null}
                      {!locked.includes(s.slug) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            startAddSubfolder(s.slug);
                          }}
                          className="ml-5 py-1 text-left text-xs font-semibold text-gold hover:text-gold-bright"
                        >
                          {addLabel(s.slug)}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setDraft((d) => ({ ...d, subject: NEW_SUBJECT }));
                setNewSubject((n) => ({ ...n, kind: "subject" }));
                setComposing(true);
                setTimeout(() => document.getElementById("new-post")?.scrollIntoView({ behavior: "smooth" }), 50);
              }}
              className="mt-3 block px-1 py-1 text-xs font-semibold text-gold hover:text-gold-bright"
            >
              + Add a topic
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3">
            <div className="min-w-0">
              {current?.parent ? (
                <button type="button" onClick={() => chooseSubject(current.parent!.slug)} className="mb-1 text-xs text-muted hover:text-ink">
                  {current.parent.name} ›
                </button>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-ink">
                  {current ? (
                    <>
                      <Glyph e={current.node.icon} size={22} className="mr-2 text-gold" />
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
                  <button type="button" onClick={() => removeSubject(current.node)} className="text-xs text-muted hover:text-rose-700">
                    Remove
                  </button>
                ) : null}
              </div>
              {current?.node.description ? <p className="mt-1 text-sm text-muted">{current.node.description}</p> : null}
              {subject === "for-sale" || subject === "seeking-to-buy" ? <SalesDisclaimer className="mt-3" /> : null}
              {subject === FAVORITES_SUBJECT ? (
                <Link href="/favorites" className="mt-1 inline-block text-sm font-semibold text-gold hover:text-gold-bright">
                  <Glyph name="star" className="mr-1" /> See the Brandon&apos;s Favorites gallery →
                </Link>
              ) : null}
            </div>
            {/* Search and sort sit on their own row under the topic name so neither gets squeezed. */}
            <div className="flex gap-3">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts" aria-label="Search the forum" className={`${input} min-w-0 flex-1 sm:max-w-sm`} />
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={`${input} !w-44 shrink-0 pr-8 sm:!w-48`} aria-label="Sort">
                <option value="active">Latest activity</option>
                <option value="new">Newest</option>
                <option value="popular">Most replies</option>
              </select>
            </div>
          </div>


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
            <div className="mb-4 rounded-md border border-gold/40 bg-raised shadow-card p-5 text-sm text-ink/80 bb-sheen">
              <p className="font-semibold text-ink">No clubs yet.</p>
              <p className="mt-1">Belong to a watch club or meetup group? Add it as its own folder here so members can find events and chat.</p>
              <button type="button" onClick={() => startAddSubfolder(CLUBS_FOLDER)} className="mt-3 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-on-navy hover:bg-navy-deep">
                + Add a club
              </button>
            </div>
          ) : null}

          {subject === FAVORITES_SUBJECT && favWatches.length ? (
            <div className="mb-5 rounded-md border border-gold/40 bg-raised shadow-card p-4 sm:p-5 bb-sheen">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.25em] text-gold">From the favorites gallery</p>
                <Link href="/favorites" className="shrink-0 text-xs font-semibold text-gold hover:text-gold-bright">
                  See all →
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {favWatches.map((f) => {
                  const info = linkInfo(f.link_url);
                  const inner = (
                    <>
                      <div className={`flex aspect-[4/3] items-center justify-center overflow-hidden ${f.image_url ? "bg-surface" : "bg-raised"}`}>
                        {f.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.image_url} alt={`${f.brand} ${f.model}`} referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-muted" aria-hidden>
                            <Glyph name="watch" size={34} />
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gold">{f.brand}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5 text-ink">{f.model}</p>
                        {info ? <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold">{glyphName(info.icon) ? <Glyph e={info.icon} size={13} /> : info.icon} {info.label}</p> : null}
                      </div>
                    </>
                  );
                  return (
                    <li key={f.id} className="overflow-hidden rounded border border-hairline bg-raised transition hover:border-gold/50">
                      {f.link_url && info ? (
                        <a href={f.link_url} {...(info.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block">
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {loading ? (
            <SkeletonList label="Loading discussions" />
          ) : error ? (
            <div className="rounded-md border border-hairline bg-raised shadow-card p-10 text-center text-amber-800 bb-sheen">{error}</div>
          ) : !visible.length ? (
            <div className="border border-dashed border-hairline-strong px-6 py-14 text-center text-ink/80">
              <p className="font-serif text-4xl text-ink sm:text-5xl">{search ? "No threads match" : "No threads yet"}</p>
              {!search && subject && locked.includes(subject) ? (
                <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted">Only Brandon starts discussions here. When he does, you can reply and join in.</p>
              ) : !search ? (
                <>
                  <p className="mx-auto mt-3 max-w-md text-base leading-7">Be the first to ask a question, share a find or list a watch.</p>
                  <button
                    type="button"
                    onClick={() => openComposer()}
                    className="mt-6 inline-flex min-h-12 items-center bg-navy px-8 text-xs font-semibold uppercase tracking-[0.25em] text-on-navy hover:bg-navy-deep"
                  >
                    + Start the first thread
                  </button>
                </>
              ) : (
                <p className="mt-3 text-base">Try a different word, or clear the search.</p>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {visible.map((post) => {
                const s = describeSubject(tree, post.subject).node;
                return (
                  <li key={post.id}>
                    <Link
                      href={`/forum/${post.id}`}
                      className="group flex gap-4 rounded-md border border-hairline bg-raised shadow-card p-4 transition hover:border-gold/40 hover:bg-surface sm:p-5 bb-sheen"
                    >
                      <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded border border-hairline bg-surface text-gold sm:flex"><Glyph e={s.icon} size={20} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-gold">{subjectLabel(tree, post.subject)}</p>
                        <h3 className="mt-1 text-lg font-semibold text-ink group-hover:text-gold-bright">
                          {post.title}
                          {post.image_count ? (
                            <span className="ml-2 align-middle text-xs font-normal text-muted" title={`${post.image_count} photo${post.image_count === 1 ? "" : "s"}`}>
                              <Glyph name="camera" size={13} />{post.image_count > 1 ? ` ${post.image_count}` : ""}
                            </span>
                          ) : null}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">{post.body}</p>
                        <p className="mt-2 text-xs text-muted">
                          by <span className="text-ink/80">{post.author_name}</span> · {timeAgo(post.created_at)}
                          {post.last_activity_at !== post.created_at ? ` · active ${timeAgo(post.last_activity_at)}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-center">
                        <p className="text-xl font-semibold text-ink">{post.comment_count}</p>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-muted">{post.comment_count === 1 ? "reply" : "replies"}</p>
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
  { title: "Pick a topic and post", text: "Choose a topic, brand or club. Not listed? Add a new topic, or open any topic and tap + Add a sub-folder (or + Add a club)." },
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
    <section className="mt-6 rounded-md border border-gold/40 bg-raised shadow-card p-5 bb-sheen" aria-labelledby="forum-getting-started">
      <div className="flex items-center justify-between gap-3">
        <h2 id="forum-getting-started" className="text-xs uppercase tracking-[0.3em] text-gold">
          Getting started
        </h2>
        <button type="button" onClick={toggle} className="text-xs font-semibold text-muted hover:text-ink" aria-expanded={!hidden}>
          {hidden ? "Show" : "Hide"}
        </button>
      </div>
      {!hidden ? (
        <>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-on-navy">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/80">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-5 text-muted">
            Not sure where to start? Say hello in <span className="text-ink">General Discussion</span> or post a &ldquo;Friday wrist check&rdquo; in{" "}
            <span className="text-ink">Wrist Shots</span>. You can edit or delete your own posts any time. Please keep it friendly and respectful; moderators may remove posts that aren&apos;t.{" "}
            <button type="button" onClick={onNewPost} className="font-semibold text-gold hover:text-gold-bright">
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
    <div id="add-subfolder" className="mb-4 rounded-md border border-gold/40 bg-raised shadow-card p-5 text-sm bb-sheen">
      <p className="font-semibold text-ink">Add a {thing}</p>
      <p className="mt-1 text-muted">
        Creates a new sub-folder inside {parentName}
        {isClub ? " for your club's events and chat." : " that everyone can post in."}
      </p>
      {!signedIn ? (
        <p className="mt-3 text-ink/80">
          <Link href="/login" className="font-semibold text-gold">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-semibold text-gold">
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
          {error ? <p className="text-rose-700">{error}</p> : null}
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-on-navy hover:bg-navy-deep disabled:opacity-60">
              {busy ? "Adding…" : `Add ${thing}`}
            </button>
            <button type="button" onClick={onCancel} className="rounded-full border border-hairline px-5 py-2.5 text-sm text-ink hover:bg-surface">
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
          favorite ? "border-gold/60 bg-gold/15 text-gold" : "border-hairline bg-surface text-ink hover:bg-surface"
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
            favorite.notify ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-800" : "border-hairline bg-surface text-muted"
          }`}
        >
          <Glyph e={favorite.notify ? "🔔" : "🔕"} className="mr-1" />{favorite.notify ? "Alerts on" : "Alerts off"}
        </button>
      ) : null}
    </div>
  );
}
