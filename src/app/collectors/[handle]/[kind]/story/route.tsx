import { cardImage, loadCardList } from "@/lib/collectionCard";

// Story-size card (1080x1920) to save and post on Instagram/TikTok Stories.
export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: Promise<{ handle: string; kind: string }> }) {
  const { handle, kind } = await params;
  const list = await loadCardList(handle, kind);
  if (!list) return new Response("Not found", { status: 404 });
  const img = await cardImage(list, "story");
  const headers = new Headers(img.headers);
  headers.set("Content-Disposition", `inline; filename="brandons-brands-${list.handle}-${list.kind}.png"`);
  return new Response(img.body, { headers });
}
