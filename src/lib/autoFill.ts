"use client";

// Automatic filling-in of watches (photo, specs, prices) on the Collection and Wishlist pages.
// A watch counts as "not filled in" when it has no specs summary or no market value yet. Each one is tried
// at most a few times a day per device (so a watch the lookup can't find doesn't cost a lookup on every visit).
const KEY = "bb-autofill-tries";
const MAX_TRIES_PER_DAY = 3;

type Tries = Record<string, { day: string; n: number }>;
const today = () => new Date().toISOString().slice(0, 10);

function read(): Tries {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Tries;
  } catch {
    return {};
  }
}

export function canTry(id: string): boolean {
  const t = read()[id];
  return !t || t.day !== today() || t.n < MAX_TRIES_PER_DAY;
}

export function noteTry(id: string) {
  try {
    const all = read();
    const t = all[id];
    all[id] = t && t.day === today() ? { day: t.day, n: t.n + 1 } : { day: today(), n: 1 };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* private mode */
  }
}

export function needsFill(item: { image_url?: string | null; details?: { summary?: unknown; market_value_low?: unknown } | null }, value?: string | null): boolean {
  const d = item.details ?? {};
  const hasSummary = typeof d.summary === "string" && d.summary.trim().length > 0;
  const hasValue = Boolean(value && String(value).trim()) || typeof d.market_value_low === "number";
  return !hasSummary || !hasValue;
}

// Lookup with one quick retry (the lookup service can time out on the first try).
export async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, 4000));
    return withRetry(fn, retries - 1);
  }
}
