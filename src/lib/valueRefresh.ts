// Server-only: refresh today's retail price and market value for every collection and wishlist watch, once a day.
// The retail price on the purchase date (watches.retail_price) is never changed.
// Never import this from a client component.
import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAnthropic } from "@/lib/watchAi";
import { adminClient } from "@/lib/priceAlerts";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

type Prices = {
  current_retail_price: number | null;
  market_value: number | null;
  market_value_low: number | null;
  market_value_high: number | null;
  sources: string[];
};

const pricesSchema = {
  type: "object" as const,
  properties: {
    current_retail_price: { type: ["number", "null"], description: "Today's manufacturer list price in USD; null if discontinued or unknown" },
    market_value: { type: ["number", "null"], description: "Typical current pre-owned selling price in USD" },
    market_value_low: { type: ["number", "null"] },
    market_value_high: { type: ["number", "null"] },
    sources: { type: "array", items: { type: "string" }, description: "URLs the prices came from" },
  },
  required: ["current_retail_price", "market_value", "market_value_low", "market_value_high", "sources"],
};

// Prices only (no photos or specs), to keep the daily run quick and inexpensive.
export async function lookupPrices(w: { brand: string; model: string; reference_number?: string | null }, signal?: AbortSignal): Promise<Prices | null> {
  const anthropic = getAnthropic();
  const today = new Date().toISOString().slice(0, 10);
  const prompt = [
    `Find today's prices for this watch and record them with the record_prices tool.`,
    `Brand: ${w.brand}`,
    `Model: ${w.model}`,
    w.reference_number ? `Reference: ${w.reference_number}` : "",
    `Today is ${today}. Use web search: the manufacturer's current list (retail) price, and current pre-owned market prices (e.g. Chrono24, WatchCharts, recent sales). All in USD. Use null for anything you can't find; never guess.`,
  ]
    .filter(Boolean)
    .join("\n");
  const tools = [
    { type: "web_search_20250305" as const, name: "web_search" as const, max_uses: 3 },
    { name: "record_prices", description: "Record today's prices.", input_schema: pricesSchema },
  ];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < 4; turn++) {
    const res = await anthropic.messages.create({ model: MODEL, max_tokens: 1500, tools, messages }, { signal });
    const rec = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "record_prices");
    if (rec) return rec.input as Prices;
    messages.push({ role: "assistant", content: res.content });
    if (res.stop_reason !== "pause_turn") messages.push({ role: "user", content: "Now call record_prices with what you found." });
  }
  return null;
}

const str = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? String(Math.round(n)) : null);

type Row = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  reference_number: string | null;
  details: Record<string, unknown> | null;
};

async function refreshOne(db: SupabaseClient, table: "watches" | "wishlist", row: Row, signal: AbortSignal) {
  const now = new Date().toISOString();
  try {
    const p = await lookupPrices(row, signal);
    const update: Record<string, unknown> = { value_updated_at: now };
    if (p) {
      const details = { ...(row.details ?? {}) } as Record<string, unknown>;
      if (typeof p.market_value_low === "number") details.market_value_low = p.market_value_low;
      if (typeof p.market_value_high === "number") details.market_value_high = p.market_value_high;
      if (p.sources?.length) details.sources = p.sources.slice(0, 6);
      update.details = details;
      const retail = str(p.current_retail_price);
      const market = str(p.market_value);
      if (table === "watches") {
        // retail_price (on the purchase date) is deliberately left alone.
        if (retail) update.current_retail_price = retail;
        if (market) update.estimated_value = market;
      } else {
        if (retail) update.retail_price = retail;
        if (market) update.current_market_price = market;
      }
    }
    await db.from(table).update(update).eq("id", row.id).eq("user_id", row.user_id);
    return { table, id: row.id, ok: Boolean(p) };
  } catch (err) {
    // Mark it checked anyway so one failure doesn't block the rest tomorrow.
    await db.from(table).update({ value_updated_at: now }).eq("id", row.id).eq("user_id", row.user_id);
    return { table, id: row.id, ok: false, error: err instanceof Error ? err.message.slice(0, 160) : "error" };
  }
}

// Refresh the watches whose values are oldest, within a time budget.
export async function runValueRefresh(opts: { budgetMs: number; concurrency?: number; limit?: number }) {
  const db = adminClient();
  const dueBefore = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const cols = "id,user_id,brand,model,reference_number,details";
  const due = async (table: "watches" | "wishlist") => {
    const { data, error } = await db
      .from(table)
      .select(cols)
      .or(`value_updated_at.is.null,value_updated_at.lt.${dueBefore}`)
      .order("value_updated_at", { ascending: true, nullsFirst: true })
      .limit(opts.limit ?? 60);
    if (error) throw new Error(`${table}: ${error.message}`);
    return ((data ?? []) as Row[]).filter((r) => r.brand && r.model).map((r) => ({ table, row: r }));
  };
  // Alternate collection and wishlist watches so both get updated each day.
  const [a, b] = await Promise.all([due("watches"), due("wishlist")]);
  const queue: { table: "watches" | "wishlist"; row: Row }[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) queue.push(a[i]);
    if (b[i]) queue.push(b[i]);
  }
  const started = Date.now();
  const results: Awaited<ReturnType<typeof refreshOne>>[] = [];
  const worker = async () => {
    while (queue.length && Date.now() - started < opts.budgetMs) {
      const job = queue.shift()!;
      results.push(await refreshOne(db, job.table, job.row, AbortSignal.timeout(80_000)));
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency ?? 5 }, worker));
  return { results, remaining: queue.length };
}
