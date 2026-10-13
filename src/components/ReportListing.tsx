"use client";

import { useRef, useState } from "react";

// "Report listing" on every forum post: a short form that emails the moderators.
const REASONS = ["Looks like a scam", "Fake or replica", "Wrong or misleading details", "Rude or abusive", "Spam", "Something else"];

export default function ReportListing({ postId, title, listing = true }: { postId: string; title: string; listing?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const label = listing ? "Report listing" : "Report post";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(f), reason, post_id: postId, title }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) setState("sent");
    else {
      setState("idle");
      setError(data.error ?? "Something went wrong. Please try again.");
    }
  }

  const field = "mt-1.5 w-full rounded border border-hairline-strong bg-raised px-3 py-2.5 text-[15px] text-ink focus:border-navy focus:outline-none";
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setState("idle");
          dialog.current?.showModal();
        }}
        className="inline-flex min-h-9 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted transition hover:text-rose-700"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
        </svg>
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`report-${postId}`}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-md border border-hairline bg-ground p-0 text-ink shadow-card-hover backdrop:bg-[#1b2a41]/50"
      >
        <div className="p-6">
          <h2 id={`report-${postId}`} className="font-display text-2xl font-semibold uppercase">
            {label}
          </h2>
          {state === "sent" ? (
            <div role="status" className="mt-4">
              <p className="text-sm text-ink/80">Thank you. A moderator will review it.</p>
              <button type="button" onClick={() => dialog.current?.close()} className="mt-4 inline-flex min-h-10 items-center rounded-full bg-navy px-5 text-xs font-semibold uppercase tracking-[0.2em] text-on-navy">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 grid gap-4">
              <fieldset>
                <legend className="text-[11px] uppercase tracking-[0.2em] text-muted">What&apos;s wrong?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={reason === r}
                      onClick={() => setReason(r)}
                      className={`min-h-9 rounded-full border px-3.5 text-xs transition ${reason === r ? "border-navy bg-navy text-on-navy" : "border-hairline-strong text-ink hover:border-navy"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Details (optional)
                <textarea name="details" rows={3} maxLength={1500} className={`${field} normal-case tracking-normal`} />
              </label>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Your email (optional, if you&apos;d like a reply)
                <input name="contact" type="email" maxLength={200} autoComplete="email" className={`${field} normal-case tracking-normal`} />
              </label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => dialog.current?.close()} className="min-h-10 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted hover:text-ink">
                  Cancel
                </button>
                <button type="submit" disabled={state === "sending"} className="inline-flex min-h-10 items-center rounded-full bg-navy px-5 text-xs font-semibold uppercase tracking-[0.2em] text-on-navy disabled:opacity-60">
                  {state === "sending" ? "Sending…" : "Send report"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
