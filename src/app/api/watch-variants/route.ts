import { errorResponse, requireMember, AiError } from "@/lib/watchAi";
import { findVariants } from "@/lib/watchVariants";

// Versions (sub-models / references) of a brand + model for the Version dropdown.
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    await requireMember(request);
    const body = (await request.json().catch(() => ({}))) as { brand?: string; model?: string };
    const brand = (body.brand ?? "").trim().slice(0, 80);
    const model = (body.model ?? "").trim().slice(0, 120);
    if (!brand || !model) throw new AiError("Enter a brand and model first.", 400);
    return Response.json(await findVariants(brand, model));
  } catch (err) {
    return errorResponse(err);
  }
}
