import { AiError } from "@/lib/watchAi";
import { requireModerator } from "@/lib/moderatorAuth";
import { buildDigest, digestHtml, postalAddress, sendDigest } from "@/lib/newsletter";

// Moderators only: preview this week's newsletter (GET) and send it (POST).
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function fail(err: unknown) {
  const status = err instanceof AiError ? err.status : 500;
  return Response.json({ error: err instanceof Error ? err.message : "Something went wrong." }, { status });
}

export async function GET(request: Request) {
  try {
    await requireModerator(request);
    const intro = new URL(request.url).searchParams.get("intro") ?? "";
    const d = await buildDigest(intro);
    return Response.json({ subject: d.subject, html: digestHtml(d.inner), subscribers: d.count, addressReady: Boolean(postalAddress()) });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireModerator(request);
    const body = (await request.json().catch(() => ({}))) as { intro?: string; subject?: string; test?: boolean };
    const intro = String(body.intro ?? "").slice(0, 1500);
    if (body.test) {
      if (!me.email) throw new AiError("Your account has no email address.", 400);
      await sendDigest({ intro, subject: body.subject, testTo: me.email });
      return Response.json({ ok: true, sent: 1, to: me.email });
    }
    const sent = await sendDigest({ intro, subject: body.subject, sentBy: me.userId });
    return Response.json({ ok: true, sent });
  } catch (err) {
    return fail(err);
  }
}
