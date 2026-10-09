"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ForumIdentity from "@/components/ForumIdentity";
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
  FAVORITES_SUBJECT,
  isModerator,
  listComments,
  describeSubject,
  timeAgo,
  updatePost,
  watchComments,
  type ForumComment,
  type ForumPost,
} from "@/lib/forum";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

const MAX_INDENT = 4;

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
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D9A43A] to-amber-700 text-xs font-bold text-black">
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
  onSubmit: (body: string, authorName: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ForumIdentity action="reply">
      {(authorName) => {
        const submit = async (event: FormEvent) => {
          event.preventDefault();
          if (!body.trim()) return;
          setBusy(true);
          setError(null);
          try {
            await onSubmit(body, authorName);
            setBody("");
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
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy || !body.trim()}
                className="rounded-full bg-[#D9A43A] px-5 py-2 text-sm font-semibold text-black hover:bg-[#e1b54a] disabled:opacity-50"
              >
                {busy ? "Posting…" : "Post"}
              </button>
              {onCancel ? (
                <button type="button" onClick={onCancel} className="text-sm text-slate-400 hover:text-white">
                  Cancel
                </button>
              ) : null}
              <span className="ml-auto text-xs text-slate-500">as {authorName}</span>
            </div>
          </form>
        );
      }}
    </ForumIdentity>
  );
}

export default function ForumThreadPage() {
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
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ title: "", body: "", subject: "general" });

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
  }, [userId]);

  // Notification links point at a reply (#c-…); scroll to it once replies have loaded.
  useEffect(() => {
    if (!comments.length || typeof window === "undefined" || !window.location.hash.startsWith("#c-")) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-[#D9A43A]/10", "rounded-xl");
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

  if (loading) return <div className="p-10 text-center text-slate-300">Loading discussion…</div>;
  if (error) return <div className="p-10 text-center text-amber-200">{error}</div>;
  if (!post)
    return (
      <div className="p-10 text-center text-slate-300">
        This discussion was removed or doesn&apos;t exist.{" "}
        <Link href="/forum" className="font-semibold text-[#D9A43A]">
          Back to the forum
        </Link>
      </div>
    );

  const { node: s, parent: sParent } = describeSubject(tree, post.subject);
  const canManagePost = userId === post.user_id || moderator;

  const handleComment = async (body: string, authorName: string, parentId: string | null) => {
    const created = await addComment({ post_id: post.id, parent_id: parentId, body, author_name: authorName });
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
    setEdit({ title: post.title, body: post.body, subject: post.subject });
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
      <li key={c.id} id={`c-${c.id}`} className={`scroll-mt-24 ${depth > 0 && depth <= MAX_INDENT ? "border-l border-white/10 pl-4 sm:pl-5" : ""}`}>
        <div className="flex gap-3 py-3">
          <Avatar name={c.author_name} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-white">{c.author_name}</span>
              {c.user_id === post.user_id ? (
                <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-blue-200">Author</span>
              ) : null}{" "}
              · {timeAgo(c.created_at)}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{c.body}</p>
            <div className="mt-1 flex gap-4 text-xs">
              <button type="button" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
                Reply
              </button>
              {userId && c.user_id !== userId ? (
                <Link href={messageHref(c.user_id, c.author_name)} className="text-slate-400 hover:text-white">
                  Message
                </Link>
              ) : null}
              {canDelete ? (
                <button type="button" onClick={() => handleDeleteComment(c.id)} className="text-slate-500 hover:text-rose-300">
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
                  onSubmit={(body, name) => handleComment(body, name, c.id)}
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
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/forum" className="hover:text-white">
          Forum
        </Link>{" "}
        /{" "}
        {sParent ? (
          <>
            <Link href={`/forum?subject=${sParent.slug}`} className="hover:text-white">
              {sParent.name}
            </Link>{" "}
            /{" "}
          </>
        ) : null}
        <Link href={`/forum?subject=${post.subject}`} className="hover:text-white">
          {s.name}
        </Link>
      </nav>

      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        {editing ? (
          <form onSubmit={saveEdit} className="grid gap-4">
            <SubjectSelect
              tree={tree}
              value={edit.subject}
              onChange={(slug) => setEdit({ ...edit, subject: slug })}
              exclude={moderator || edit.subject === FAVORITES_SUBJECT ? [] : [FAVORITES_SUBJECT]}
              className={input}
            />
            <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} maxLength={TITLE_MAX} className={input} required />
            <textarea value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} maxLength={BODY_MAX} rows={8} className={input} required />
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-[#D9A43A] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#e1b54a]">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-300">
              {s.icon} {sParent ? `${sParent.name} › ` : ""}
              {s.name}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-4xl">{post.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={post.author_name} />
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-white">{post.author_name}</span> · {timeAgo(post.created_at)}
                {post.updated_at ? " · edited" : ""}
                {userId && post.user_id !== userId ? (
                  <>
                    {" · "}
                    <Link href={messageHref(post.user_id, post.author_name)} className="text-[#D9A43A] hover:text-[#e1b54a]">
                      Message
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <p className="mt-5 whitespace-pre-wrap break-words text-base leading-7 text-slate-200">{post.body}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <FollowButton postId={post.id} label="discussion" />
            {canManagePost ? (
              <>
                {userId === post.user_id ? (
                  <button type="button" onClick={startEdit} className="rounded-full border border-white/15 px-4 py-2 text-slate-200 hover:bg-white/5">
                    Edit
                  </button>
                ) : null}
                <button type="button" onClick={handleDeletePost} className="rounded-full border border-rose-500/60 px-4 py-2 text-rose-200 hover:bg-rose-500/10">
                  Delete{moderator && userId !== post.user_id ? " (moderator)" : ""}
                </button>
              </>
            ) : null}
            </div>
          </>
        )}
      </article>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-8">
        <h2 className="text-lg font-semibold text-white">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </h2>
        <div className="mt-4">
          <ReplyBox placeholder="Join the discussion…" onSubmit={(body, name) => handleComment(body, name, null)} />
        </div>
        {topLevel.length ? (
          <ul className="mt-4 divide-y divide-white/5">{topLevel.map((c) => renderComment(c, 0))}</ul>
        ) : (
          <p className="mt-6 text-sm text-slate-400">No replies yet. Be the first to weigh in.</p>
        )}
      </section>
    </div>
  );
}
