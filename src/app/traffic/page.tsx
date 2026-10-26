"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { isModerator } from "@/lib/forum";

// Moderators: where visitors came from, by UTM tag. Free alternative to Vercel's paid UTM report.
// Tag links like https://brandonsbrands17.com/?utm_source=youtube&utm_medium=shorts&utm_campaign=ressence

type Tally = { name: string; visits: number };
type Summary = { days: number; total: number; bySource: Tally[]; bySourceMedium: Tally[]; byCampaign: Tally[]; byLandingPage: Tally[] };

async function authHeader(): Promise<Record<string, string>> {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

function Table({ title, rows }: { title: string; rows: Tally[] }) {
  return (
    <div className="rounded-md border border-hairline bg-raised p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No visits yet.</p>
      ) : (
        <table className="mt-2 w-full text-sm">
          <tbody>
            {rows.slice(0, 25).map((r) => (
              <tr key={r.name} className="border-t border-hairline">
                <td className="py-1.5 pr-3 text-ink">{r.name}</td>
                <td className="py-1.5 text-right font-semibold text-ink">{r.visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function TrafficPage() {
  const { user, loading } = useRequireAuth();
  const [mod, setMod] = useState<boolean | null>(null);
  const [days, setDays] = useState(7);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) void isModerator(user?.id).then(setMod);
  }, [loading, user?.id]);

  useEffect(() => {
    if (!mod) return;
    let live = true;
    void (async () => {
      const res = await fetch(`/api/utm?days=${days}`, { headers: await authHeader() }).catch(() => null);
      const out = await res?.json().catch(() => null);
      if (!live) return;
      if (!res?.ok) {
        setError(out?.error ?? "Couldn't load traffic sources.");
        setData(null);
      } else {
        setError(null);
        setData(out);
      }
    })();
    return () => {
      live = false;
    };
  }, [mod, days]);

  if (loading || mod === null) return <p className="px-2 py-10 text-muted">Loading…</p>;
  if (!mod) return <p className="px-2 py-10 text-ink/80">Only moderators can see traffic sources.</p>;

  return (
    <div className="mx-auto w-full max-w-5xl px-0 py-4 sm:px-6 sm:py-8">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Traffic</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Where visitors came from</h1>
      <p className="mt-2 text-sm leading-6 text-ink/80">
        Counts visits that landed with UTM tags (for example <code>?utm_source=youtube&amp;utm_medium=shorts&amp;utm_campaign=ressence</code>) or on a /from/ page.
        One count per visitor per browser session.
      </p>
      <div className="mt-4 flex gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-full border px-3 py-1 text-sm ${d === days ? "border-gold text-gold" : "border-hairline text-ink/80"}`}
          >
            Last {d} days
          </button>
        ))}
      </div>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {data ? (
        <>
          <p className="mt-4 text-sm text-ink">
            <strong className="text-gold">{data.total}</strong> tagged visit{data.total === 1 ? "" : "s"} in the last {data.days} days
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Table title="Source" rows={data.bySource} />
            <Table title="Source / medium" rows={data.bySourceMedium} />
            <Table title="Campaign" rows={data.byCampaign} />
            <Table title="Landing page" rows={data.byLandingPage} />
          </div>
        </>
      ) : null}
    </div>
  );
}
