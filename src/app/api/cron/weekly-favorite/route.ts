import { addWeeklyFavorite, emailFavoriteAdded } from "@/lib/favoritesWriter";

// Every Friday (vercel.json): Claude reviews Brandon's latest videos and adds one watch to Brandon's Favorites
// (which also starts its discussion in the Brandon's Favorites forum folder). Vercel sends "Authorization: Bearer <CRON_SECRET>".
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const result = await addWeeklyFavorite({ signal: AbortSignal.timeout(280_000) });
    await emailFavoriteAdded(result).catch((err) => console.error("favorite email failed", err));
    console.log("weekly favorite", JSON.stringify(result));
    return Response.json(result);
  } catch (err) {
    console.error("weekly favorite failed", err);
    return Response.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
