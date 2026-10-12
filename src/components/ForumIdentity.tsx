"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { forumName, saveForumName } from "@/lib/forum";

const input =
  "w-full rounded border border-hairline bg-raised px-4 py-3 text-ink outline-none transition focus:border-gold/70";

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
      <div className="rounded border border-hairline bg-surface px-4 py-4 text-sm text-ink/80">
        {guestMode ? "Guest mode can read the forum. " : ""}
        <Link href="/login" className="font-semibold text-gold hover:text-gold-bright">
          Log in
        </Link>{" "}
        or{" "}
        <Link href="/signup" className="font-semibold text-gold hover:text-gold-bright">
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
    <form onSubmit={handleSave} className="space-y-3 rounded border border-gold/30 bg-gold/5 p-4">
      <p className="text-sm font-semibold text-ink">Choose your forum name</p>
      <p className="text-xs text-muted">This is shown on everything you post. Your email stays private.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={40} placeholder="e.g. SubmarinerSteve" className={input} required />
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-on-gold hover:bg-gold-bright disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save name"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
