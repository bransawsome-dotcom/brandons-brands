// Server-only: Claude writes one blog post a week plus matching Instagram, TikTok, YouTube and Facebook drafts.
// Everything is saved as a DRAFT for review on /blog/drafts; nothing is published or posted automatically.
// Never import this from a client component.
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic } from "@/lib/watchAi";
import { adminClient } from "@/lib/priceAlerts";
import { learnGuides } from "@/lib/learn";
import { blogPosts } from "@/lib/blogPosts";
import { collabEmail, socials } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";
import { slugify, type DbPost, type SocialDrafts } from "@/lib/blogDb";

const MODEL = process.env.BLOG_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

// Rotates week by week so the blog covers a mix of topics.
const THEMES = [
  "This week in watches: the most interesting new watch releases or watch-industry news from the past 7–10 days, with Brandon's take",
  "Microbrand spotlight: an independent or microbrand watchmaker worth knowing, its story and standout models",
  "Buying advice: a practical buying guide (e.g. best watches in a price range, what to check before buying pre-owned, first luxury watch)",
  "Watch history: the story behind an iconic model, complication or brand milestone",
  "Collecting & style: how to build, care for, wear or display a collection, or watch-and-outfit pairing",
];

export function themeForDate(d = new Date()): string {
  const week = Math.floor(d.getTime() / (7 * 24 * 3600 * 1000));
  return THEMES[week % THEMES.length];
}

const postSchema = {
  type: "object" as const,
  properties: {
    title: { type: "string", description: "SEO-friendly title, 40–70 characters, includes the main keyword." },
    category: { type: "string", description: "One of: News, Microbrands, Buying Guides, Watch History, Collecting, Reviews." },
    excerpt: { type: "string", description: "1–2 sentence summary shown on the blog list (max 300 characters)." },
    meta_description: { type: "string", description: "Search-engine description, 140–160 characters." },
    keywords: { type: "array", items: { type: "string" }, description: "5–10 SEO keywords/phrases." },
    body: {
      type: "array",
      items: { type: "string" },
      description:
        "The post, one string per paragraph, 700–1,100 words total. A paragraph starting with '## ' is a subheading. Links use markdown [text](url); use site paths like /learn/slug for internal links.",
    },
    instagram: {
      type: "object",
      properties: {
        caption: { type: "string", description: "Instagram caption: strong first line hook, 2–4 short paragraphs, CTA to read the full post via the link in bio, emojis sparingly." },
        hashtags: { type: "string", description: "15–20 relevant hashtags in one line." },
        reel_idea: { type: "string", description: "A short Reel plan: 4–6 shots/beats with on-screen text." },
      },
      required: ["caption", "hashtags", "reel_idea"],
    },
    tiktok: {
      type: "object",
      properties: {
        hook: { type: "string", description: "What Brandon says in the first 2 seconds." },
        script: { type: "string", description: "30–45 second spoken script, conversational, ends with a CTA." },
        caption: { type: "string", description: "Short TikTok caption (under 150 characters)." },
        hashtags: { type: "string", description: "4–6 hashtags." },
      },
      required: ["hook", "script", "caption", "hashtags"],
    },
    youtube: {
      type: "object",
      properties: {
        title: { type: "string", description: "YouTube video/Short title under 70 characters." },
        description: { type: "string", description: "YouTube description: summary, link to the blog post, the site and the other socials, 3 hashtags at the end." },
        short_script: { type: "string", description: "45–60 second YouTube Shorts script." },
        tags: { type: "string", description: "10–15 comma-separated tags." },
      },
      required: ["title", "description", "short_script", "tags"],
    },
    facebook: {
      type: "object",
      properties: { post: { type: "string", description: "Facebook post, 80–150 words, friendly, ends with the blog link and a question to drive comments." } },
      required: ["post"],
    },
    sources: {
      type: "array",
      items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" } }, required: ["url"] },
      description: "Pages used to check facts (brand sites, reputable watch publications).",
    },
  },
  required: ["title", "category", "excerpt", "meta_description", "keywords", "body", "instagram", "tiktok", "youtube", "facebook", "sources"],
};

type Written = {
  title: string;
  category: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
  body: string[];
  instagram: NonNullable<SocialDrafts["instagram"]>;
  tiktok: NonNullable<SocialDrafts["tiktok"]>;
  youtube: NonNullable<SocialDrafts["youtube"]>;
  facebook: NonNullable<SocialDrafts["facebook"]>;
  sources: { title?: string; url: string }[];
};

function buildPrompt(theme: string, topicHint: string, recentTitles: string[]): string {
  const today = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York", dateStyle: "full" });
  const social = socials.map((s) => `- ${s.name} ${s.handle}: ${s.url}`).join("\n");
  const guides = learnGuides.map((g) => `- ${g.title}: /learn/${g.slug}`).join("\n");
  return [
    `You write the weekly blog for Brandon's Brands (${SITE_URL}), a luxury watch and microbrand site run by watch reviewer Brandon Volosov. Today is ${today}.`,
    `This week's theme: ${theme}.`,
    topicHint ? `Specific topic requested: ${topicHint}` : "",
    "",
    "Research first: use web_search and web_fetch to find current, accurate information (brand websites and reputable watch publications such as Hodinkee, Fratello, Monochrome, aBlogtoWatch, WatchPro). Every fact, spec, price and release date must come from what you read; if you can't confirm something, leave it out. Never invent quotes, prices or specs.",
    "",
    "Voice: write as Brandon, in the first person, warm, enthusiastic and knowledgeable but easy to read for newcomers. Short paragraphs, plain English, explain any jargon.",
    "Rules:",
    "- Never call any watch 'my favorite' or 'his favorite'. Say 'one of my favorites' at most. Never criticise or put down any brand; stay positive and fair so no brand feels alienated.",
    "- No financial or investment advice; values are informational only.",
    "- Don't claim Brandon has handled or reviewed a watch unless a source shows he did.",
    "",
    "SEO and traffic goal (always): help the post rank on Google and drive readers to the site and Brandon's social accounts.",
    "- Use the main keyword in the title, the first paragraph and one subheading.",
    "- Add 2–4 subheadings (paragraphs starting with '## ').",
    "- Include 2–4 internal links in markdown, e.g. [our guide to automatic movements](/learn/slug), [Brandon's Favorites](/favorites), [the forum](/forum), [track your collection](/collection), [Wrist Check](/wrist-check), [upcoming meetups](/events), [the weekly newsletter](/newsletter).",
    "- End the post with a short paragraph inviting readers to follow Brandon on Instagram, TikTok, YouTube and Facebook (markdown links) and to join the conversation in the forum.",
    "",
    `Brandon's social accounts:\n${social}`,
    "",
    `Guides on the site you can link to:\n${guides}`,
    "",
    recentTitles.length ? `Don't repeat these recent posts:\n${recentTitles.map((t) => `- ${t}`).join("\n")}` : "",
    "",
    "Then write the social media versions so each platform drives people to the blog post and the other accounts. The blog post will live at " +
      `${SITE_URL}/blog/<slug>; write the link as {{POST_URL}} and it will be filled in.`,
    "",
    "When done, call the save_post tool once with everything.",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

async function write(theme: string, topicHint: string, recentTitles: string[], signal?: AbortSignal): Promise<Written> {
  const anthropic = getAnthropic();
  const tools = [
    { type: "web_search_20250305" as const, name: "web_search" as const, max_uses: 6 },
    { type: "web_fetch_20250910" as const, name: "web_fetch" as const, max_uses: 6, max_content_tokens: 8000 },
    { name: "save_post", description: "Save the finished blog post and social media drafts.", input_schema: postSchema },
  ];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: buildPrompt(theme, topicHint, recentTitles) }];
  for (let turn = 0; turn < 6; turn++) {
    const response = await anthropic.messages.create({ model: MODEL, max_tokens: 16000, tools, messages }, { signal });
    const saved = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "save_post");
    if (saved) return saved.input as Written;
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "pause_turn") {
      messages.push({ role: "user", content: "Now write the post and call save_post with everything." });
    }
  }
  throw new Error("Claude didn't finish the post.");
}

const clip = (s: unknown, n: number) => String(s ?? "").trim().slice(0, n);

// Writes one draft and saves it. Returns the saved row.
export async function writeWeeklyDraft(opts: { topicHint?: string; createdBy?: string; signal?: AbortSignal } = {}): Promise<DbPost> {
  const db = adminClient();
  const { data: recent } = await db.from("blog_posts").select("title").order("created_at", { ascending: false }).limit(30);
  const recentTitles = [...(recent ?? []).map((r: { title: string }) => r.title), ...blogPosts.map((p) => p.title)];

  const theme = themeForDate();
  const w = await write(theme, clip(opts.topicHint, 300), recentTitles, opts.signal);

  // A unique web address.
  const base = slugify(w.title) || `post-${Date.now()}`;
  const { data: taken } = await db.from("blog_posts").select("slug").like("slug", `${base}%`);
  const used = new Set([...(taken ?? []).map((r: { slug: string }) => r.slug), ...blogPosts.map((p) => p.slug)]);
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base.slice(0, 75)}-${n}`;

  const postUrl = `${SITE_URL}/blog/${slug}`;
  const fill = (s: unknown, n: number) => clip(s, n).replaceAll("{{POST_URL}}", postUrl);
  const social: SocialDrafts = {
    instagram: { caption: fill(w.instagram?.caption, 2200), hashtags: fill(w.instagram?.hashtags, 600), reel_idea: fill(w.instagram?.reel_idea, 1500) },
    tiktok: { hook: fill(w.tiktok?.hook, 300), script: fill(w.tiktok?.script, 2000), caption: fill(w.tiktok?.caption, 300), hashtags: fill(w.tiktok?.hashtags, 300) },
    youtube: { title: fill(w.youtube?.title, 100), description: fill(w.youtube?.description, 5000), short_script: fill(w.youtube?.short_script, 2500), tags: fill(w.youtube?.tags, 500) },
    facebook: { post: fill(w.facebook?.post, 3000) },
    posted: {},
  };

  const row = {
    slug,
    title: clip(w.title, 140),
    category: clip(w.category, 40) || "News",
    excerpt: fill(w.excerpt, 400),
    meta_description: fill(w.meta_description, 200),
    keywords: (w.keywords ?? []).map((k) => clip(k, 60)).filter(Boolean).slice(0, 12),
    body: (w.body ?? []).map((p) => fill(p, 4000)).filter(Boolean).slice(0, 60),
    social,
    sources: (w.sources ?? []).filter((s) => /^https?:\/\//.test(s.url)).slice(0, 20),
    status: "draft",
    created_by: opts.createdBy ?? "claude",
  };
  const { data, error } = await db.from("blog_posts").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as DbPost;
}

// "Your weekly drafts are ready" email. Recipient: BLOG_NOTIFY_TO (comma-separated) or the collab address.
export async function emailDraftReady(post: DbPost): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const html = `<div style="background:#07111F;padding:24px;font-family:Arial,sans-serif;color:#e2e8f0">
    <p style="color:#93c5fd;letter-spacing:3px;font-size:12px;margin:0">BRANDON'S BRANDS · WEEKLY DRAFTS READY</p>
    <h1 style="color:#fff;font-size:22px;margin:8px 0">${esc(post.title)}</h1>
    <p style="color:#cbd5e1">${esc(post.excerpt)}</p>
    <p style="color:#cbd5e1">Claude wrote this week's blog post plus Instagram, TikTok, YouTube and Facebook drafts. Nothing is live yet.</p>
    <p><a href="${SITE_URL}/blog/drafts" style="display:inline-block;background:#D9A43A;color:#000;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Review &amp; publish</a></p>
  </div>`;
  const to = (process.env.BLOG_NOTIFY_TO || collabEmail).split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.OFFER_FROM || "Brandon's Brands <offers@brandonsbrands17.com>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: `Blog draft ready: ${post.title}`, html }),
  });
  if (!res.ok) console.error("Resend error (blog draft)", res.status, (await res.text()).slice(0, 300));
}
