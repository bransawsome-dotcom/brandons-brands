"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
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

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Member Access</p>
            <h1 className="text-4xl font-semibold text-white">Login to Brandon&apos;s Brands</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              Secure access for your private watch collection, wishlist, and account dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6">
            <label className="space-y-2 text-sm text-slate-300">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="name@example.com"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="Enter your password"
              />
            </label>

            {message ? <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{message}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                signInGuest();
                router.push("/dashboard");
              }}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white uppercase tracking-[0.18em] transition hover:bg-white/10"
            >
              Continue as Guest
            </button>

            <p className="text-sm text-slate-400">
              New to Brandon&apos;s Brands? <a href="/signup" className="font-semibold text-white hover:text-blue-200">Create an account</a>.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
