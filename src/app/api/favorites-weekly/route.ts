import { AiError, requireMember } from "@/lib/watchAi";
import { adminClient } from "@/lib/priceAlerts";
import { addWeeklyFavorite, emailFavoriteAdded } from "@/lib/favoritesWriter";

// "Pick this week's favorite now" on /favorites (moderators only): same as the Friday job, on demand.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const userId = await requireMember(request);
    const db = adminClient();
    const { data: mod } = await db.from("forum_moderators").select("user_id").eq("user_id", userId).maybeSingle();
    if (!mod) return Response.json({ error: "Only moderators can do this." }, { status: 403 });
    const result = await addWeeklyFavorite({ signal: AbortSignal.timeout(280_000) });
    await emailFavoriteAdded(result).catch(() => {});
    return Response.json(result);
  } catch (err) {
    const status = err instanceof AiError ? err.status : 500;
    return Response.json({ error: err instanceof Error ? err.message : "Couldn't add a favorite." }, { status });
  }
}
