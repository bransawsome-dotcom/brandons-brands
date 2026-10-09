import { EMAIL_RE, subscribe } from "@/lib/newsletter";

// Newsletter sign-up from the site (footer, blog, guides, sign-up page).
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  // Bots fill every field; people never see this one.
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });
  const email = String(body.email ?? "").trim();
  if (!EMAIL_RE.test(email) || email.length > 200) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  const source = String(body.source ?? "site").replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "site";
  try {
    const added = await subscribe(email, source);
    return Response.json({ ok: true, already: !added });
  } catch (err) {
    console.error("newsletter subscribe failed", err);
    return Response.json({ error: "Couldn't sign you up right now. Please try again later." }, { status: 500 });
  }
}
