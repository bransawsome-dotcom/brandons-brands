import { createClient } from "@supabase/supabase-js";
import { adminClient } from "@/lib/priceAlerts";
import { HANDLE_RE } from "@/lib/publicLists";
import { SITE_URL } from "@/lib/site";

// Someone makes an offer on a watch in a public collection (kind "buy"), or offers to sell a watch that's on
// someone's public wishlist (kind "sell"). Saved for the owner, shown in their Inbox, and emailed to them
// (reply goes straight to the sender). Text messages come later.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  // Bots fill every field; people never see this one.
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const handle = String(body.handle ?? "").toLowerCase();
  const watchId = String(body.watch_id ?? "").slice(0, 100);
  const amount = Math.round(Number(String(body.amount ?? "").replace(/[^0-9.]/g, "")));
  const name = String(body.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const sell = body.kind === "sell";
  const condition = String(body.condition ?? "").trim().slice(0, 40);
  const set = String(body.set ?? "").trim().slice(0, 40);
  const note = String(body.message ?? "").trim().slice(0, 1800);
  const message = sell ? [condition && `Condition: ${condition}`, set && `Comes with: ${set}`, note].filter(Boolean).join("\n") : note;

  if (!HANDLE_RE.test(handle) || !watchId) return bad("That watch couldn't be found.");
  if (!Number.isFinite(amount) || amount < 1 || amount > 99_999_999)
    return bad(sell ? "Enter your asking price in US dollars." : "Enter your offer in US dollars.");
  if (name.length < 2) return bad("Please enter your name.");
  if (!EMAIL_RE.test(email)) return bad("Please enter a valid email address so the owner can reply.");

  let db;
  try {
    db = adminClient();
  } catch {
    return bad("Offers aren't available right now. Please try again later.", 503);
  }

  // Who is offering (if logged in).
  let fromUserId: string | null = null;
  const auth = request.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) {
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
      auth: { persistSession: false },
    });
    const { data } = await anon.auth.getUser(auth.slice(7));
    fromUserId = data.user?.id ?? null;
  }

  // The watch must be in a public collection (buy) or on a public wishlist (sell).
  const { data: profile } = await db
    .from("public_profiles")
    .select("user_id, display_name, collection_public, wishlist_public")
    .eq("handle", handle)
    .maybeSingle();
  if (sell ? !profile?.wishlist_public : !profile?.collection_public)
    return bad(sell ? "This wishlist isn't public right now." : "This collection isn't public right now.", 404);
  if (!profile) return bad("That watch couldn't be found.", 404);
  if (fromUserId && fromUserId === profile.user_id) return bad(sell ? "This is your own wishlist." : "This is your own watch.");

  const { data: watch } = await db
    .from(sell ? "wishlist" : "watches")
    .select("id, brand, model, reference_number")
    .eq("id", watchId)
    .eq("user_id", profile.user_id)
    .maybeSingle();
  if (!watch) return bad(sell ? "That watch is no longer on this wishlist." : "That watch is no longer in this collection.", 404);

  // Limits: 5 offers an hour per email address, and one offer per watch per 10 minutes.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recent } = await db
    .from("offers")
    .select("id", { count: "exact", head: true })
    .ilike("from_email", email)
    .gte("created_at", hourAgo);
  if ((recent ?? 0) >= 5) return bad("You've sent several offers recently. Please try again later.", 429);
  const { count: dup } = await db
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("watch_id", String(watch.id))
    .ilike("from_email", email)
    .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());
  if ((dup ?? 0) > 0) return bad(sell ? "You just offered to sell this watch. They have it." : "You just made an offer on this watch. The owner has it.", 429);

  const label = `${watch.brand} ${watch.model}${watch.reference_number ? ` (Ref. ${watch.reference_number})` : ""}`.slice(0, 200);
  const { error } = await db.from("offers").insert({
    owner_id: profile.user_id,
    watch_id: String(watch.id),
    watch_label: (sell ? `Wishlist · ${label}` : label).slice(0, 200),
    amount,
    from_name: name,
    from_email: email,
    from_user_id: fromUserId,
    message,
  });
  if (error) {
    console.error("offer insert failed", error);
    return bad("Your offer couldn't be sent. Please try again.", 500);
  }

  await db.from("notifications").insert({
    user_id: profile.user_id,
    kind: sell ? "sell_offer" : "offer",
    title: (sell
      ? `Someone wants to sell you a ${watch.brand} ${watch.model} for ${usd(amount)}`
      : `Offer: ${usd(amount)} for your ${watch.brand} ${watch.model}`
    ).slice(0, 200),
    body: `From ${name} (${email})${message ? `: “${message.slice(0, 300)}”` : "."} Reply to them by email to respond.`.slice(0, 500),
    link: `/inbox?folder=offers`,
  });

  await emailOwner(db, profile.user_id, { label, amount, name, email, message, handle, sell }).catch((err) =>
    console.error("offer email failed", err),
  );

  return Response.json({ ok: true });
}

async function emailOwner(
  db: ReturnType<typeof adminClient>,
  ownerId: string,
  o: { label: string; amount: number; name: string; email: string; message: string; handle: string; sell: boolean },
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const { data } = await db.auth.admin.getUserById(ownerId);
  const user = data?.user;
  if (!user?.email) return;
  if ((user.user_metadata as Record<string, unknown> | undefined)?.offer_email === false) return;

  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const html = `<div style="background:#07111F;padding:24px;font-family:Arial,sans-serif;color:#e2e8f0">
    <p style="color:#93c5fd;letter-spacing:3px;font-size:12px;margin:0">BRANDON'S BRANDS · ${o.sell ? "OFFER TO SELL YOU A WATCH ON YOUR WISHLIST" : "NEW OFFER"}</p>
    <h1 style="color:#fff;font-size:22px;margin:8px 0 4px">${esc(o.label)}</h1>
    <p style="color:#D9A43A;font-size:28px;font-weight:700;margin:8px 0">${usd(o.amount)}${o.sell ? ' <span style="font-size:14px;color:#cbd5e1;font-weight:400">asking price</span>' : ""}</p>
    <p style="margin:0 0 6px">From <b>${esc(o.name)}</b> · <a href="mailto:${esc(o.email)}" style="color:#93c5fd">${esc(o.email)}</a></p>
    ${o.message ? `<p style="margin:12px 0;padding:12px;border-left:3px solid #D9A43A;background:#0f1b2d;color:#e2e8f0">${esc(o.message).replace(/\n/g, "<br>")}</p>` : ""}
    <p style="font-size:14px;color:#cbd5e1">To respond, just reply to this email — it goes straight to ${esc(o.name)}.</p>
    <p style="font-size:13px;color:#94a3b8;margin-top:16px">${o.sell ? "Brandon's Brands doesn't take part in sales. Ask for photos and the serial number, verify the seller, and consider an escrow or authentication service before paying." : "Brandon's Brands doesn't take part in sales. Verify the buyer, use a secure payment method and consider an escrow or authentication service before shipping."}</p>
    <p><a href="${SITE_URL}/inbox?folder=offers" style="color:#93c5fd">See all offers</a> · <a href="${SITE_URL}/collectors/${esc(o.handle)}/${o.sell ? "wishlist" : "collection"}" style="color:#93c5fd">Your public ${o.sell ? "wishlist" : "collection"}</a> · <a href="${SITE_URL}/account" style="color:#93c5fd">Turn off offer emails</a></p>
  </div>`;

  const from = process.env.OFFER_FROM || "Brandon's Brands <offers@brandonsbrands17.com>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [user.email],
      reply_to: o.email,
      subject: o.sell ? `Offer to sell you a ${o.label} for ${usd(o.amount)}` : `Offer: ${usd(o.amount)} for your ${o.label}`,
      html,
    }),
  });
  if (!res.ok) console.error("Resend error", res.status, (await res.text()).slice(0, 300));
}
