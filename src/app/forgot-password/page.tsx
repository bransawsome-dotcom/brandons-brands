"use client";

import Link from "next/link";
import { useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Unable to connect to authentication service.");
      return;
    }

    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Member Access</p>
            <h1 className="text-4xl font-semibold text-white">Reset your password</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                If an account exists for {email.trim()}, a reset link is on its way. Check your inbox and spam folder.
              </div>
              <Link href="/login" className="text-sm font-semibold text-white hover:text-blue-200">
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <label className="space-y-2 text-sm text-slate-300">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="name@example.com"
                />
              </label>

              {error ? <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>

              <Link href="/login" className="text-sm font-semibold text-white hover:text-blue-200">
                ← Back to login
              </Link>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
