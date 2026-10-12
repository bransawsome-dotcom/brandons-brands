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
    <div className="min-h-screen text-ink">
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="rounded-md border border-hairline bg-surface p-10 shadow-[0_10px_30px_rgba(27,42,65,0.08)] backdrop-blur-xl">
          <div className="mb-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Member Access</p>
            <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Reset your password</h1>
            <p className="max-w-2xl text-sm leading-7 text-ink/80">
              Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="rounded-md bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                If an account exists for {email.trim()}, a reset link is on its way. Check your inbox and spam folder.
              </div>
              <Link href="/login" className="text-sm font-semibold text-ink hover:text-gold">
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <label className="space-y-2 text-sm text-ink/80">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-hairline bg-raised px-4 py-3 text-ink outline-none transition focus:border-gold/70"
                  placeholder="name@example.com"
                />
              </label>

              {error ? <div className="rounded-md bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-navy px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>

              <Link href="/login" className="text-sm font-semibold text-ink hover:text-gold">
                ← Back to login
              </Link>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
