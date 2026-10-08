import { runDailyChecks } from "@/lib/priceAlerts";

// Runs once a day from the Vercel schedule in vercel.json. Vercel sends "Authorization: Bearer <CRON_SECRET>".
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const results = await runDailyChecks({ budgetMs: 180_000, concurrency: 4 });
    const summary = {
      checked: results.length,
      newMatches: results.reduce((n, r) => n + r.added, 0),
      errors: results.filter((r) => r.error).map((r) => ({ id: r.id, error: r.error })),
    };
    console.log("price alerts", JSON.stringify(summary));
    return Response.json(summary);
  } catch (err) {
    console.error("price alerts failed", err);
    return Response.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
