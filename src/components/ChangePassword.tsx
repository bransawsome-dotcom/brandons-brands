"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import PasswordInput from "@/components/PasswordInput";
import supabase from "@/lib/supabaseClient";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

// Account setting: change password. Asks for the current password first so an unattended,
// logged-in device can't be used to take over the account.
export default function ChangePassword() {
  const { user, guestMode } = useAuth();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  if (!user || guestMode || !user.email) return null;

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    if (next.length < 8) return setStatus({ kind: "error", text: "Your new password needs at least 8 characters." });
    if (next !== confirm) return setStatus({ kind: "error", text: "The new passwords don't match." });
    if (next === current) return setStatus({ kind: "error", text: "Choose a password different from your current one." });
    if (!supabase) return setStatus({ kind: "error", text: "Password changes aren't available right now." });

    setSaving(true);
    try {
      const check = await supabase.auth.signInWithPassword({ email: user.email!, password: current });
      if (check.error) {
        setStatus({ kind: "error", text: "Your current password isn't right. Try again, or use Forgot password on the login page." });
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) {
        setStatus({ kind: "error", text: error.message });
        return;
      }
      reset();
      setOpen(false);
      setStatus({ kind: "ok", text: "Password changed. Use your new password next time you log in." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/5 px-4 py-3">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="font-medium text-white">Password</p>
          <p className="text-xs text-slate-500">Change the password you use to log in</p>
        </div>
        {!open ? (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setStatus(null);
            }}
            className="shrink-0 rounded-full border border-[#D9A43A]/40 bg-[#D9A43A]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#D9A43A] transition hover:bg-[#D9A43A]/20"
          >
            Change password
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-sm text-slate-300">
            Current password
            <PasswordInput value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" className={input} />
          </label>
          <label className="block space-y-1.5 text-sm text-slate-300">
            New password
            <PasswordInput
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={input}
            />
          </label>
          <label className="block space-y-1.5 text-sm text-slate-300">
            Confirm new password
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Type it again"
              className={input}
            />
          </label>
          {status?.kind === "error" ? <p className="rounded-2xl bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{status.text}</p> : null}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#D9A43A] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-[#e1b54a] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save new password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
                setStatus(null);
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      {status?.kind === "ok" ? <p className="mt-3 rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{status.text}</p> : null}
    </div>
  );
}
