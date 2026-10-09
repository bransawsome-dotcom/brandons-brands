// Server-only: the Brandon's Brands weekly newsletter.
// Subscribers live in public.newsletter_subscribers (service key only). Emails go out through Resend.
// US anti-spam law (CAN-SPAM) requires a postal address in every newsletter, set as NEWSLETTER_POSTAL_ADDRESS in Vercel.
import { adminClient } from "@/lib/priceAlerts";
import { loadAllPosts } from "@/lib/blogDb";
import { latestYouTubeVideos } from "@/lib/youtube";
import { collabEmail, socials } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";
import { eventWhen, type SiteEvent } from "@/lib/events";

export const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;
const FROM = () => process.env.NEWSLETTER_FROM || process.env.OFFER_FROM || "Brandon's Brands <offers@brandonsbrands17.com>";
export const postalAddress = () => (process.env.NEWSLETTER_POSTAL_ADDRESS ?? "").trim();

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function shell(inner: string, token?: string): string {
  const unsub = token ? `${SITE_URL}/api/newsletter/unsubscribe?token=${token}` : `${SITE_URL}/newsletter`;
  const social = socials.map((s) => `<a href="${s.url}" style="color:#93c5fd;text-decoration:none">${esc(s.name)}</a>`).join(" · ");
  const address = postalAddress();
  return `<div style="background:#07111F;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0">
  <div style="max-width:600px;margin:0 auto">
    <a href="${SITE_URL}" style="text-decoration:none"><img src="${SITE_URL}/logo-256.png" width="56" height="56" alt="Brandon's Brands" style="border:0"></a>
    <p style="color:#93c5fd;letter-spacing:3px;font-size:12px;margin:8px 0 0">BRANDON'S BRANDS</p>
    ${inner}
    <hr style="border:0;border-top:1px solid #1e293b;margin:28px 0 16px">
    <p style="font-size:13px;color:#94a3b8;margin:0 0 8px">Follow Brandon: ${social}</p>
    <p style="font-size:12px;color:#64748b;line-height:18px;margin:0">
      You're getting this because you signed up at brandonsbrands17.com. <a href="${unsub}" style="color:#94a3b8">Unsubscribe</a> anytime.
      ${address ? `<br>Brandon's Brands · ${esc(address)}` : ""}<br>Questions? <a href="mailto:${collabEmail}" style="color:#94a3b8">${collabEmail}</a>
    </p>
  </div></div>`;
}

async function resend(body: unknown, batch = false): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email isn't set up: RESEND_API_KEY is missing in Vercel.");
  const res = await fetch(`https://api.resend.com/emails${batch ? "/batch" : ""}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Email service error ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

// Sign someone up (or re-subscribe them). Returns false if they were already subscribed.
export async function subscribe(email: string, source: string, userId?: string | null): Promise<boolean> {
  const db = adminClient();
  const clean = email.trim().toLowerCase().slice(0, 200);
  const { data: existing } = await db.from("newsletter_subscribers").select("id,token,unsubscribed_at").ilike("email", clean).maybeSingle();
  let token: string;
  if (existing) {
    if (!existing.unsubscribed_at) return false;
    await db.from("newsletter_subscribers").update({ unsubscribed_at: null, source }).eq("id", existing.id);
    token = existing.token;
  } else {
    const { data, error } = await db
      .from("newsletter_subscribers")
      .insert({ email: clean, source: source.slice(0, 40), user_id: userId ?? null })
      .select("token")
      .single();
    if (error) throw new Error(error.message);
    token = data.token;
  }
  await resend({
    from: FROM(),
    to: [clean],
    subject: "Welcome to Brandon's Brands ⌚ + your pre-owned watch checklist",
    headers: { "List-Unsubscribe": `<${SITE_URL}/api/newsletter/unsubscribe?token=${token}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    html: shell(
      `<h1 style="color:#fff;font-size:24px;margin:12px 0">Welcome to the weekly newsletter</h1>
       <p style="color:#cbd5e1;line-height:24px">Thanks for joining! Once a week you'll get Brandon's newest videos and blog posts, one of Brandon's favorites, upcoming watch events, the Wrist Check of the week and the best new watches for sale in the community.</p>
       <p style="color:#cbd5e1;line-height:24px">As promised, here's your free guide:</p>
       <p><a href="${SITE_URL}/learn/buying-pre-owned-watches-safely" style="display:inline-block;background:#D9A43A;color:#000;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Pre-owned watch buying checklist →</a></p>
       <p style="color:#cbd5e1;line-height:24px">While you're there, <a href="${SITE_URL}/collection" style="color:#93c5fd">start tracking your own collection</a> for free.</p>`,
      token,
    ),
  }).catch((e) => console.error("welcome email failed", e));
  return true;
}

export async function unsubscribe(token: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return false;
  const { data } = await adminClient()
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("token", token)
    .select("id");
  return Boolean(data?.length);
}


// This week's newsletter, built from what's new on the site.
export async function buildDigest(intro: string): Promise<{ subject: string; inner: string; count: number }> {
  const db = adminClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [posts, videos, favs, events, polls, wrists, forSale, subs] = await Promise.all([
    loadAllPosts(),
    latestYouTubeVideos(0).catch(() => []),
    db.from("brand_favorites").select("brand,model,note,post_id,image_url").order("created_at", { ascending: false }).limit(1),
    db.from("events").select("id,title,starts_at,ends_at,location,online,link,description,created_at").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3),
    db.from("polls").select("id,question,a_label,b_label").eq("active", true).order("created_at", { ascending: false }).limit(1),
    db.from("wrist_shots").select("id,display_name,watch").not("featured_at", "is", null).order("featured_at", { ascending: false }).limit(1),
    db.from("forum_posts").select("id,title").eq("subject", "for-sale").gte("created_at", weekAgo.toISOString()).order("created_at", { ascending: false }).limit(5),
    db.from("newsletter_subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null),
  ]);
  const newPosts = posts.filter((p) => new Date(`${p.date}T12:00:00Z`) >= weekAgo).slice(0, 3);
  const blogList = (newPosts.length ? newPosts : posts.slice(0, 1))
    .map((p) => `<li style="margin:0 0 10px"><a href="${SITE_URL}/blog/${p.slug}" style="color:#fff;font-weight:700;text-decoration:none">${esc(p.title)}</a><br><span style="color:#94a3b8;font-size:14px">${esc(p.excerpt)}</span></li>`)
    .join("");
  const vids = videos
    .slice(0, 3)
    .map(
      (v) =>
        `<td style="padding:4px;width:33%;vertical-align:top"><a href="${v.url}" style="text-decoration:none"><img src="${v.thumbnail}" width="180" style="width:100%;border-radius:12px;border:0" alt=""><br><span style="color:#e2e8f0;font-size:13px">${esc(v.title.replace(/\s#\S+/g, "").slice(0, 70))}</span></a></td>`,
    )
    .join("");
  const fav = favs.data?.[0];
  const section = (title: string, body: string) => `<h2 style="color:#fff;font-size:18px;margin:26px 0 10px">${title}</h2>${body}`;
  let inner = `<h1 style="color:#fff;font-size:24px;margin:12px 0">This week at Brandon's Brands</h1>`;
  if (intro.trim()) inner += `<p style="color:#cbd5e1;line-height:24px;white-space:pre-line">${esc(intro.trim())}</p>`;
  if (vids) inner += section("🎬 New from Brandon", `<table role="presentation" width="100%"><tr>${vids}</tr></table>`);
  if (blogList) inner += section("📝 On the blog", `<ul style="padding-left:18px;margin:0">${blogList}</ul>`);
  if (fav)
    inner += section(
      "⭐ One of Brandon's favorites",
      `<p style="color:#cbd5e1;line-height:24px;margin:0"><strong style="color:#fff">${esc(fav.brand)} ${esc(fav.model)}</strong>${fav.note ? ` — ${esc(fav.note)}` : ""}<br><a href="${SITE_URL}${fav.post_id ? `/forum/${fav.post_id}` : "/favorites"}" style="color:#93c5fd">See it and join the discussion →</a></p>`,
    );
  const poll = polls.data?.[0];
  if (poll)
    inner += section(
      "🗳️ Which would you pick?",
      `<p style="color:#cbd5e1;margin:0 0 8px">${esc(poll.question)}</p><p><a href="${SITE_URL}/polls#${poll.id}" style="display:inline-block;border:1px solid #D9A43A;color:#D9A43A;padding:8px 16px;border-radius:999px;text-decoration:none;margin-right:8px">${esc(poll.a_label)}</a><a href="${SITE_URL}/polls#${poll.id}" style="display:inline-block;border:1px solid #D9A43A;color:#D9A43A;padding:8px 16px;border-radius:999px;text-decoration:none">${esc(poll.b_label)}</a></p>`,
    );
  const wrist = wrists.data?.[0];
  if (wrist)
    inner += section(
      "📸 Wrist Check of the week",
      `<p style="color:#cbd5e1;margin:0">${esc(wrist.display_name)}${wrist.watch ? ` wearing ${esc(wrist.watch)}` : ""}. <a href="${SITE_URL}/wrist-check" style="color:#93c5fd">See it and post yours →</a></p>`,
    );
  if (events.data?.length)
    inner += section(
      "📅 Upcoming watch events",
      `<ul style="padding-left:18px;margin:0">${events.data
        .map((e) => `<li style="margin:0 0 8px;color:#cbd5e1"><a href="${esc(e.link ?? `${SITE_URL}/events#${e.id}`)}" style="color:#fff;font-weight:700;text-decoration:none">${esc(e.title)}</a> — ${esc(eventWhen(e as SiteEvent))}${e.location ? `, ${esc(e.location)}` : e.online ? ", online" : ""}</li>`)
        .join("")}</ul>`,
    );
  if (forSale.data?.length)
    inner += section(
      "🏷️ New in For Sale",
      `<ul style="padding-left:18px;margin:0">${forSale.data.map((p) => `<li style="margin:0 0 6px"><a href="${SITE_URL}/forum/${p.id}" style="color:#e2e8f0">${esc(p.title)}</a></li>`).join("")}</ul><p style="font-size:12px;color:#64748b">Brandon's Brands isn't a party to sales between members and doesn't hold or guarantee funds.</p>`,
    );
  inner += `<p style="margin-top:26px"><a href="${SITE_URL}" style="display:inline-block;background:#D9A43A;color:#000;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Visit brandonsbrands17.com</a></p>`;
  const subject = newPosts[0] ? `This week: ${newPosts[0].title}` : fav ? `This week: ${fav.brand} ${fav.model} and more` : "This week at Brandon's Brands";
  return { subject: subject.slice(0, 120), inner, count: subs.count ?? 0 };
}

export function digestHtml(inner: string, token?: string) {
  return shell(inner, token);
}

// Send this week's issue to everyone subscribed (or just a test to one address).
export async function sendDigest(opts: { intro: string; subject?: string; testTo?: string; sentBy?: string }): Promise<number> {
  const { subject: autoSubject, inner } = await buildDigest(opts.intro);
  const subject = (opts.subject?.trim() || autoSubject).slice(0, 120);
  if (opts.testTo) {
    await resend({ from: FROM(), to: [opts.testTo], subject: `[TEST] ${subject}`, html: shell(inner) });
    return 1;
  }
  if (!postalAddress()) throw new Error("Add NEWSLETTER_POSTAL_ADDRESS in Vercel first (US law requires a mailing address in newsletters).");
  const db = adminClient();
  let sent = 0;
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("newsletter_subscribers").select("email,token").is("unsubscribed_at", null).order("created_at").range(from, from + 999);
    if (!data?.length) break;
    for (let i = 0; i < data.length; i += 100) {
      const chunk = data.slice(i, i + 100);
      await resend(
        chunk.map((s: { email: string; token: string }) => ({
          from: FROM(),
          to: [s.email],
          subject,
          html: shell(inner, s.token),
          headers: { "List-Unsubscribe": `<${SITE_URL}/api/newsletter/unsubscribe?token=${s.token}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        })),
        true,
      );
      sent += chunk.length;
    }
    if (data.length < 1000) break;
  }
  await db.from("newsletter_issues").insert({ subject, html: shell(inner), recipients: sent, sent_by: opts.sentBy ?? null });
  return sent;
}
