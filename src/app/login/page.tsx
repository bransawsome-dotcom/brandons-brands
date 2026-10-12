"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import PasswordInput from "@/components/PasswordInput";

// Where to go after logging in: ?next=/inbox?member=… (same-site paths only).
function nextPath(): string {
  if (typeof window === "undefined") return "/dashboard";
  const next = new URLSearchParams(window.location.search).get("next") ?? "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath());
    }
  }, [loading, user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    if (!supabase) {
      setSubmitting(false);
      setMessage("Unable to connect to authentication service.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push(nextPath());
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="rounded-md border border-hairline bg-surface p-10 shadow-[0_10px_30px_rgba(27,42,65,0.08)] backdrop-blur-xl">
          <div className="mb-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Member Access</p>
            <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Login to Brandon&apos;s Brands</h1>
            <p className="max-w-2xl text-sm leading-7 text-ink/80">
              Secure access for your private watch collection, wishlist, and account dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6">
            <label className="space-y-2 text-sm text-ink/80">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-md border border-hairline bg-raised px-4 py-3 text-ink outline-none transition focus:border-gold/70"
                placeholder="name@example.com"
              />
            </label>
            <label className="space-y-2 text-sm text-ink/80">
              Password
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-md border border-hairline bg-raised px-4 py-3 text-ink outline-none transition focus:border-gold/70"
                placeholder="Enter your password"
              />
              <span className="block text-right">
                <a href="/forgot-password" className="text-sm font-semibold text-gold hover:text-gold">
                  Forgot password?
                </a>
              </span>
            </label>

            {message ? <div className="rounded-md bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{message}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-navy px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                signInGuest();
                router.push("/dashboard");
              }}
              className="rounded-full border border-hairline bg-surface px-6 py-4 text-sm font-semibold text-ink uppercase tracking-[0.18em] transition hover:bg-surface"
            >
              Continue as Guest
            </button>

            <p className="text-sm text-muted">
              New to Brandon&apos;s Brands? <a href="/signup" className="font-semibold text-ink hover:text-gold">Create an account</a>.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
