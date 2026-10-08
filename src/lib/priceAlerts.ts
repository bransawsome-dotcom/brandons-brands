// Server-only: daily wishlist price alerts. Searches for each watch with an alert on, saves listings at or
// below the member's target price, and notifies them (inbox, plus email once RESEND_API_KEY is set).
// Never import this from a client component.
import Anthropic from "@anthropic-ai/sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AiError, getAnthropic } from "@/lib/watchAi";
import { SITE_URL } from "@/lib/site";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

export type AlertItem = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  reference_number: string | null;
  target_price: string | number | null;
};

export type Listing = {
  title: string;
  url: string;
  price: number | null;
  currency: string;
  price_usd: number | null;
  seller: string;
  marketplace: string;
  location: string;
  condition: string;
  box_papers: string;
};

export type CheckResult = { id: string; found: number; added: number; error?: string };

// Admin database access for the daily check (bypasses row security, so server only).
export function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) {
    throw new AiError("Price alerts aren't set up yet: SUPABASE_SERVICE_ROLE_KEY is missing in Vercel.", 503);
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function targetOf(item: Pick<AlertItem, "target_price">): number | null {
  const n = parseFloat(String(item.target_price ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

const listingSchema = {
  type: "object" as const,
  properties: {
    listings: {
      type: "array",
      description: "Watches currently for sale at or below the target price. Empty list if none found.",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Listing title as shown" },
          url: { type: "string", description: "Direct URL of the individual listing page, exactly as found. Never invent one." },
          price: { type: ["number", "null"], description: "Asking price in the listing's own currency" },
          currency: { type: "string", description: "ISO currency code, e.g. USD, EUR, GBP" },
          price_usd: { type: ["number", "null"], description: "Asking price converted to USD (include shipping only if shown as part of the price)" },
          seller: { type: "string", description: "Seller or dealer name, empty string if not shown" },
          marketplace: { type: "string", description: "Website, e.g. Chrono24, eBay, Bob's Watches, WatchBox, a dealer's own site" },
          location: { type: "string", description: "Where the watch/seller is located (city, state/region, country) as shown, else empty string" },
          condition: { type: "string", description: "e.g. New/unworn, Pre-owned excellent; empty if not shown" },
          box_papers: { type: "string", description: "e.g. 'Box & papers', 'Papers only', 'Watch only'; empty if not shown" },
          verified_active: {
            type: "boolean",
            description: "true only if you opened this listing page with web_fetch just now and it is still for sale at this price (not ended, sold, out of stock or redirected to another item)",
          },
        },
        required: ["title", "url", "price", "currency", "price_usd", "seller", "marketplace", "location", "condition", "box_papers", "verified_active"],
      },
    },
    ended_previous: {
      type: "array",
      items: { type: "string" },
      description: "URLs from the previously found listings that are no longer for sale (ended, sold, removed, or now redirect to a different page). Empty list if all are still for sale or none were given.",
    },
  },
  required: ["listings", "ended_previous"],
};

// Search the web for current listings of this watch at or below the target price.
export async function findListings(
  item: AlertItem,
  target: number,
  signal?: AbortSignal,
  previous: string[] = [],
): Promise<{ listings: Listing[]; ended: string[] }> {
  const anthropic = getAnthropic();
  const watch = `${item.brand} ${item.model}${item.reference_number ? ` (reference ${item.reference_number})` : ""}`;
  const prompt = [
    `Find watches currently for sale: ${watch}.`,
    `Target price: ${target} USD or less.`,
    `Search marketplaces and dealers (for example Chrono24, eBay, WatchBox, Bob's Watches, Crown & Caliber, Jomashop, authorized and reputable pre-owned dealers).`,
    `Only include listings that are available right now, are this exact watch${item.reference_number ? " and reference" : ""}, show a real asking price, and cost ${target} USD or less after converting to USD.`,
    `Exclude sold or ended listings, "price on request", auctions without a buy-now price, parts, replicas, straps or accessories.`,
    `Search results are often out of date: listings that ended or sold months ago still appear. Before reporting a listing, open its page with web_fetch and keep it only if the page shows it is still for sale (not "Ended", "Sold", "no longer available", out of stock, or redirected to a different item). Use the price and details shown on the page itself.`,
    `Report at most 5 of the cheapest verified listings with the record_listings tool, giving each listing's own page URL. If nothing matches, call record_listings with an empty list.`,
    previous.length
      ? `These listings were found earlier. Open each with web_fetch and put any that are no longer for sale (ended, sold, removed, or redirecting to a search or different page) in ended_previous:\n${previous.map((u) => `- ${u}`).join("\n")}`
      : "",
  ].filter(Boolean).join("\n");

  const tools = [
    { type: "web_search_20250305" as const, name: "web_search" as const, max_uses: 5 },
    { type: "web_fetch_20250910" as const, name: "web_fetch" as const, max_uses: 8 + previous.length, max_content_tokens: 6000 },
    { name: "record_listings", description: "Record matching listings for sale.", input_schema: listingSchema },
  ];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < 5; turn++) {
    const response = await anthropic.messages.create({ model: MODEL, max_tokens: 4000, tools, messages }, { signal });
    const recorded = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "record_listings",
    );
    if (recorded) {
      const input = recorded.input as { listings?: (Listing & { verified_active?: boolean })[]; ended_previous?: string[] };
      const cleaned = cleanListings((input.listings ?? []).filter((l) => l.verified_active !== false), target);
      // Double-check each link ourselves; drop anything that has ended, sold or redirected.
      const live = await Promise.all(cleaned.map((l) => stillListed(l.url)));
      const prevSet = new Set(previous);
      const ended = (input.ended_previous ?? []).filter((u) => prevSet.has(u));
      return { listings: cleaned.filter((_, i) => live[i] !== false), ended };
    }
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "pause_turn") {
      messages.push({ role: "user", content: "Now call record_listings with what you found (an empty list if nothing matches)." });
    }
  }
  return { listings: [], ended: [] };
}

const GONE_TEXT =
  /\bENDED\b|This (listing|item) (sold|has sold|has ended|was ended|ended|is no longer available)|listing (has )?ended|no longer available|item (is|has been) sold|\bSOLD OUT\b|out of stock|this item is unavailable|watch (has been|was) sold|sold on (Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i;

// Is this listing page still up? true = looks live, false = ended/sold/redirected, null = couldn't tell.
export async function stillListed(url: string): Promise<boolean | null> {
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (res.status === 404 || res.status === 410) return false;
    if (res.status >= 300 && res.status < 400) {
      const to = res.headers.get("location") ?? "";
      try {
        const a = new URL(url);
        const b = new URL(to, url);
        // Same page (e.g. adding "www." or a trailing slash) is fine; anywhere else means it's gone.
        const norm = (u: URL) => u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "");
        if (norm(a) === norm(b)) return null;
      } catch {
        /* fall through */
      }
      return false;
    }
    if (!res.ok) return null; // blocked or rate-limited: can't tell
    const html = (await res.text()).slice(0, 400_000);
    // eBay ended/sold pages are explicit; for other sites only trust strong phrases.
    // Only the visible text: drop scripts/styles first so hidden page data can't trigger a false "ended".
    const visible = html
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 20_000);
    if (GONE_TEXT.test(visible)) return false;
    return true;
  } catch {
    return null;
  }
}

function cleanListings(raw: Listing[], target: number): Listing[] {
  const seen = new Set<string>();
  const out: Listing[] = [];
  for (const l of raw) {
    let url: URL;
    try {
      url = new URL(String(l.url ?? ""));
    } catch {
      continue;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") continue;
    const usd = typeof l.price_usd === "number" ? l.price_usd : null;
    // Only real prices at or below the target (allow a hair for currency rounding).
    if (usd === null || usd <= 0 || usd > target * 1.005) continue;
    const key = url.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    const s = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
    out.push({
      title: s(l.title, 200),
      url: key,
      price: typeof l.price === "number" ? l.price : null,
      currency: s(l.currency, 8).toUpperCase() || "USD",
      price_usd: Math.round(usd),
      seller: s(l.seller, 120),
      marketplace: s(l.marketplace, 80) || url.hostname.replace(/^www\./, ""),
      location: s(l.location, 120),
      condition: s(l.condition, 80),
      box_papers: s(l.box_papers, 80),
    });
  }
  return out.slice(0, 5);
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// Check one wishlist watch, save new matches and notify the member.
export async function checkItem(db: SupabaseClient, item: AlertItem, signal?: AbortSignal): Promise<CheckResult> {
  const target = targetOf(item);
  if (!target) return { id: item.id, found: 0, added: 0, error: "No target price" };
  try {
    const previous = await pruneEnded(db, item);
    const { listings: found, ended } = await findListings(item, target, signal, previous.map((r) => r.url));
    if (ended.length) {
      const endedSet = new Set(ended);
      await db.from("price_alert_matches").delete().in("id", previous.filter((r) => endedSet.has(r.url)).map((r) => r.id));
    }
    // A listing reported as ended can't also be new.
    const listings = found.filter((l) => !ended.includes(l.url));
    let added: Listing[] = [];
    if (listings.length) {
      const rows = listings.map((l) => ({ ...l, user_id: item.user_id, wishlist_id: String(item.id), target_usd: target }));
      const { data, error } = await db
        .from("price_alert_matches")
        .upsert(rows, { onConflict: "wishlist_id,url", ignoreDuplicates: true })
        .select("url");
      if (error) throw new Error(error.message);
      const newUrls = new Set((data ?? []).map((r: { url: string }) => r.url));
      added = listings.filter((l) => newUrls.has(l.url));
    }
    await db.from("wishlist").update({ alert_checked_at: new Date().toISOString() }).eq("id", item.id).eq("user_id", item.user_id);
    if (added.length) await notify(db, item, target, added);
    return { id: item.id, found: listings.length, added: added.length };
  } catch (err) {
    // Still mark it checked so one bad watch doesn't block the rest tomorrow.
    await db.from("wishlist").update({ alert_checked_at: new Date().toISOString() }).eq("id", item.id).eq("user_id", item.user_id);
    return { id: item.id, found: 0, added: 0, error: err instanceof Error ? err.message.slice(0, 200) : "error" };
  }
}

// Remove saved listings that have since ended, sold or disappeared.
// Returns the saved listings that still need re-checking by the search (up to 8, newest first).
async function pruneEnded(db: SupabaseClient, item: AlertItem): Promise<{ id: string; url: string }[]> {
  const { data } = await db
    .from("price_alert_matches")
    .select("id,url")
    .eq("wishlist_id", String(item.id))
    .eq("user_id", item.user_id)
    .order("found_at", { ascending: false });
  const rows = (data ?? []) as { id: string; url: string }[];
  if (!rows.length) return [];
  const checks = await Promise.all(rows.map((r) => stillListed(r.url)));
  const gone = rows.filter((_, i) => checks[i] === false).map((r) => r.id);
  if (gone.length) await db.from("price_alert_matches").delete().in("id", gone);
  return rows.filter((_, i) => checks[i] !== false).slice(0, 8);
}

function describe(l: Listing): string {
  return [l.marketplace, l.seller && l.seller !== l.marketplace ? l.seller : "", l.location, l.condition, l.box_papers]
    .filter(Boolean)
    .join(" · ");
}

async function notify(db: SupabaseClient, item: AlertItem, target: number, added: Listing[]) {
  const name = `${item.brand} ${item.model}`;
  const best = [...added].sort((a, b) => (a.price_usd ?? 0) - (b.price_usd ?? 0))[0];
  const title =
    added.length === 1
      ? `Price alert: ${name} for ${usd(best.price_usd!)}`
      : `Price alert: ${added.length} listings for ${name} from ${usd(best.price_usd!)}`;
  const body = `${describe(best)}. Your target: ${usd(target)}.`;
  await db.from("notifications").insert({
    user_id: item.user_id,
    kind: "price_alert",
    title: title.slice(0, 200),
    body: body.slice(0, 500),
    link: `/wishlist#w-${item.id}`,
  });
  await sendAlertEmail(db, item, target, added).catch((err) => console.error("price alert email failed", err));
}

// Email goes out only when an email service key is set in Vercel and the member hasn't turned emails off.
async function sendAlertEmail(db: SupabaseClient, item: AlertItem, target: number, added: Listing[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const { data } = await db.auth.admin.getUserById(item.user_id);
  const user = data?.user;
  if (!user?.email) return;
  if ((user.user_metadata as Record<string, unknown> | undefined)?.price_alert_email === false) return;

  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const name = `${item.brand} ${item.model}`;
  const rows = added
    .map(
      (l) => `<tr><td style="padding:12px 0;border-bottom:1px solid #1f2a3a">
        <a href="${esc(l.url)}" style="color:#D9A43A;font-weight:600;text-decoration:none">${esc(l.title || name)}</a><br>
        <span style="color:#fff;font-size:18px;font-weight:600">${usd(l.price_usd!)}</span>
        ${l.currency !== "USD" && l.price ? `<span style="color:#94a3b8"> (${esc(l.currency)} ${Math.round(l.price).toLocaleString("en-US")})</span>` : ""}<br>
        <span style="color:#cbd5e1;font-size:14px">${esc(describe(l))}</span></td></tr>`,
    )
    .join("");
  const html = `<div style="background:#07111F;padding:24px;font-family:Arial,sans-serif;color:#e2e8f0">
    <p style="color:#93c5fd;letter-spacing:3px;font-size:12px;margin:0">BRANDON'S BRANDS · PRICE ALERT</p>
    <h1 style="color:#fff;font-size:22px;margin:8px 0 4px">${esc(name)}${item.reference_number ? ` <span style="color:#94a3b8;font-size:16px">Ref. ${esc(item.reference_number)}</span>` : ""}</h1>
    <p style="margin:0 0 12px">Found at or below your target of <b>${usd(target)}</b>:</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="font-size:13px;color:#94a3b8;margin-top:16px">Prices are sellers' asking prices. Always verify the seller, the reference and box &amp; papers before buying.</p>
    <p><a href="${SITE_URL}/wishlist#w-${esc(String(item.id))}" style="color:#93c5fd">View on your wishlist</a> · <a href="${SITE_URL}/account" style="color:#93c5fd">Turn off price alert emails</a></p>
  </div>`;

  const from = process.env.PRICE_ALERT_FROM || "Brandon's Brands <alerts@brandonsbrands17.com>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [user.email], subject: `Price alert: ${name} at or below ${usd(target)}`, html }),
  });
  if (!res.ok) console.error("Resend error", res.status, (await res.text()).slice(0, 300));
}

// Daily run: check the watches that are due (oldest check first) within a time budget.
export async function runDailyChecks(opts: { budgetMs: number; concurrency?: number; limit?: number }): Promise<CheckResult[]> {
  const db = adminClient();
  const dueBefore = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from("wishlist")
    .select("id,user_id,brand,model,reference_number,target_price")
    .eq("price_alert", true)
    .or(`alert_checked_at.is.null,alert_checked_at.lt.${dueBefore}`)
    .order("alert_checked_at", { ascending: true, nullsFirst: true })
    .limit(opts.limit ?? 60);
  if (error) throw new Error(error.message);
  const queue = ((data ?? []) as AlertItem[]).filter((i) => targetOf(i));
  const started = Date.now();
  const results: CheckResult[] = [];
  const worker = async () => {
    while (queue.length && Date.now() - started < opts.budgetMs) {
      const item = queue.shift()!;
      const remaining = opts.budgetMs + 90_000 - (Date.now() - started);
      results.push(await checkItem(db, item, AbortSignal.timeout(Math.max(30_000, Math.min(110_000, remaining)))));
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency ?? 4 }, worker));
  return results;
}
