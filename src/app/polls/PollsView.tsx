"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { isModerator } from "@/lib/forum";
import PollCard from "@/components/PollCard";
import type { Poll } from "@/lib/polls";

const input =
  "w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-400/70";

// The polls list, plus a "New poll" form and open/close buttons for moderators.
export default function PollsView({ initial }: { initial: Poll[] }) {
  const { user } = useAuth();
  const [polls, setPolls] = useState(initial);
  const [mod, setMod] = useState(false);
  const [form, setForm] = useState({ question: "Which would you pick?", a_label: "", a_image: "", b_label: "", b_image: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void isModerator(user?.id).then(setMod);
  }, [user?.id]);

  const reload = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("polls").select("*").order("created_at", { ascending: false }).limit(30);
    if (data) setPolls(data as Poll[]);
  };

  // The page itself may be cached for a minute; show the latest polls as soon as it opens.
  useEffect(() => {
    void Promise.resolve().then(() => reload());
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    for (const img of [form.a_image, form.b_image]) {
      if (img && !/^https:\/\//.test(img.trim())) return setError("Photos must be web addresses starting with https://");
    }
    setBusy(true);
    const { error: err } = await supabase.from("polls").insert({
      question: form.question.trim(),
      a_label: form.a_label.trim(),
      a_image: form.a_image.trim() || null,
      b_label: form.b_label.trim(),
      b_image: form.b_image.trim() || null,
    });
    setBusy(false);
    if (err) return setError(err.message);
    setForm({ question: "Which would you pick?", a_label: "", a_image: "", b_label: "", b_image: "" });
    await reload();
  };

  const toggle = async (p: Poll) => {
    if (!supabase) return;
    await supabase.from("polls").update({ active: !p.active }).eq("id", p.id);
    await reload();
  };

  return (
    <>
      {mod ? (
        <form onSubmit={create} className="mt-6 grid gap-3 rounded-[2rem] border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-5">
          <p className="text-sm font-semibold text-[#D9A43A]">New poll (only moderators see this)</p>
          <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} maxLength={140} required className={input} placeholder="Question" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <input value={form.a_label} onChange={(e) => setForm({ ...form, a_label: e.target.value })} maxLength={80} required className={input} placeholder="Watch A, e.g. Tudor Black Bay 58" />
              <input value={form.a_image} onChange={(e) => setForm({ ...form, a_image: e.target.value })} className={input} placeholder="Photo A link (optional, https://…)" />
            </div>
            <div className="grid gap-2">
              <input value={form.b_label} onChange={(e) => setForm({ ...form, b_label: e.target.value })} maxLength={80} required className={input} placeholder="Watch B, e.g. Omega Seamaster 300" />
              <input value={form.b_image} onChange={(e) => setForm({ ...form, b_image: e.target.value })} className={input} placeholder="Photo B link (optional, https://…)" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Keep it positive: two watches you&apos;d happily recommend. Share it on Instagram Stories with a link sticker to this page.</p>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button type="submit" disabled={busy} className="justify-self-start rounded-full bg-[#D9A43A] px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">
            {busy ? "Adding…" : "Add poll"}
          </button>
        </form>
      ) : null}
      {polls.length ? (
        <div className="mt-6 grid gap-5">
          {polls.map((p) => (
            <div key={p.id}>
              <PollCard poll={p} />
              {mod ? (
                <button type="button" onClick={() => void toggle(p)} className="ml-4 mt-2 text-xs text-slate-400 hover:text-white">
                  {p.active ? "Close voting" : "Reopen voting"}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-slate-300">The first poll is coming soon.</p>
      )}
    </>
  );
}
