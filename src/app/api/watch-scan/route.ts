import { errorResponse, requireMember, scanCollectionImage, AiError } from "@/lib/watchAi";

export const maxDuration = 60;

const MAX_BASE64_CHARS = 6_000_000; // ~4.5 MB image

export async function POST(request: Request) {
  try {
    await requireMember(request);
    const body = (await request.json().catch(() => ({}))) as { image?: string; media_type?: string; kind?: string };
    const image = body.image ?? "";
    if (!image) {
      throw new AiError("Choose a photo first.", 400);
    }
    if (image.length > MAX_BASE64_CHARS) {
      throw new AiError("That photo is too large. Try a smaller one.", 413);
    }
    const kind = body.kind === "wishlist" ? "wishlist" : "collection";
    const watches = await scanCollectionImage(image, body.media_type ?? "image/jpeg", kind);
    return Response.json({ watches });
  } catch (err) {
    return errorResponse(err);
  }
}
