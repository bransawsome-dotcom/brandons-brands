"use client";

import { FormEvent, useState } from "react";

// "Get the weekly newsletter" box. Free pre-owned buying checklist as a thank-you.
export default function NewsletterSignup({ source, compact = false, className = "" }: { source: string; compact?: boolean; className?: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "already">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("sending");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, website }),
    }).catch(() => null);
    const out = (await res?.json().catch(() => ({}))) as { already?: boolean; error?: string } | undefined;
    if (!res?.ok) {
      setState("idle");
      setError(out?.error ?? "Couldn't sign you up. Please try again.");
      return;
    }
    setState(out?.already ? "already" : "done");
  };

  return (
    <section
      aria-label="Newsletter sign-up"
      className={`rounded-[2rem] border border-[#D9A43A]/30 bg-gradient-to-br from-[#D9A43A]/10 via-slate-950/60 to-[#1A7DBF]/15 ${compact ? "p-5" : "p-6 sm:p-8"} ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-[#D9A43A]">Free weekly newsletter</p>
      <h2 className={`mt-2 font-semibold text-white ${compact ? "text-lg" : "text-2xl"}`}>Brandon&apos;s week in watches, in your inbox</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
        New videos, one of Brandon&apos;s favorites, meetups, the Wrist Check of the week and the best new watches for sale. Sign up and get the{" "}
        <strong className="text-white">pre-owned watch buying checklist</strong> free.
      </p>
      {state === "done" || state === "already" ? (
        <p className="mt-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {state === "done" ? "You're in! Check your inbox for the welcome email and your free checklist." : "You're already subscribed. Thanks!"}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor={`nl-${source}`} className="sr-only">
            Email address
          </label>
          <input
            id={`nl-${source}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-slate-950/90 px-5 py-3 text-white outline-none focus:border-blue-400/70"
          />
          <input tabIndex={-1} autoComplete="off" aria-hidden value={website} onChange={(e) => setWebsite(e.target.value)} name="website" className="hidden" />
          <button
            type="submit"
            disabled={state === "sending"}
            className="shrink-0 rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#e1b54a] disabled:opacity-60"
          >
            {state === "sending" ? "Signing up…" : "Sign me up"}
          </button>
        </form>
      )}
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
      <p className="mt-3 text-[11px] text-slate-500">One email a week. Unsubscribe anytime with one click. We never sell your email.</p>
    </section>
  );
}
