import { adminClient } from "@/lib/priceAlerts";
import { postalAddress, sendDigest } from "@/lib/newsletter";

// Every Thursday (vercel.json), after the week's blog post publishes: send the weekly newsletter to every subscriber.
// It's built from what's new on the site (videos, blog, one of Brandon's favorites, poll, Wrist Check, events, For Sale).
// Vercel sends "Authorization: Bearer <CRON_SECRET>". Moderators can still send one by hand at /newsletter/send.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Not allowed" }, { status: 401 });
  }
  try {
    const db = adminClient();
    // Never send twice in one week (for example if someone already sent this week's issue by hand).
    const since = new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString();
    const { data: recent } = await db.from("newsletter_issues").select("sent_at").gt("recipients", 0).gte("sent_at", since).limit(1);
    if (recent?.length) {
      console.log("weekly newsletter skipped", JSON.stringify({ reason: "already sent this week", at: recent[0].sent_at }));
      return Response.json({ skipped: "already sent this week" });
    }
    const { count } = await db.from("newsletter_subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null);
    if (!count) {
      console.log("weekly newsletter skipped", JSON.stringify({ reason: "no subscribers yet" }));
      return Response.json({ skipped: "no subscribers yet" });
    }
    if (!postalAddress()) throw new Error("NEWSLETTER_POSTAL_ADDRESS is missing in Vercel (US law requires a mailing address in newsletters).");
    const sent = await sendDigest({ intro: "" });
    console.log("weekly newsletter sent", JSON.stringify({ sent }));
    return Response.json({ sent });
  } catch (err) {
    console.error("weekly newsletter failed", err);
    return Response.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
