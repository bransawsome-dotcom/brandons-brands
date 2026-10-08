"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { forumName, saveForumName } from "@/lib/forum";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

// Shows what a visitor needs before they can post: log in, then pick a forum name.
// Renders children only when the member is ready to post.
export default function ForumIdentity({ children, action = "post" }: { children: (name: string) => React.ReactNode; action?: string }) {
  const { user, guestMode, loading } = useAuth();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-slate-300">
        {guestMode ? "Guest mode can read the forum. " : ""}
        <Link href="/login" className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
          Log in
        </Link>{" "}
        or{" "}
        <Link href="/signup" className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
          create a free account
        </Link>{" "}
        to {action}.
      </div>
    );
  }

  const name = forumName(user);
  if (name) return <>{children(name)}</>;

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveForumName(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that name.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-3 rounded-2xl border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-4">
      <p className="text-sm font-semibold text-white">Choose your forum name</p>
      <p className="text-xs text-slate-400">This is shown on everything you post. Your email stays private.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={40} placeholder="e.g. SubmarinerSteve" className={input} required />
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black hover:bg-[#e1b54a] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save name"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}
