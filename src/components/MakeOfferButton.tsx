"use client";

import { createPortal } from "react-dom";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { accountName } from "@/lib/account";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

const CONDITIONS = ["New / unworn", "Excellent", "Very good", "Good", "Fair"];
const SETS = ["Full set (box & papers)", "Box only", "Papers only", "Watch only"];

// "Make an offer" on a watch in a public collection (kind "buy"), or "Offer to sell" a watch on someone's
// public wishlist (kind "sell"). Anyone can send one with their name and email; it goes to the owner's Inbox
// and email (texts later), and the owner replies by email.
export default function MakeOfferButton({
  handle,
  watchId,
  watchLabel,
  kind = "buy",
}: {
  handle: string;
  watchId: string;
  watchLabel: string;
  kind?: "buy" | "sell";
}) {
  const sell = kind === "sell";
  const [condition, setCondition] = useState("");
  const [set, setSet] = useState("");
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSending(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/offers", {
        method: "POST",
        headers,
        body: JSON.stringify({ kind, handle, watch_id: watchId, amount, name, email, message, website, condition, set }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Your offer couldn't be sent. Please try again.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your offer couldn't be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSent(false);
          setError(null);
          // Fill in what we know for logged-in members.
          if (user) {
            setName((n) => n || accountName(user));
            setEmail((e) => e || user.email || "");
          }
        }}
        className={`w-full rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${
          sell
            ? "border border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] text-white hover:from-[#2290D6] hover:to-[#136AA6]"
            : "bg-[#D9A43A] text-black hover:bg-[#e1b54a]"
        }`}
      >
        {sell ? "Offer to sell" : "Make an offer"}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={sell ? `Offer to sell a ${watchLabel}` : `Make an offer on ${watchLabel}`}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#0B1626] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-blue-300">{sell ? "Offer to sell" : "Make an offer"}</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{watchLabel}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="shrink-0 rounded-full px-2 text-xl text-slate-400 hover:text-white">
                ×
              </button>
            </div>

            {sent ? (
              <div className="mt-5 space-y-4">
                <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {sell
                    ? `Your offer to sell was sent. If they're interested, they'll reply to ${email}.`
                    : `Your offer was sent. If the owner is interested, they'll reply to ${email}.`}
                </p>
                <button type="button" onClick={() => setOpen(false)} className="w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <label className="block space-y-1.5 text-sm text-slate-300">
                  {sell ? "Your asking price (US dollars)" : "Your offer (US dollars)"}
                  <span className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      inputMode="numeric"
                      placeholder="10,000"
                      className={`${input} pl-8`}
                    />
                  </span>
                </label>
                {sell ? (
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1.5 text-sm text-slate-300">
                      Condition
                      <select value={condition} onChange={(e) => setCondition(e.target.value)} required className={input}>
                        <option value="" disabled>
                          Choose…
                        </option>
                        {CONDITIONS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-1.5 text-sm text-slate-300">
                      Comes with
                      <select value={set} onChange={(e) => setSet(e.target.value)} required className={input}>
                        <option value="" disabled>
                          Choose…
                        </option>
                        {SETS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}
                <label className="block space-y-1.5 text-sm text-slate-300">
                  Your name
                  <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" className={input} />
                </label>
                <label className="block space-y-1.5 text-sm text-slate-300">
                  Your email
                  <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" autoComplete="email" className={input} />
                </label>
                <label className="block space-y-1.5 text-sm text-slate-300">
                  Message (optional)
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder={sell ? "Year, reference, service history, where you're located…" : "Anything the owner should know"}
                    className={input}
                  />
                </label>
                {/* Hidden from people; catches bots. */}
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  name="website"
                />
                <p className="text-xs leading-5 text-slate-400">
                  {sell
                    ? "They'll see your name, email and message so they can reply. Brandon's Brands doesn't take part in sales: share photos, verify the buyer, and use a secure payment method or escrow."
                    : "The owner sees your name, email and message so they can reply. Brandon's Brands doesn't take part in sales: verify the seller and the watch, and use a secure payment method."}
                </p>
                {error ? <p className="rounded-2xl bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-full bg-[#D9A43A] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-[#e1b54a] disabled:opacity-60"
                >
                  {sending ? "Sending…" : sell ? "Send offer to sell" : "Send offer"}
                </button>
              </form>
            )}
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
