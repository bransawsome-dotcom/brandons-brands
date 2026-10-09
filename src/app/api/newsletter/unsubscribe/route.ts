import { unsubscribe } from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

// Unsubscribe link in every newsletter (GET from the link, POST from email apps' one-click button).
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const ok = await unsubscribe(token).catch(() => false);
  return { ok };
}

export async function GET(request: Request) {
  const { ok } = await handle(request);
  return Response.redirect(`${SITE_URL}/newsletter?${ok ? "unsubscribed=1" : "unsubscribe=failed"}`, 303);
}

export async function POST(request: Request) {
  const { ok } = await handle(request);
  return Response.json({ ok });
}
