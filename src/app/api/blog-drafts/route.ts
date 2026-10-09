import { AiError, requireMember } from "@/lib/watchAi";
import { adminClient } from "@/lib/priceAlerts";
import { emailDraftReady, writeWeeklyDraft } from "@/lib/blogWriter";

// "Write a new draft now" button on /blog/drafts (moderators only). Same as the Monday job, on demand,
// with an optional topic.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const userId = await requireMember(request);
    const db = adminClient();
    const { data: mod } = await db.from("forum_moderators").select("user_id").eq("user_id", userId).maybeSingle();
    if (!mod) return Response.json({ error: "Only moderators can create blog drafts." }, { status: 403 });
    const body = (await request.json().catch(() => ({}))) as { topic?: string };
    const post = await writeWeeklyDraft({ topicHint: body.topic, createdBy: "claude", signal: AbortSignal.timeout(280_000) });
    await emailDraftReady(post).catch(() => {});
    return Response.json({ ok: true, id: post.id, slug: post.slug });
  } catch (err) {
    const status = err instanceof AiError ? err.status : 500;
    return Response.json({ error: err instanceof Error ? err.message : "Couldn't write the draft." }, { status });
  }
}
