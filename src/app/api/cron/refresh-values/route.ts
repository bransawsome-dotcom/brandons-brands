import { runValueRefresh } from "@/lib/valueRefresh";

// Runs once a day from the Vercel schedule in vercel.json: refreshes today's retail price and
// market value for collection and wishlist watches. Vercel sends "Authorization: Bearer <CRON_SECRET>".
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const { results, remaining } = await runValueRefresh({ budgetMs: 200_000, concurrency: 5 });
    const summary = {
      refreshed: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      remaining,
    };
    console.log("value refresh", JSON.stringify(summary));
    return Response.json(summary);
  } catch (err) {
    console.error("value refresh failed", err);
    return Response.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
