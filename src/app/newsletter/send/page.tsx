"use client";

import { useCallback, useEffect, useState } from "react";
import { useRequireAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { isModerator } from "@/lib/forum";

// Moderators: preview this week's newsletter, send a test to yourself, then send it to everyone.

async function authHeader(): Promise<Record<string, string>> {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

export default function NewsletterSendPage() {
  const { user, loading } = useRequireAuth();
  const [mod, setMod] = useState<boolean | null>(null);
  const [intro, setIntro] = useState("");
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState<{ subject: string; html: string; subscribers: number; addressReady: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!loading) void isModerator(user?.id).then(setMod);
  }, [loading, user?.id]);

  const load = useCallback(async (introText: string) => {
    setBusy("Building preview…");
    const res = await fetch(`/api/newsletter/send?intro=${encodeURIComponent(introText)}`, { headers: await authHeader() }).catch(() => null);
    const out = await res?.json().catch(() => null);
    setBusy(null);
    if (!res?.ok) return setNote({ ok: false, text: out?.error ?? "Couldn't build the preview." });
    setPreview(out);
  }, []);

  useEffect(() => {
    if (mod) void Promise.resolve().then(() => load(""));
  }, [mod, load]);

  const send = async (test: boolean) => {
    setNote(null);
    setBusy(test ? "Sending a test to you…" : "Sending to all subscribers…");
    const res = await fetch("/api/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ intro, subject, test }),
    }).catch(() => null);
    const out = await res?.json().catch(() => null);
    setBusy(null);
    setConfirm(false);
    if (!res?.ok) return setNote({ ok: false, text: out?.error ?? "Couldn't send." });
    setNote({ ok: true, text: test ? `Test sent to ${out.to}.` : `Sent to ${out.sent} subscriber${out.sent === 1 ? "" : "s"}.` });
  };

  if (loading || mod === null) return <p className="px-2 py-10 text-muted">Loading…</p>;
  if (!mod) return <p className="px-2 py-10 text-ink/80">Only moderators can send the newsletter.</p>;

  return (
    <div className="mx-auto w-full max-w-5xl px-0 py-4 sm:px-6 sm:py-8">
      <section className="rounded-md border border-hairline bg-surface p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Newsletter</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Send this week&apos;s newsletter</h1>
        <p className="mt-2 text-sm leading-6 text-ink/80">
          It fills itself in from what&apos;s new on the site: Brandon&apos;s latest videos and blog posts, the newest favorite, the current poll, the Wrist Check of the
          week, upcoming events and new For Sale posts. Add a short note from Brandon at the top, send yourself a test, then send it to everyone.
        </p>
        {preview ? (
          <p className="mt-3 text-sm text-ink">
            <strong className="text-gold">{preview.subscribers}</strong> subscriber{preview.subscribers === 1 ? "" : "s"}
          </p>
        ) : null}
        {preview && !preview.addressReady ? (
          <p className="mt-3 rounded-xl bg-amber-400/10 px-3 py-2 text-sm text-amber-800">
            Before sending to everyone: US law (CAN-SPAM) requires a mailing address in every newsletter. Add it in Vercel as NEWSLETTER_POSTAL_ADDRESS (a PO box is
            fine). Test emails work without it.
          </p>
        ) : null}
        <div className="mt-5 grid gap-3">
          <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            Subject (leave empty to use: {preview?.subject ?? "…"})
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              className="w-full rounded border border-hairline bg-raised px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-gold/70"
            />
          </label>
          <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            A note from Brandon (optional, shown at the top)
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={4}
              maxLength={1500}
              className="w-full rounded border border-hairline bg-raised px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-gold/70"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void load(intro)} disabled={Boolean(busy)} className="rounded-full border border-hairline px-4 py-2 text-sm text-ink hover:bg-surface">
              Refresh preview
            </button>
            <button type="button" onClick={() => void send(true)} disabled={Boolean(busy)} className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink hover:bg-surface">
              Send a test to me
            </button>
            {confirm ? (
              <span className="flex items-center gap-2 text-sm text-ink">
                Send to all {preview?.subscribers ?? 0}?
                <button type="button" onClick={() => void send(false)} disabled={Boolean(busy)} className="rounded-full bg-gold px-4 py-2 font-semibold text-on-gold">
                  Yes, send
                </button>
                <button type="button" onClick={() => setConfirm(false)} className="text-muted hover:text-ink">
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirm(true)}
                disabled={Boolean(busy) || !preview?.addressReady || !preview?.subscribers}
                className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-on-gold hover:bg-gold-bright disabled:opacity-40"
              >
                Send to everyone
              </button>
            )}
          </div>
          {busy ? <p className="animate-pulse text-sm text-gold">{busy}</p> : null}
          {note ? <p className={`text-sm ${note.ok ? "text-emerald-800" : "text-rose-700"}`}>{note.text}</p> : null}
        </div>
      </section>
      {preview ? (
        <section className="mt-6 overflow-hidden rounded-md border border-hairline">
          <iframe title="Newsletter preview" srcDoc={preview.html} className="h-[900px] w-full border-0 bg-surface" sandbox="" />
        </section>
      ) : null}
    </div>
  );
}
