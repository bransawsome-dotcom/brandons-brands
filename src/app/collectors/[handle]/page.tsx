import { notFound, redirect } from "next/navigation";
import { loadPublicList } from "@/lib/publicLists";

// brandonsbrands17.com/collectors/<name> opens that member's public collection (or wishlist).
export const revalidate = 60;

export default async function CollectorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = await loadPublicList(handle, "collection");
  if (collection) redirect(`/collectors/${collection.handle}/collection`);
  const wishlist = await loadPublicList(handle, "wishlist");
  if (wishlist) redirect(`/collectors/${wishlist.handle}/wishlist`);
  notFound();
}
