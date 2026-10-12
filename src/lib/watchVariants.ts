// Server-only: the versions (sub-models / references) of a watch model, for the "Version" dropdown on the
// Collection and Wishlist forms. Looked up online once with Claude + web search, then saved in
// public.watch_variants so later visitors get the list instantly. Never import this from a client component.
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic } from "@/lib/watchAi";
import { adminClient } from "@/lib/priceAlerts";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_AGE_DAYS = 120;

export type WatchVariant = { name: string; reference_number: string; detail: string };

const key = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();

const schema = {
  type: "object" as const,
  properties: {
    variants: {
      type: "array",
      maxItems: 24,
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Short version name as collectors say it, without repeating the brand or model, e.g. 'Tubogas', 'Seduttori 33mm', 'Date 41mm \"Starbucks\"', 'No-Date 41mm'." },
          reference_number: { type: "string", description: "The main reference number for that version, or empty string if not well defined." },
          detail: { type: "string", description: "One short line: size, material, dial or movement that sets it apart, e.g. '41mm steel, green bezel, black dial'." },
        },
        required: ["name", "reference_number", "detail"],
      },
    },
  },
  required: ["variants"],
};

async function lookupVariants(brand: string, model: string): Promise<WatchVariant[]> {
  const anthropic = getAnthropic();
  const prompt = [
    `List the versions of the ${brand} ${model} watch that a collector would choose between when adding it to their collection or wishlist, and record them with the record_versions tool.`,
    "Include the main sub-models / sub-collections and the important references (current ones first, then well-known recent or classic ones). Group very similar dial colours into one entry unless collectors treat them as different watches.",
    "Use web search (the brand's site, Chrono24, WatchCharts, Hodinkee, Fratello, Monochrome). Only list versions you found; never invent a reference number. If the model has no meaningful versions, return an empty list.",
  ].join("\n");
  const tools = [
    { type: "web_search_20250305" as const, name: "web_search" as const, max_uses: 3 },
    { name: "record_versions", description: "Record the versions found.", input_schema: schema },
  ];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < 4; turn++) {
    const res = await anthropic.messages.create({ model: MODEL, max_tokens: 3000, tools, messages });
    const rec = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "record_versions");
    if (rec) {
      const list = ((rec.input as { variants?: WatchVariant[] }).variants ?? [])
        .map((v) => ({ name: String(v.name ?? "").trim().slice(0, 80), reference_number: String(v.reference_number ?? "").trim().slice(0, 40), detail: String(v.detail ?? "").trim().slice(0, 140) }))
        .filter((v) => v.name);
      return list.slice(0, 24);
    }
    messages.push({ role: "assistant", content: res.content });
    if (res.stop_reason !== "pause_turn") messages.push({ role: "user", content: "Now call record_versions with what you found." });
  }
  return [];
}

export async function findVariants(brand: string, model: string): Promise<{ variants: WatchVariant[]; cached: boolean }> {
  const bk = key(brand);
  const mk = key(model);
  let db: ReturnType<typeof adminClient> | null = null;
  try {
    db = adminClient();
    const { data } = await db.from("watch_variants").select("variants,updated_at").eq("brand_key", bk).eq("model_key", mk).maybeSingle();
    if (data && Date.now() - new Date(data.updated_at as string).getTime() < MAX_AGE_DAYS * 86400_000) {
      return { variants: data.variants as WatchVariant[], cached: true };
    }
  } catch {
    // No saved list yet (or the table isn't set up): look it up below.
  }
  const variants = await lookupVariants(brand, model);
  if (db) {
    await db
      .from("watch_variants")
      .upsert({ brand_key: bk, model_key: mk, brand, model, variants, updated_at: new Date().toISOString() })
      .then(() => undefined, () => undefined);
  }
  return { variants, cached: false };
}
