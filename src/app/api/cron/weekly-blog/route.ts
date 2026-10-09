import { emailDraftReady, writeWeeklyDraft } from "@/lib/blogWriter";

// Every Monday morning (vercel.json): Claude writes this week's blog post and social media drafts,
// saves them as drafts and emails a "ready to review" link. Vercel sends "Authorization: Bearer <CRON_SECRET>".
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const post = await writeWeeklyDraft({ signal: AbortSignal.timeout(280_000) });
    await emailDraftReady(post).catch((err) => console.error("blog draft email failed", err));
    console.log("weekly blog draft", post.slug);
    return Response.json({ ok: true, slug: post.slug });
  } catch (err) {
    console.error("weekly blog failed", err);
    return Response.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
