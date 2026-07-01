"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
    } else {
      setMessage("Check your email for confirmation to complete sign up.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Create Account</p>
            <h1 className="text-4xl font-semibold text-white">Join Brandon&apos;s Brands</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              Create a secure watch collection profile and keep your luxury wishlist private.
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
                placeholder="Create a password"
              />
            </label>

            {message ? <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-amber-300">{message}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Sign Up"}
            </button>

            <p className="text-sm text-slate-400">
              Already have an account? <a href="/login" className="font-semibold text-white hover:text-blue-200">Login instead</a>.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
