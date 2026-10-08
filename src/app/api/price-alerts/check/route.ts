import { AiError, errorResponse, requireMember } from "@/lib/watchAi";
import { adminClient, checkItem, targetOf, type AlertItem } from "@/lib/priceAlerts";

// "Check now" for one of the member's own wishlist watches.
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const userId = await requireMember(request);
    const { id } = (await request.json().catch(() => ({}))) as { id?: string };
    if (!id) throw new AiError("Missing watch.", 400);
    const db = adminClient();
    const { data, error } = await db
      .from("wishlist")
      .select("id,user_id,brand,model,reference_number,target_price,alert_checked_at")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new AiError("That watch isn't on your wishlist.", 404);
    if (!targetOf(data as AlertItem)) throw new AiError("Set a target price first.", 400);
    const last = data.alert_checked_at ? new Date(data.alert_checked_at).getTime() : 0;
    if (Date.now() - last < 10 * 60 * 1000) throw new AiError("Just checked. Try again in a few minutes.", 429);
    const result = await checkItem(db, data as AlertItem, AbortSignal.timeout(110_000));
    if (result.error) throw new AiError(`Couldn't finish the search. Please try again. (${result.error})`, 502);
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
