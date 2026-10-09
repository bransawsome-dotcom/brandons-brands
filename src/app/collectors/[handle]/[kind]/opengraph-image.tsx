import { cardImage, loadCardList } from "@/lib/collectionCard";

// Link preview for a public collection/wishlist (shown when the link is shared).
export const alt = "A watch collection on Brandon's Brands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ handle: string; kind: string }> }) {
  const { handle, kind } = await params;
  return cardImage(await loadCardList(handle, kind), "preview");
}
