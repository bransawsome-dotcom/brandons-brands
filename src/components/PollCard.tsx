"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { voterId, type Poll, type PollResults } from "@/lib/polls";

// One poll: tap a watch to vote, see what everyone picked. Positive only: no "loser", just percentages.
export default function PollCard({ poll, className = "" }: { poll: Poll; className?: string }) {
  const [r, setR] = useState<PollResults | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let live = true;
    void supabase.rpc("poll_results", { p_poll: poll.id, p_voter: voterId() }).then(({ data }) => {
      if (live && data) setR(data as PollResults);
    });
    return () => {
      live = false;
    };
  }, [poll.id]);

  const vote = async (choice: 0 | 1) => {
    if (!supabase || busy || !poll.active) return;
    setBusy(true);
    const { data } = await supabase.rpc("poll_vote", { p_poll: poll.id, p_choice: choice, p_voter: voterId() });
    setBusy(false);
    if (data) setR(data as PollResults);
  };

  const voted = r?.mine === 0 || r?.mine === 1;
  const total = (r?.a ?? 0) + (r?.b ?? 0);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const side = (i: 0 | 1) => {
    const label = i === 0 ? poll.a_label : poll.b_label;
    const image = i === 0 ? poll.a_image : poll.b_image;
    const n = i === 0 ? r?.a ?? 0 : r?.b ?? 0;
    const mine = r?.mine === i;
    return (
      <button
        key={i}
        type="button"
        onClick={() => void vote(i)}
        disabled={busy || !poll.active}
        aria-pressed={mine}
        className={`group relative flex min-w-0 flex-1 flex-col overflow-hidden rounded border text-left transition ${
          mine ? "border-gold bg-gold/10" : "border-hairline bg-raised hover:border-gold/60"
        }`}
      >
        {image ? (
          <span className="flex h-36 items-center justify-center bg-surface p-2 sm:h-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={label} referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain" />
          </span>
        ) : null}
        <span className="relative block p-3">
          {voted ? <span className="absolute inset-y-0 left-0 bg-gold/25" style={{ width: `${pct(n)}%` }} aria-hidden /> : null}
          <span className="relative flex items-center justify-between gap-2">
            <span className="font-semibold text-ink">{label}</span>
            {voted ? <span className="text-sm font-semibold text-gold">{pct(n)}%</span> : null}
          </span>
          {mine ? <span className="relative text-xs text-gold">Your pick ✓</span> : null}
        </span>
      </button>
    );
  };

  return (
    <article id={poll.id} className={`scroll-mt-24 rounded-md border border-hairline bg-surface p-5 sm:p-6 ${className}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Which would you pick?</p>
      <h3 className="mt-1 text-xl font-semibold text-ink">{poll.question}</h3>
      <div className="mt-4 flex gap-3">{[side(0), side(1)]}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          {!poll.active ? "Voting closed · " : ""}
          {voted || !poll.active ? `${total} vote${total === 1 ? "" : "s"}` : "Tap a watch to vote and see the results"}
        </span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(`${window.location.origin}/polls#${poll.id}`).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="rounded-full border border-hairline px-3 py-1 text-ink hover:bg-surface"
        >
          {copied ? "Link copied" : "Share poll"}
        </button>
      </div>
    </article>
  );
}
