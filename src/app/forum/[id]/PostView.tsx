"use client";

import { SkeletonPost } from "@/components/Skeleton";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import FollowBrandon from "@/components/FollowBrandon";
import ForumIdentity from "@/components/ForumIdentity";
import SalesDisclaimer from "@/components/SalesDisclaimer";
import VideoEmbed from "@/components/VideoEmbed";
import PhotoPicker from "@/components/PhotoPicker";
import PhotoGallery from "@/components/PhotoGallery";
import { videoEmbed } from "@/lib/video";
import FollowButton from "@/components/FollowButton";
import { SubjectSelect, useSubjectTree } from "@/components/ForumSubjects";
import {
  BODY_MAX,
  COMMENT_MAX,
  TITLE_MAX,
  addComment,
  deleteComment,
  deletePost,
  getPost,
  isModerator,
  loadFolderOwners,
  lockedSubjects,
  type FolderOwners,
  listComments,
  describeSubject,
  timeAgo,
  updatePost,
  watchComments,
  type ForumComment,
  type ForumPost,
} from "@/lib/forum";

const input =
  "w-full rounded border border-hairline bg-raised px-4 py-3 text-ink outline-none transition focus:border-gold/70";

const MAX_INDENT = 4;

// Turn web addresses in a post into links (e.g. the video link in a Brandon's Favorites discussion).
function linkify(text: string): React.ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
    if (!/^https?:\/\//.test(part)) return part;
    const url = part.replace(/[.,!?)]+$/, "");
    const rest = part.slice(url.length);
    const internal = url.startsWith("https://brandonsbrands17.com");
    return (
      <span key={i}>
        <a
          href={internal ? url.replace("https://brandonsbrands17.com", "") || "/" : url}
          {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer nofollow" })}
          className="break-all font-semibold text-gold underline-offset-2 hover:underline"
        >
          {url}
        </a>
        {rest}
      </span>
    );
  });
}

function messageHref(userId: string, name: string) {
  return `/inbox?to=${encodeURIComponent(userId)}&name=${encodeURIComponent(name)}`;
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-700 text-xs font-bold text-on-gold">
      {initials || "?"}
    </div>
  );
}

function ReplyBox({
  placeholder,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  placeholder: string;
  onSubmit: (body: string, authorName: string, images: string[]) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ForumIdentity action="reply">
      {(authorName) => {
        const submit = async (event: FormEvent) => {
          event.preventDefault();
          if (!body.trim() && !photos.length) return;
          setBusy(true);
          setError(null);
          try {
            await onSubmit(body, authorName, photos);
            setBody("");
            setPhotos([]);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't post that.");
          } finally {
            setBusy(false);
          }
        };
        return (
          <form onSubmit={submit} className="space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={COMMENT_MAX}
              rows={3}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className={input}
            />
            <PhotoPicker photos={photos} onChange={setPhotos} compact />
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy || (!body.trim() && !photos.length)}
                className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-on-gold hover:bg-gold-bright disabled:opacity-50"
              >
                {busy ? "Posting…" : "Post"}
              </button>
              {onCancel ? (
                <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
                  Cancel
                </button>
              ) : null}
              <span className="ml-auto text-xs text-muted">as {authorName}</span>
            </div>
          </form>
        );
      }}
    </ForumIdentity>
  );
}

export default function PostView() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { tree } = useSubjectTree();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moderator, setModerator] = useState(false);
  const [owners, setOwners] = useState<FolderOwners | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState<{ title: string; body: string; subject: string; images: string[] }>({ title: "", body: "", subject: "general", images: [] });

  const loadComments = useCallback(async () => {
    try {
      setComments(await listComments(id));
    } catch {
      // keep what we have; the main load shows errors
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await getPost(id);
        setPost(p);
        if (p) setComments(await listComments(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load this discussion.");
      } finally {
        setLoading(false);
      }
    })();
    return watchComments(id, () => void loadComments());
  }, [id, loadComments]);

  useEffect(() => {
    void isModerator(userId).then(setModerator);
    void loadFolderOwners().then(setOwners);
  }, [userId]);

  // Notification links point at a reply (#c-…); scroll to it once replies have loaded.
  useEffect(() => {
    if (!comments.length || typeof window === "undefined" || !window.location.hash.startsWith("#c-")) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-gold/10", "rounded-xl");
    }
  }, [comments.length]);

  const children = useMemo(() => {
    const map = new Map<string | null, ForumComment[]>();
    for (const c of comments) {
      const key = c.parent_id && comments.some((x) => x.id === c.parent_id) ? c.parent_id : null;
      map.set(key, [...(map.get(key) ?? []), c]);
    }
    return map;
  }, [comments]);

  if (loading) return <SkeletonPost label="Loading discussion" />;
  if (error) return <div className="p-10 text-center text-amber-800">{error}</div>;
  if (!post)
    return (
      <div className="p-10 text-center text-ink/80">
        This discussion was removed or doesn&apos;t exist.{" "}
        <Link href="/forum" className="font-semibold text-gold">
          Back to the forum
        </Link>
      </div>
    );

  const { node: s, parent: sParent } = describeSubject(tree, post.subject);
  const canManagePost = userId === post.user_id || moderator;

  const handleComment = async (body: string, authorName: string, parentId: string | null, images: string[] = []) => {
    const created = await addComment({ post_id: post.id, parent_id: parentId, body, author_name: authorName, images });
    setComments((cur) => (cur.some((c) => c.id === created.id) ? cur : [...cur, created]));
    setReplyTo(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment? Replies to it will be removed too.")) return;
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete that.");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this whole discussion and all its replies?")) return;
    try {
      await deletePost(post.id);
      router.push(`/forum?subject=${post.subject}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete that.");
    }
  };

  const startEdit = () => {
    setEdit({ title: post.title, body: post.body, subject: post.subject, images: post.images ?? [] });
    setEditing(true);
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updatePost(post.id, edit);
      setPost({ ...post, ...edit, updated_at: new Date().toISOString() });
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't save that.");
    }
  };

  const renderComment = (c: ForumComment, depth: number): React.ReactNode => {
    const replies = children.get(c.id) ?? [];
    const canDelete = userId === c.user_id || moderator;
    return (
      <li key={c.id} id={`c-${c.id}`} className={`scroll-mt-24 ${depth > 0 && depth <= MAX_INDENT ? "border-l border-hairline pl-4 sm:pl-5" : ""}`}>
        <div className="flex gap-3 py-3">
          <Avatar name={c.author_name} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">
              <span className="font-semibold text-ink">{c.author_name}</span>
              {c.user_id === post.user_id ? (
                <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-gold">Author</span>
              ) : null}{" "}
              · {timeAgo(c.created_at)}
            </p>
            {c.body !== "📷" || !c.images?.length ? <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{c.body}</p> : null}
            <PhotoGallery photos={c.images} alt={`Photo from ${c.author_name}`} small className="mt-2" />
            <div className="mt-1 flex gap-4 text-xs">
              <button type="button" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="font-semibold text-gold hover:text-gold-bright">
                Reply
              </button>
              {userId && c.user_id !== userId ? (
                <Link href={messageHref(c.user_id, c.author_name)} className="text-muted hover:text-ink">
                  Message
                </Link>
              ) : null}
              {canDelete ? (
                <button type="button" onClick={() => handleDeleteComment(c.id)} className="text-muted hover:text-rose-700">
                  Delete
                </button>
              ) : null}
            </div>
            {replyTo === c.id ? (
              <div className="mt-3">
                <ReplyBox
                  placeholder={`Reply to ${c.author_name}…`}
                  autoFocus
                  onCancel={() => setReplyTo(null)}
                  onSubmit={(body, name, images) => handleComment(body, name, c.id, images)}
                />
              </div>
            ) : null}
          </div>
        </div>
        {replies.length ? <ul>{replies.map((r) => renderComment(r, depth + 1))}</ul> : null}
      </li>
    );
  };

  const topLevel = children.get(null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-6 sm:py-14">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/forum" className="hover:text-ink">
          Forum
        </Link>{" "}
        /{" "}
        {sParent ? (
          <>
            <Link href={`/forum?subject=${sParent.slug}`} className="hover:text-ink">
              {sParent.name}
            </Link>{" "}
            /{" "}
          </>
        ) : null}
        <Link href={`/forum?subject=${post.subject}`} className="hover:text-ink">
          {s.name}
        </Link>
      </nav>

      <article className="rounded-md border border-hairline bg-surface p-5 shadow-[0_10px_30px_rgba(43,38,32,0.08)] backdrop-blur-xl sm:p-8">
        {editing ? (
          <form onSubmit={saveEdit} className="grid gap-4">
            <SubjectSelect
              tree={tree}
              value={edit.subject}
              onChange={(slug) => setEdit({ ...edit, subject: slug })}
              exclude={lockedSubjects(owners, userId, moderator).filter((x) => x !== edit.subject)}
              className={input}
            />
            <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} maxLength={TITLE_MAX} className={input} required />
            <textarea value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} maxLength={BODY_MAX} rows={8} className={input} required />
            <PhotoPicker photos={edit.images} onChange={(images) => setEdit((cur) => ({ ...cur, images }))} />
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-on-gold hover:bg-gold-bright">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-hairline px-5 py-2.5 text-sm text-ink">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">
              {s.icon} {sParent ? `${sParent.name} › ` : ""}
              {s.name}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-4xl">{post.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={post.author_name} />
              <p className="text-sm text-muted">
                <span className="font-semibold text-ink">{post.author_name}</span> · {timeAgo(post.created_at)}
                {post.updated_at ? " · edited" : ""}
                {userId && post.user_id !== userId ? (
                  <>
                    {" · "}
                    <Link href={messageHref(post.user_id, post.author_name)} className="text-gold hover:text-gold-bright">
                      Message
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            {(() => {
              // Play the first video linked in the post (e.g. Brandon's review on a favorite) right here.
              const first = (post.body.match(/https:\/\/[^\s)]+/g) ?? []).map((u) => videoEmbed(u)).find(Boolean);
              return first ? <VideoEmbed embed={first} title={post.title} className="mt-5" /> : null;
            })()}
            <p className="mt-5 whitespace-pre-wrap break-words text-base leading-7 text-ink">{linkify(post.body)}</p>
            <PhotoGallery photos={post.images} alt={post.title} className="mt-5" />
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <FollowButton postId={post.id} label="discussion" />
            {canManagePost ? (
              <>
                {userId === post.user_id ? (
                  <button type="button" onClick={startEdit} className="rounded-full border border-hairline px-4 py-2 text-ink hover:bg-surface">
                    Edit
                  </button>
                ) : null}
                <button type="button" onClick={handleDeletePost} className="rounded-full border border-rose-500/60 px-4 py-2 text-rose-700 hover:bg-rose-500/10">
                  Delete{moderator && userId !== post.user_id ? " (moderator)" : ""}
                </button>
              </>
            ) : null}
            </div>
          </>
        )}
      </article>
      {post.subject === "for-sale" || post.subject === "seeking-to-buy" ? <SalesDisclaimer className="mt-4" /> : null}

      <section className="mt-8 rounded-md border border-hairline bg-surface p-5 sm:p-8">
        <h2 className="text-lg font-semibold text-ink">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </h2>
        <div className="mt-4">
          <ReplyBox placeholder="Join the discussion…" onSubmit={(body, name, images) => handleComment(body, name, null, images)} />
        </div>
        {topLevel.length ? (
          <ul className="mt-4 divide-y divide-hairline">{topLevel.map((c) => renderComment(c, 0))}</ul>
        ) : (
          <p className="mt-6 text-sm text-muted">No replies yet. Be the first to weigh in.</p>
        )}
      </section>

      <FollowBrandon className="mt-8" />
    </div>
  );
}
