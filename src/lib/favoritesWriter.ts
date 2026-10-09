// Server-only: every Friday Claude looks through Brandon's latest videos, picks a watch he featured that isn't in
// Brandon's Favorites yet, researches it on the brand's site, writes it up in Brandon's voice and adds it to the
// gallery (a database trigger also starts its discussion in the Brandon's Favorites forum folder).
// Never import this from a client component.
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic } from "@/lib/watchAi";
import { adminClient } from "@/lib/priceAlerts";
import { collabEmail } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";
import { latestYouTubeVideos, videoKey, type Video } from "@/lib/youtube";

const MODEL = process.env.FAVORITES_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const OWN_SOCIAL = /^https:\/\/(www\.)?(instagram\.com\/(reel|p)\/|tiktok\.com\/@brandons\.brands\/video\/|facebook\.com\/)/i;

const schema = {
  type: "object" as const,
  properties: {
    found: { type: "boolean", description: "false if no suitable new watch was found this week." },
    reason: { type: "string", description: "One sentence: why this watch (or why none)." },
    brand: { type: "string" },
    model: { type: "string", description: "Model name, including edition/colourway if relevant (max 100 characters)." },
    reference_number: { type: "string", description: "Reference number if confirmed, else empty." },
    link_url: { type: "string", description: "The URL of Brandon's video/post featuring this watch (from the list, or an Instagram/TikTok/Facebook post of his you found)." },
    image_url: { type: "string", description: "Direct https URL of an official product image of the watch (from the brand's site), or empty." },
    note: { type: "string", description: "1–2 sentences, max 280 characters, in Brandon's voice, saying it's one of his favorites and why." },
    features: { type: "string", description: "Starts with 'What I love about it:' then 80–140 words in Brandon's first-person voice on the watch's unique features, from the brand's site." },
    sources: { type: "array", items: { type: "string" } },
  },
  required: ["found", "reason"],
};

type Pick = {
  found: boolean;
  reason: string;
  brand?: string;
  model?: string;
  reference_number?: string;
  link_url?: string;
  image_url?: string;
  note?: string;
  features?: string;
  sources?: string[];
};

async function isImage(url: string): Promise<boolean> {
  if (!/^https:\/\//.test(url)) return false;
  try {
    const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(8000), headers: { Range: "bytes=0-1023" } });
    return res.ok && (res.headers.get("content-type") ?? "").startsWith("image/");
  } catch {
    return false;
  }
}

export type WeeklyFavoriteResult =
  | { added: true; id: string; brand: string; model: string; link_url: string; post_id: string | null; reason: string }
  | { added: false; reason: string };

export async function addWeeklyFavorite(opts: { signal?: AbortSignal } = {}): Promise<WeeklyFavoriteResult> {
  const db = adminClient();
  const { data: favs, error } = await db.from("brand_favorites").select("brand,model,link_url,sort");
  if (error) throw new Error(error.message);
  const existing = (favs ?? []) as { brand: string; model: string; link_url: string | null; sort: number }[];
  const usedLinks = new Set(existing.map((f) => videoKey(f.link_url)));

  const videos = (await latestYouTubeVideos().catch(() => [] as Video[])).filter((v) => !usedLinks.has(videoKey(v.url)));

  const prompt = [
    `Brandon Volosov runs Brandon's Brands (${SITE_URL}), reviewing luxury and microbrand watches on Instagram (@brandonsbrands17), TikTok (@brandons.brands), YouTube (@BrandonsBrands) and Facebook.`,
    "Each Friday one watch from his recent videos is added to the 'Brandon's Favorites' gallery on his site.",
    "",
    "Already in Brandon's Favorites (don't pick these again, or another version of the same model):",
    ...existing.map((f) => `- ${f.brand} ${f.model}`),
    "",
    videos.length ? "His recent YouTube videos/Shorts not used yet (newest first):" : "Couldn't read his YouTube feed this week.",
    ...videos.map((v) => `- ${v.published.slice(0, 10)} | ${v.title} | ${v.url}${v.description ? ` | ${v.description.replace(/\s+/g, " ").slice(0, 200)}` : ""}`),
    "",
    "You may also web_search for his latest Instagram, TikTok and Facebook posts (his videos are usually posted on all four). Only use such a post if you find its exact URL.",
    "",
    "Pick ONE watch that Brandon clearly featured hands-on in one of these videos and that isn't already a favorite. Prefer the most recent. Skip founder interviews, multi-watch roundups and general videos unless one specific watch is the clear subject. If nothing fits, set found=false.",
    "Then research that exact watch on the brand's official website (and reputable watch press if needed) with web_search/web_fetch. Use only facts you read; never guess specs, prices or limited-edition numbers. Find a direct official product image URL if you can.",
    "Writing rules: Brandon's first-person voice, warm and enthusiastic, plain English. It's 'one of my favorites' / 'one of Brandon's favorites', NEVER 'my favorite' or 'his favorite'. Never criticise any brand.",
    "Finish by calling save_favorite once.",
  ].join("\n");

  const anthropic = getAnthropic();
  const tools = [
    { type: "web_search_20250305" as const, name: "web_search" as const, max_uses: 6 },
    { type: "web_fetch_20250910" as const, name: "web_fetch" as const, max_uses: 6, max_content_tokens: 8000 },
    { name: "save_favorite", description: "Save this week's favorite (or found=false).", input_schema: schema },
  ];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  let pick: Pick | null = null;
  for (let turn = 0; turn < 6 && !pick; turn++) {
    const response = await anthropic.messages.create({ model: MODEL, max_tokens: 6000, tools, messages }, { signal: opts.signal });
    const call = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "save_favorite");
    if (call) pick = call.input as Pick;
    else {
      messages.push({ role: "assistant", content: response.content });
      if (response.stop_reason !== "pause_turn") messages.push({ role: "user", content: "Now call save_favorite." });
    }
  }
  if (!pick) throw new Error("Claude didn't finish choosing a favorite.");
  if (!pick.found || !pick.brand || !pick.model) return { added: false, reason: pick.reason || "No new watch found this week." };

  // The link must be one of Brandon's own videos/posts.
  const link = String(pick.link_url ?? "").trim();
  const ytMatch = videos.find((v) => videoKey(v.url) === videoKey(link));
  if (!ytMatch && !OWN_SOCIAL.test(link)) return { added: false, reason: `Skipped: the video link (${link || "none"}) isn't one of Brandon's.` };
  if (usedLinks.has(videoKey(link))) return { added: false, reason: "Skipped: that video is already in Brandon's Favorites." };
  const brand = pick.brand.trim().slice(0, 60);
  const model = pick.model.trim().slice(0, 100);
  if (existing.some((f) => f.brand.toLowerCase() === brand.toLowerCase() && f.model.toLowerCase() === model.toLowerCase())) {
    return { added: false, reason: `Skipped: ${brand} ${model} is already a favorite.` };
  }

  // Wording guard: never "my/his favorite".
  const fix = (s: string) => s.replace(/\b(my|his|Brandon's) (favou?rite)\b(?! watches)/gi, (_m, who: string, fav: string) => `one of ${who} ${fav}s`);
  const note = fix(String(pick.note ?? "").trim()).slice(0, 300) || "One of Brandon's favorites.";
  const features = fix(String(pick.features ?? "").trim()).slice(0, 1500) || null;

  let image = String(pick.image_url ?? "").trim();
  if (!(await isImage(image))) image = ytMatch?.thumbnail ?? "";

  const minSort = existing.length ? Math.min(...existing.map((f) => f.sort)) : 0;
  const { data, error: insErr } = await db
    .from("brand_favorites")
    .insert({
      brand,
      model,
      reference_number: String(pick.reference_number ?? "").trim().slice(0, 60) || null,
      image_url: image || null,
      link_url: ytMatch ? ytMatch.url : link,
      note,
      features,
      sort: minSort - 1, // newest favorite shows first
    })
    .select("id,post_id")
    .single();
  if (insErr) throw new Error(insErr.message);
  return { added: true, id: data.id, brand, model, link_url: ytMatch ? ytMatch.url : link, post_id: data.post_id, reason: pick.reason };
}

export async function emailFavoriteAdded(r: WeeklyFavoriteResult): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const html = r.added
    ? `<div style="background:#07111F;padding:24px;font-family:Arial,sans-serif;color:#e2e8f0">
    <p style="color:#93c5fd;letter-spacing:3px;font-size:12px;margin:0">BRANDON'S BRANDS · THIS WEEK'S FAVORITE</p>
    <h1 style="color:#fff;font-size:22px;margin:8px 0">⭐ ${esc(r.brand)} ${esc(r.model)}</h1>
    <p style="color:#cbd5e1">Claude reviewed Brandon's latest videos and added this watch to Brandon's Favorites, with a forum discussion. ${esc(r.reason)}</p>
    <p style="color:#cbd5e1">Video: <a href="${esc(r.link_url)}" style="color:#93c5fd">${esc(r.link_url)}</a></p>
    <p><a href="${SITE_URL}/favorites" style="display:inline-block;background:#D9A43A;color:#000;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">See it (edit or remove)</a>
    ${r.post_id ? ` <a href="${SITE_URL}/forum/${r.post_id}" style="color:#93c5fd;margin-left:12px">Forum discussion</a>` : ""}</p>
  </div>`
    : `<div style="background:#07111F;padding:24px;font-family:Arial,sans-serif;color:#e2e8f0">
    <p style="color:#93c5fd;letter-spacing:3px;font-size:12px;margin:0">BRANDON'S BRANDS · THIS WEEK'S FAVORITE</p>
    <h1 style="color:#fff;font-size:20px;margin:8px 0">No new favorite this week</h1>
    <p style="color:#cbd5e1">${esc(r.reason)}</p>
    <p><a href="${SITE_URL}/favorites" style="color:#93c5fd">Add one by hand</a></p></div>`;
  const to = (process.env.BLOG_NOTIFY_TO || collabEmail).split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.OFFER_FROM || "Brandon's Brands <offers@brandonsbrands17.com>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: r.added ? `New in Brandon's Favorites: ${r.brand} ${r.model}` : "No new Brandon's Favorite this week", html }),
  });
  if (!res.ok) console.error("Resend error (favorite)", res.status, (await res.text()).slice(0, 300));
}
