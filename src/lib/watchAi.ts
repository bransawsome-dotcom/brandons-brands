// Server-only helpers that use the Claude API to look up watch details and
// read photos of collection lists. Never import this from a client component.
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

export class AiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function getAnthropic(): Anthropic {
  // Accept either spelling; Vercel variable names are case-sensitive.
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.anthropic_api_key;
  if (!apiKey) {
    throw new AiError("Auto-fill isn't set up yet: the ANTHROPIC_API_KEY is missing in Vercel.", 503);
  }
  return new Anthropic({ apiKey });
}

// Only signed-in members may use the AI features, so strangers can't run up the bill.
export async function requireMember(request: Request): Promise<string> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!token || !url || !anon) {
    throw new AiError("Please log in to use auto-fill.", 401);
  }
  const client = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    throw new AiError("Your session has expired. Please log in again.", 401);
  }
  return data.user.id;
}

export function errorResponse(err: unknown): Response {
  if (err instanceof AiError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error("watch AI error", err);
  // Show the AI service's short reason (never includes the key) so problems can be diagnosed.
  if (err instanceof Anthropic.APIError) {
    const detail = (err.error as { error?: { message?: string } } | undefined)?.error?.message ?? err.message;
    return Response.json(
      { error: `Something went wrong looking that up. Please try again. (${err.status ?? "error"}: ${String(detail).slice(0, 200)})` },
      { status: 500 },
    );
  }
  return Response.json({ error: "Something went wrong looking that up. Please try again." }, { status: 500 });
}

export type WatchLookup = {
  brand: string;
  model: string;
  reference_number: string;
  year_introduced: string;
  case_size_mm: string;
  case_material: string;
  movement: string;
  water_resistance: string;
  retail_price_at_purchase: number | null;
  retail_price_date_note: string;
  current_retail_price: number | null;
  market_value: number | null;
  market_value_low: number | null;
  market_value_high: number | null;
  summary: string;
  sources: string[];
  official_page_url: string;
  image_candidate?: string;
  // Filled in on the server from the official page (not by the model).
  image_url: string | null;
};

const lookupSchema = {
  type: "object" as const,
  properties: {
    brand: { type: "string", description: "Official brand name" },
    model: { type: "string", description: "Full model name" },
    reference_number: { type: "string", description: "Reference number, or empty string if unknown" },
    year_introduced: { type: "string" },
    case_size_mm: { type: "string", description: "e.g. '39 mm'" },
    case_material: { type: "string" },
    movement: { type: "string", description: "Calibre and type, e.g. 'Automatic, cal. MT5402'" },
    water_resistance: { type: "string" },
    retail_price_at_purchase: {
      type: ["number", "null"],
      description: "Manufacturer list price in USD at the purchase date (or the closest date with a known price). null if not found.",
    },
    retail_price_date_note: { type: "string", description: "Which date/year that retail price applies to" },
    current_retail_price: { type: ["number", "null"], description: "Today's manufacturer list price in USD, null if discontinued or unknown" },
    market_value: { type: ["number", "null"], description: "Typical current pre-owned selling price in USD" },
    market_value_low: { type: ["number", "null"] },
    market_value_high: { type: ["number", "null"] },
    summary: { type: "string", description: "One or two plain sentences about this watch for a collector" },
    sources: { type: "array", items: { type: "string" }, description: "URLs of the pages the prices came from" },
    official_page_url: {
      type: "string",
      description: "URL of the manufacturer's own product page for this exact model/reference (current version), found via search. Empty string if none.",
    },
    image_candidate: {
      type: "string",
      description: "Direct URL of the main product photo from the official product page (its og:image, or the first product gallery image), as seen with web_fetch. Empty string if not found. Never invent one.",
    },
  },
  required: [
    "brand", "model", "reference_number", "year_introduced", "case_size_mm", "case_material", "movement",
    "water_resistance", "retail_price_at_purchase", "retail_price_date_note", "current_retail_price",
    "market_value", "market_value_low", "market_value_high", "summary", "sources", "official_page_url", "image_candidate",
  ],
};

export async function lookupWatch(input: {
  brand: string;
  model: string;
  reference_number?: string;
  purchase_date?: string;
}): Promise<WatchLookup> {
  const anthropic = getAnthropic();
  const today = new Date().toISOString().slice(0, 10);
  const prompt = [
    `Look up this watch and record its details with the record_watch tool.`,
    `Brand: ${input.brand}`,
    `Model: ${input.model}`,
    input.reference_number ? `Reference: ${input.reference_number}` : "",
    input.purchase_date ? `Purchased on: ${input.purchase_date}` : "Purchase date: unknown (use today's list price as the retail price).",
    `Today is ${today}.`,
    `Use web search for prices: the manufacturer's list (retail) price at the purchase date, today's list price, and current pre-owned market prices (e.g. Chrono24, WatchCharts, recent sales). All prices in USD. Use null for anything you cannot find rather than guessing. Never invent a reference number. Also find the manufacturer's official product page for the current version of this model, open it once with web_fetch, and report its main product photo URL as image_candidate.`,
  ].filter(Boolean).join("\n");

  const tools = [
    { type: "web_search_20250305" as const, name: "web_search" as const, max_uses: 5 },
    { type: "web_fetch_20250910" as const, name: "web_fetch" as const, max_uses: 2, max_content_tokens: 12000 },
    { name: "record_watch", description: "Record the looked-up watch details and prices.", input_schema: lookupSchema },
  ];

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < 4; turn++) {
    const response = await anthropic.messages.create({ model: MODEL, max_tokens: 4000, tools, messages });
    const recorded = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === "record_watch",
    );
    if (recorded) {
      const result = recorded.input as WatchLookup;
      const pages = [result.official_page_url, ...(result.sources ?? [])].filter(Boolean);
      result.image_url = (await findProductImage(pages)) ?? (await checkCandidateImage(result.image_candidate, result.official_page_url));
      return result;
    }
    // Long web searches can pause; continue the same turn. Otherwise ask it to record.
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "pause_turn") {
      messages.push({ role: "user", content: "Now call record_watch with what you found." });
    }
  }
  throw new AiError("Couldn't find details for that watch. Check the brand and model and try again.", 422);
}

export type ScannedWatch = {
  brand: string;
  model: string;
  reference_number: string;
  nickname: string;
  purchase_date: string;
  purchase_price: number | null;
  notes: string;
};

const scanSchema = {
  type: "object" as const,
  properties: {
    watches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          brand: { type: "string" },
          model: { type: "string" },
          reference_number: { type: "string", description: "Empty string if not shown" },
          nickname: { type: "string", description: "Empty string if not shown" },
          purchase_date: { type: "string", description: "YYYY-MM-DD if shown, else empty string" },
          purchase_price: { type: ["number", "null"], description: "Purchase price in USD if shown, else null" },
          notes: { type: "string", description: "Anything else written for this watch, else empty string" },
        },
        required: ["brand", "model", "reference_number", "nickname", "purchase_date", "purchase_price", "notes"],
      },
    },
  },
  required: ["watches"],
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

const SCAN_PROMPTS = {
  collection:
    "This is a photo of a watch collection list (handwritten, printed or a screenshot), or of watches themselves. Record every watch you can identify. Copy brand, model and reference exactly as written; fix obvious spelling of brand names. Leave fields empty rather than guessing.",
  wishlist:
    "This is a photo of a watch wishlist: a list of watches someone wants to buy (handwritten, printed, a notes-app or social media screenshot, a dealer listing or ad), or of the watches themselves. Record every watch you can identify. Copy brand, model and reference exactly as written; fix obvious spelling of brand names. If a price is written next to a watch, put it in purchase_price (it is the price they hope to pay). Put any priority or ranking (e.g. 'top pick', '#1', 'must have') and other comments in notes. Leave purchase_date and nickname empty. Leave fields empty rather than guessing.",
} as const;

export type ScanKind = keyof typeof SCAN_PROMPTS;

export async function scanCollectionImage(base64: string, mediaType: string, kind: ScanKind = "collection"): Promise<ScannedWatch[]> {
  if (!IMAGE_TYPES.includes(mediaType as ImageType)) {
    throw new AiError("Please upload a JPG, PNG or WebP photo.", 400);
  }
  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    tools: [{ name: "record_watches", description: "Record every watch listed in the image.", input_schema: scanSchema }],
    tool_choice: { type: "tool", name: "record_watches" },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType as ImageType, data: base64 } },
          {
            type: "text",
            text: SCAN_PROMPTS[kind] ?? SCAN_PROMPTS.collection,
          },
        ],
      },
    ],
  });
  const block = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  const watches = (block?.input as { watches?: ScannedWatch[] } | undefined)?.watches ?? [];
  return watches.filter((w) => w.brand || w.model);
}


// --- Product photo -----------------------------------------------------------
// Reads the main product image (og:image / twitter:image) from the official page,
// falling back to the price-source pages. Returns null if none can be verified.

const PAGE_TIMEOUT_MS = 9000;
// Many brand sites refuse requests that don't look like a normal browser.
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: "follow", headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", ...(init.headers ?? {}) } });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extractImageUrl(html: string, pageUrl: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) {
      try {
        return new URL(match[1].replace(/&amp;/g, "&"), pageUrl).toString();
      } catch {
        // ignore malformed URL
      }
    }
  }
  return null;
}

async function isReachableImage(url: string): Promise<boolean> {
  const res = await fetchWithTimeout(url, { headers: { Accept: "image/*" } });
  if (!res || !res.ok) return false;
  const type = res.headers.get("content-type") ?? "";
  res.body?.cancel().catch(() => {});
  return type.startsWith("image/");
}

async function findProductImage(pages: string[]): Promise<string | null> {
  for (const page of [...new Set(pages.filter(isHttpUrl))].slice(0, 5)) {
    const res = await fetchWithTimeout(page, { headers: { Accept: "text/html,application/xhtml+xml" } });
    if (!res || !res.ok || !(res.headers.get("content-type") ?? "").includes("html")) continue;
    const html = (await res.text()).slice(0, 400_000);
    const image = extractImageUrl(html, res.url || page);
    if (image && image.startsWith("https://") && (await isReachableImage(image))) {
      return image;
    }
  }
  return null;
}

function registrableDomain(host: string): string {
  return host.split(".").slice(-2).join(".");
}

// The model's reported photo URL. Accepted if the server can load it, or — when the
// brand's site blocks servers — if it's hosted on the brand's own domain.
async function checkCandidateImage(candidate: string | undefined, officialPage: string): Promise<string | null> {
  if (!candidate || !candidate.startsWith("https://") || !isHttpUrl(candidate)) return null;
  if (await isReachableImage(candidate)) return candidate;
  try {
    const sameBrand = registrableDomain(new URL(candidate).hostname) === registrableDomain(new URL(officialPage).hostname);
    return sameBrand ? candidate : null;
  } catch {
    return null;
  }
}
