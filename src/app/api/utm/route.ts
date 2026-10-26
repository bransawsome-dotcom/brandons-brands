import { adminClient } from "@/lib/priceAlerts";
import { requireModerator } from "@/lib/moderatorAuth";
import { AiError } from "@/lib/watchAi";

// UTM tracking (free alternative to Vercel's paid UTM report).
// POST: the site records one visit that arrived with utm_* tags (sent once per browser session by UtmTracker).
// GET:  moderators only, totals by source / medium / campaign for the last `days` days (default 7).
export const dynamic = "force-dynamic";

const clean = (v: unknown, max = 100) =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~\-/ ]/g, "")
    .slice(0, max);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const row = {
    source: clean(body.source),
    medium: clean(body.medium),
    campaign: clean(body.campaign),
    content: clean(body.content),
    term: clean(body.term),
    landing_path: clean(body.path, 200),
    referrer_host: clean(body.ref, 100),
  };
  // Nothing to record without a source.
  if (!row.source) return Response.json({ ok: true, skipped: true });
  try {
    const { error } = await adminClient().from("utm_visits").insert(row);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (err) {
    console.error("utm record failed", err);
    // Never break the page for a tracking failure.
    return Response.json({ ok: false }, { status: 200 });
  }
}

type Row = { source: string; medium: string; campaign: string; landing_path: string; created_at: string };

export async function GET(request: Request) {
  try {
    await requireModerator(request);
    const days = Math.min(Math.max(parseInt(new URL(request.url).searchParams.get("days") ?? "7", 10) || 7, 1), 365);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await adminClient()
      .from("utm_visits")
      .select("source, medium, campaign, landing_path, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    const tally = (key: (r: Row) => string) => {
      const m = new Map<string, number>();
      for (const r of rows) m.set(key(r) || "(none)", (m.get(key(r) || "(none)") ?? 0) + 1);
      return [...m.entries()].map(([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits);
    };
    return Response.json({
      days,
      since,
      total: rows.length,
      bySource: tally((r) => r.source),
      bySourceMedium: tally((r) => `${r.source} / ${r.medium || "(none)"}`),
      byCampaign: tally((r) => r.campaign),
      byLandingPage: tally((r) => r.landing_path),
    });
  } catch (err) {
    const status = err instanceof AiError ? err.status : 500;
    return Response.json({ error: err instanceof Error ? err.message : "Something went wrong." }, { status });
  }
}
