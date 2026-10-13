import { collabEmail } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";

// "Ask Brandon": a visitor's question, emailed to Brandon's collab inbox. Replying answers the visitor directly.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;
const ASK_TOPICS = ["Buying advice", "A listing I found", "My collection", "Collab", "Something else"] as const;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// A light per-server limit: 3 questions per email address every 10 minutes.
const recent = new Map<string, number[]>();

function bad(error: string, status = 400) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true }); // bots

  const name = String(body.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const topic = ASK_TOPICS.find((t) => t === body.topic) ?? "Buying advice";
  const question = String(body.question ?? "").trim().slice(0, 2000);
  const page = String(body.page ?? "").slice(0, 200);

  if (name.length < 2) return bad("Please enter your name.");
  if (!EMAIL_RE.test(email)) return bad("Please enter a valid email so Brandon can reply.");
  if (question.length < 10) return bad("Please write a little more about your question.");

  const key = email.toLowerCase();
  const now = Date.now();
  const times = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (times.length >= 3) return bad("You've sent a few questions just now. Please try again in a few minutes.", 429);
  recent.set(key, [...times, now]);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return bad(`Questions can't be sent right now. Please email ${collabEmail}.`, 503);
  const from = process.env.NEWSLETTER_FROM || process.env.OFFER_FROM || "Brandon's Brands <offers@brandonsbrands17.com>";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;background:#f1ece3;padding:24px;color:#1b2a41">
  <p style="letter-spacing:3px;font-size:12px;color:#7a5c30;margin:0">ASK BRANDON · ${esc(topic.toUpperCase())}</p>
  <h2 style="margin:8px 0 16px">${esc(name)} has a question</h2>
  <p style="white-space:pre-wrap;line-height:22px;background:#f8f5ef;border:1px solid #d8cebe;padding:16px">${esc(question)}</p>
  <p style="font-size:13px;color:#6a6155">Reply to this email to answer ${esc(name)} at ${esc(email)}.${page ? ` Sent from ${esc(SITE_URL + page)}.` : ""}</p>
</div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [collabEmail], reply_to: email, subject: `Ask Brandon: ${topic} from ${name}`.slice(0, 150), html }),
  }).catch(() => null);
  if (!res?.ok) {
    console.error("ask email failed", res?.status, res && (await res.text()).slice(0, 200));
    return bad(`Your question couldn't be sent. Please email ${collabEmail}.`, 502);
  }
  return Response.json({ ok: true });
}
