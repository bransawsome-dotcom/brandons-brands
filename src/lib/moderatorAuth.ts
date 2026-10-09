// Server-only: check that an API request comes from a signed-in moderator (Rochelle, Brandon).
import { AiError, requireMember } from "@/lib/watchAi";
import { adminClient } from "@/lib/priceAlerts";

export async function requireModerator(request: Request): Promise<{ userId: string; email: string | null }> {
  const userId = await requireMember(request);
  const db = adminClient();
  const { data: mod } = await db.from("forum_moderators").select("user_id").eq("user_id", userId).maybeSingle();
  if (!mod) throw new AiError("Only moderators can do this.", 403);
  const { data } = await db.auth.admin.getUserById(userId);
  return { userId, email: data?.user?.email ?? null };
}
