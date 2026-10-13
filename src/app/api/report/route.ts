import { collabEmail } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";

// "Report listing": a member or visitor flags a forum post. Emailed to the moderators' inbox with a link.
export const dynamic = "force-dynamic";

const REASONS = ["Looks like a scam", "Fake or replica", "Wrong or misleading details", "Rude or abusive", "Spam", "Something else"];
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const recent = new Map<string, number[]>();

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });
  const postId = String(body.post_id ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
  const title = String(body.title ?? "").trim().slice(0, 200);
  const reason = REASONS.find((r) => r === body.reason) ?? "Something else";
  const details = String(body.details ?? "").trim().slice(0, 1500);
  const contact = String(body.contact ?? "").trim().slice(0, 200);
  if (!postId) return Response.json({ error: "That post couldn't be found." }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (times.length >= 5) return Response.json({ error: "You've sent several reports just now. Please try again soon." }, { status: 429 });
  recent.set(ip, [...times, now]);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ error: `Reports can't be sent right now. Please email ${collabEmail}.` }, { status: 503 });
  const from = process.env.NEWSLETTER_FROM || process.env.OFFER_FROM || "Brandon's Brands <offers@brandonsbrands17.com>";
  const link = `${SITE_URL}/forum/${postId}`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;background:#f1ece3;padding:24px;color:#1b2a41">
  <p style="letter-spacing:3px;font-size:12px;color:#7a5c30;margin:0">FORUM REPORT · ${esc(reason.toUpperCase())}</p>
  <h2 style="margin:8px 0 12px">${esc(title || "A forum post")} was reported</h2>
  ${details ? `<p style="white-space:pre-wrap;line-height:22px;background:#fffefb;border:1px solid #d0cdc5;padding:16px">${esc(details)}</p>` : ""}
  <p><a href="${link}" style="color:#1b2a41">Open the post</a></p>
  ${contact ? `<p style="font-size:13px;color:#5d6570">Reporter's contact: ${esc(contact)}</p>` : ""}
</div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [collabEmail], subject: `Forum report: ${reason}`.slice(0, 150), html, ...(contact.includes("@") ? { reply_to: contact } : {}) }),
  }).catch(() => null);
  if (!res?.ok) return Response.json({ error: `Your report couldn't be sent. Please email ${collabEmail}.` }, { status: 502 });
  return Response.json({ ok: true });
}
