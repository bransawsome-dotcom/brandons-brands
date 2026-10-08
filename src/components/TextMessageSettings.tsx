"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";

type SmsSettings = {
  sms_phone?: string;
  sms_opt_in?: boolean;
  sms_opt_in_at?: string | null;
};

// Turns what the member typed into +15551234567 form. US numbers can be typed any way;
// other countries need a leading +.
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function formatPhone(e164?: string): string {
  if (!e164) return "";
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

// Phone number and permission for text message notifications, saved on the member's account.
export default function TextMessageSettings() {
  const { user, guestMode, loading } = useAuth();
  const saved = (user?.user_metadata ?? {}) as SmsSettings;
  const [phone, setPhone] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setPhone(formatPhone(saved.sms_phone));
    setOptIn(Boolean(saved.sms_opt_in));
    // Only re-sync when the account itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) return null;

  if (!user || guestMode) {
    return (
      <div className="rounded-3xl bg-white/5 px-4 py-3">
        <p className="font-medium text-white">Text message notifications</p>
        <p className="mt-1 text-slate-400">
          <Link href="/signup" className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
            Create an account
          </Link>{" "}
          to add a phone number for text notifications.
        </p>
      </div>
    );
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    const normalized = normalizePhone(phone);
    if (normalized === null) {
      setStatus({ kind: "error", text: "Enter a 10-digit US number, or include + and the country code." });
      return;
    }
    if (optIn && !normalized) {
      setStatus({ kind: "error", text: "Add a phone number to turn on text notifications." });
      return;
    }
    if (!supabase) {
      setStatus({ kind: "error", text: "Settings can't be saved right now." });
      return;
    }
    setSaving(true);
    const wasOptedIn = Boolean(saved.sms_opt_in);
    const { error } = await supabase.auth.updateUser({
      data: {
        sms_phone: normalized,
        sms_opt_in: optIn,
        // Keep a record of when permission was given (or withdrawn).
        sms_opt_in_at: optIn ? (wasOptedIn && saved.sms_phone === normalized ? saved.sms_opt_in_at : new Date().toISOString()) : null,
        sms_opt_out_at: !optIn && wasOptedIn ? new Date().toISOString() : undefined,
      },
    });
    setSaving(false);
    if (error) {
      setStatus({ kind: "error", text: error.message });
      return;
    }
    setPhone(formatPhone(normalized));
    setStatus({
      kind: "ok",
      text: optIn ? "Saved. Text notifications are on." : normalized ? "Saved. Text notifications are off." : "Saved.",
    });
  };

  const changed = normalizePhone(phone) !== (saved.sms_phone ?? "") || optIn !== Boolean(saved.sms_opt_in);

  return (
    <form onSubmit={handleSave} className="space-y-4 rounded-3xl bg-white/5 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-white">Text message notifications</p>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${
            saved.sms_opt_in ? "bg-emerald-500/15 text-emerald-200" : "bg-white/5 text-slate-400"
          }`}
        >
          {saved.sms_opt_in ? "On" : "Off"}
        </span>
      </div>

      <label className="block space-y-2">
        <span className="text-slate-300">Mobile phone number</span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          className={input}
        />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
        <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#D9A43A]" />
        <span className="text-xs leading-5 text-slate-300">
          <span className="block text-sm font-semibold text-white">Yes, text me notifications</span>
          I agree to receive text messages from Brandon&apos;s Brands at this number, such as forum replies and account updates. Message
          frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for help. Consent is not a condition of
          any purchase. You can turn this off here at any time.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || !changed}
          className="rounded-full bg-[#D9A43A] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {status ? <span className={`text-sm ${status.kind === "ok" ? "text-emerald-300" : "text-rose-300"}`}>{status.text}</span> : null}
      </div>
    </form>
  );
}
