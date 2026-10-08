"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";

// Account setting: email me when a wishlist price alert finds a match (on by default).
export default function PriceAlertEmailSetting({
  metaKey = "price_alert_email",
  title = "🏷️ Price alert emails",
  description = "When a wishlist watch is listed at or below your target price, it always shows in your Inbox. Also email me at",
}: { metaKey?: string; title?: string; description?: string } = {}) {
  const { user, guestMode } = useAuth();
  const savedOn = (user?.user_metadata as Record<string, unknown> | undefined)?.[metaKey] !== false;
  const [override, setOverride] = useState<boolean | null>(null);
  const on = override ?? savedOn;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || guestMode) return null;

  const toggle = async () => {
    if (!supabase) return;
    const next = !on;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ data: { [metaKey]: next } });
    setSaving(false);
    if (err) setError(err.message);
    else setOverride(next);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}{" "}
            <span className="text-slate-300">{user.email}</span>.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={title.replace(/^\S+\s/, "")}
          disabled={saving}
          onClick={toggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${on ? "bg-[#1A7DBF]" : "bg-white/15"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
