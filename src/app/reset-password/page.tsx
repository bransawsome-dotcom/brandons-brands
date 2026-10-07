"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

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
    "w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Member Access</p>
            <h1 className="text-4xl font-semibold text-white">Choose a new password</h1>
          </div>

          {done ? (
            <div className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Password updated. Taking you to your dashboard…
            </div>
          ) : ready ? (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <label className="space-y-2 text-sm text-slate-300">
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Confirm new password
                <input
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="Type it again"
                />
              </label>

              {error ? <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save new password"}
              </button>
            </form>
          ) : expired ? (
            <div className="space-y-6">
              <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                This reset link is invalid or has expired. Request a new one.
              </div>
              <Link href="/forgot-password" className="text-sm font-semibold text-white hover:text-blue-200">
                Send a new reset link
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-300">Checking your reset link…</p>
          )}
        </div>
      </main>
    </div>
  );
}
