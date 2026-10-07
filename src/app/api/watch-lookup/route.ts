import { errorResponse, lookupWatch, requireMember, AiError } from "@/lib/watchAi";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    await requireMember(request);
    const body = (await request.json().catch(() => ({}))) as {
      brand?: string;
      model?: string;
      reference_number?: string;
      purchase_date?: string;
    };
    const brand = (body.brand ?? "").trim().slice(0, 80);
    const model = (body.model ?? "").trim().slice(0, 120);
    if (!brand || !model) {
      throw new AiError("Enter a brand and model first.", 400);
    }
    const result = await lookupWatch({
      brand,
      model,
      reference_number: (body.reference_number ?? "").trim().slice(0, 60),
      purchase_date: /^\d{4}-\d{2}-\d{2}$/.test(body.purchase_date ?? "") ? body.purchase_date : undefined,
    });
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
