"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import PasswordInput from "@/components/PasswordInput";

// The emailed reset link signs the person in for this one purpose; the Supabase
// client picks the token up from the URL automatically (detectSessionInUrl).
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setReady(true);
      }
    });

    client.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const timer = window.setTimeout(() => {
      client.auth.getSession().then(({ data }) => {
        if (!data.session) setExpired(true);
      });
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    if (!supabase) {
      setError("Unable to connect to authentication service.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    window.setTimeout(() => router.push("/dashboard"), 1500);
  };

  const inputClass =
    "w-full rounded-md border border-hairline bg-raised px-4 py-3 text-ink outline-none transition focus:border-gold/70";

  return (
    <div className="min-h-screen text-ink">
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="rounded-md border border-hairline bg-surface p-10 shadow-[0_10px_30px_rgba(43,38,32,0.08)] backdrop-blur-xl">
          <div className="mb-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Member Access</p>
            <h1 className="text-4xl font-semibold text-ink">Choose a new password</h1>
          </div>

          {done ? (
            <div className="rounded-md bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
              Password updated. Taking you to your dashboard…
            </div>
          ) : ready ? (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <label className="space-y-2 text-sm text-ink/80">
                New password
                <PasswordInput
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="space-y-2 text-sm text-ink/80">
                Confirm new password
                <PasswordInput
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="Type it again"
                />
              </label>

              {error ? <div className="rounded-md bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-gold px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-on-gold transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save new password"}
              </button>
            </form>
          ) : expired ? (
            <div className="space-y-6">
              <div className="rounded-md bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
                This reset link is invalid or has expired. Request a new one.
              </div>
              <Link href="/forgot-password" className="text-sm font-semibold text-ink hover:text-gold">
                Send a new reset link
              </Link>
            </div>
          ) : (
            <p className="text-sm text-ink/80">Checking your reset link…</p>
          )}
        </div>
      </main>
    </div>
  );
}
