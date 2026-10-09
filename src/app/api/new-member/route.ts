import { adminClient } from "@/lib/priceAlerts";
import { collabEmail } from "@/lib/socials";

// "New member joined" email to the site team, sent once right after someone signs up.
// The sign-up page calls this with the new account's id. To stop anyone triggering it with a made-up or old id,
// the account must really exist, be less than 15 minutes old, and not have been announced already.
// Recipient: NEW_MEMBER_NOTIFY_TO (comma-separated) in Vercel, otherwise the collab address.
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const userId = String(body.user_id ?? "");
  if (!UUID_RE.test(userId)) return Response.json({ ok: true });

  let db: ReturnType<typeof adminClient>;
  try {
    db = adminClient();
  } catch {
    return Response.json({ ok: true });
  }
  const { data } = await db.auth.admin.getUserById(userId);
  const user = data?.user;
  if (!user?.email) return Response.json({ ok: true });
  const created = new Date(user.created_at).getTime();
  if (!created || Date.now() - created > 15 * 60 * 1000) return Response.json({ ok: true });
  const app = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (app.new_member_notified) return Response.json({ ok: true });

  // Mark first so a double call can't send two emails.
  await db.auth.admin.updateUserById(userId, { app_metadata: { ...app, new_member_notified: new Date().toISOString() } });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ ok: true });
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const when = (iso: unknown) =>
    iso ? new Date(String(iso)).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET" : "—";
  const name = String(meta.account_name ?? "").trim() || "(no name)";

  const html = `<div style="background:#07111F;padding:24px;font-family:Arial,sans-serif;color:#e2e8f0">
    <p style="color:#93c5fd;letter-spacing:3px;font-size:12px;margin:0">BRANDON'S BRANDS · NEW MEMBER</p>
    <h1 style="color:#fff;font-size:22px;margin:8px 0 12px">${esc(name)} just joined</h1>
    <table style="font-size:14px;color:#e2e8f0;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Email</td><td>${esc(user.email)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Signed up</td><td>${when(user.created_at)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Agreed to Terms</td><td>${when(meta.terms_accepted_at)}${meta.terms_version ? ` (version ${esc(meta.terms_version)})` : ""}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Agreed to email sharing</td><td>${when(meta.email_share_consent_at)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Email confirmed</td><td>${user.email_confirmed_at ? "Yes" : "Not yet (confirmation email sent)"}</td></tr>
    </table>
    <p style="font-size:13px;color:#94a3b8;margin-top:16px">Full details: Supabase → Authentication → Users.</p>
  </div>`;

  const to = (process.env.NEW_MEMBER_NOTIFY_TO || collabEmail).split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.OFFER_FROM || "Brandon's Brands <offers@brandonsbrands17.com>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: `New member: ${name}`, html }),
  });
  if (!res.ok) console.error("Resend error (new member)", res.status, (await res.text()).slice(0, 300));
  return Response.json({ ok: true });
}
