"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createShareLink, getShareLink, shareUrl, stopSharing, updateShareLink, type ShareKind, type ShareLink } from "@/lib/share";

const LABELS: Record<ShareKind, { noun: string; paid: string; paidHint: string }> = {
  collection: { noun: "collection", paid: "Show what I paid", paidHint: "Purchase price and date" },
  wishlist: { noun: "wishlist", paid: "Show my target prices", paidHint: "What you'd like to pay" },
};

// Share button for the Collection and Wishlist pages: turn a read-only link on or off,
// choose what it shows, and copy or send it.
export default function ShareButton({ kind }: { kind: ShareKind }) {
  const { user, guestMode } = useAuth();
  const userId = !guestMode ? user?.id ?? null : null;
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<ShareLink | null | undefined>(undefined);
  const [options, setOptions] = useState({ show_paid: false, show_notes: false });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const label = LABELS[kind];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    setStatus(null);
    if (next && userId && link === undefined) {
      try {
        const existing = await getShareLink(kind);
        setLink(existing);
        if (existing) setOptions({ show_paid: existing.show_paid, show_notes: existing.show_notes });
      } catch (err) {
        setLink(null);
        setStatus({ ok: false, text: err instanceof Error ? err.message : "Couldn't load sharing." });
      }
    }
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setStatus(null);
    try {
      await fn();
    } catch (err) {
      setStatus({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  const turnOn = () =>
    run(async () => {
      const created = await createShareLink(kind, options);
      setLink(created);
      setStatus({ ok: true, text: "Sharing is on. Copy the link below." });
    });

  const changeOption = (patch: Partial<typeof options>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    if (link) void run(async () => updateShareLink(link.token, next));
  };

  const turnOff = () =>
    run(async () => {
      if (!link) return;
      if (!window.confirm(`Stop sharing your ${label.noun}? The current link will stop working.`)) return;
      await stopSharing(link.token);
      setLink(null);
      setStatus({ ok: true, text: "Sharing is off. The old link no longer works." });
    });

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(shareUrl(link.token));
      setStatus({ ok: true, text: "Link copied." });
    } catch {
      setStatus({ ok: false, text: "Couldn't copy. Select the link and copy it." });
    }
  };

  const nativeShare = async () => {
    if (!link) return;
    try {
      await navigator.share({ title: `My watch ${label.noun}`, url: shareUrl(link.token) });
    } catch {
      // cancelled
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share{link ? <span className="h-2 w-2 rounded-full bg-emerald-400" aria-label="Sharing is on" /> : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-left text-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <p className="font-semibold text-white">Share your {label.noun}</p>
          {!userId ? (
            <p className="mt-2 text-slate-300">
              <Link href="/signup" className="font-semibold text-[#D9A43A]">
                Create an account
              </Link>{" "}
              to share your {label.noun} with a link.
            </p>
          ) : link === undefined ? (
            <p className="mt-2 text-slate-400">Loading…</p>
          ) : (
            <>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Anyone with the link can view a read-only page of your {label.noun}: photos, models, values, and box &amp; papers. They can&apos;t
                change anything, and your email stays private.
              </p>

              <div className="mt-3 space-y-2">
                {[
                  { key: "show_paid" as const, title: label.paid, hint: label.paidHint },
                  { key: "show_notes" as const, title: "Show my notes", hint: "Your private notes on each watch" },
                ].map((o) => (
                  <label key={o.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={options[o.key]}
                      onChange={(e) => changeOption({ [o.key]: e.target.checked })}
                      disabled={busy}
                      className="mt-0.5 h-4 w-4 accent-[#D9A43A]"
                    />
                    <span>
                      <span className="block text-white">{o.title}</span>
                      <span className="block text-xs text-slate-400">{o.hint}</span>
                    </span>
                  </label>
                ))}
              </div>

              {link ? (
                <div className="mt-3 space-y-2">
                  <input
                    readOnly
                    value={shareUrl(link.token)}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200"
                    aria-label="Share link"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={copy} className="rounded-full bg-[#D9A43A] px-4 py-2 text-xs font-semibold text-black hover:bg-[#e1b54a]">
                      Copy link
                    </button>
                    {canNativeShare ? (
                      <button type="button" onClick={nativeShare} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5">
                        Send…
                      </button>
                    ) : null}
                    <a
                      href={shareUrl(link.token)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5"
                    >
                      Preview
                    </a>
                    <button type="button" onClick={turnOff} disabled={busy} className="ml-auto rounded-full px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10">
                      Stop sharing
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={turnOn}
                  disabled={busy}
                  className="mt-3 w-full rounded-full bg-[#D9A43A] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#e1b54a] disabled:opacity-60"
                >
                  {busy ? "Creating link…" : "Create share link"}
                </button>
              )}
            </>
          )}
          {status ? <p className={`mt-2 text-xs ${status.ok ? "text-emerald-300" : "text-rose-300"}`}>{status.text}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
