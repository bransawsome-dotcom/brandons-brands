"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { followedSubjects, isFollowingPost, setFollowPost, setFollowSubject } from "@/lib/inbox";

// Follow a discussion or a whole subject. New activity goes to the member's inbox (Forum folder).
export default function FollowButton({ postId, subject, label }: { postId?: string; subject?: string; label?: string }) {
  const { user, guestMode } = useAuth();
  const userId = !guestMode ? user?.id ?? null : null;
  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const check = postId ? isFollowingPost(userId, postId) : followedSubjects(userId).then((list) => list.includes(subject ?? ""));
    void check.then((v) => !cancelled && setFollowing(v));
    return () => {
      cancelled = true;
    };
  }, [userId, postId, subject]);

  if (!userId || following === null) return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (postId) await setFollowPost(postId, !following);
      else if (subject) await setFollowSubject(subject, !following);
      setFollowing(!following);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      title={following ? "You'll get inbox alerts for new activity. Click to stop." : "Get inbox alerts for new activity"}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition disabled:opacity-60 ${
        following ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
      }`}
    >
      {following ? "✓ Following" : `+ Follow${label ? ` ${label}` : ""}`}
    </button>
  );
}
