// Branded share cards for a member's public collection or wishlist:
// - "link preview" (1200x630) shown when the link is shared on iMessage, WhatsApp, Facebook, X…
// - "story" (1080x1920) a member can save and post to an Instagram/TikTok Story.
// Every card carries brandonsbrands17.com so each share advertises the site.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadPublicList, possessive, type ListKind, type PublicList } from "@/lib/publicLists";
import { SITE_URL } from "@/lib/site";

const NAVY = "#0B1739";
const GOLD = "#D9A43A";
const BLUE = "#93c5fd";

// The site logo, read from the site's own files (no network needed).
async function logoData(): Promise<string> {
  try {
    const buf = await readFile(join(process.cwd(), "public/logo-256.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return `${SITE_URL}/logo-256.png`;
  }
}

// Up to n watch photos, downloaded first so one broken photo can't break the card. PNG/JPEG only.
async function photos(list: PublicList, n: number): Promise<string[]> {
  const out: string[] = [];
  for (const i of list.items) {
    if (out.length >= n) break;
    const u = i.image_url ?? "";
    if (/^data:image\/(png|jpe?g);base64,/.test(u) && u.length < 1_500_000) {
      out.push(u);
      continue;
    }
    if (!/^https:\/\//.test(u)) continue;
    try {
      const res = await fetch(u, { signal: AbortSignal.timeout(4000) });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !/^image\/(png|jpe?g)/.test(type)) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 1_500_000) continue;
      out.push(`data:${type.split(";")[0]};base64,${buf.toString("base64")}`);
    } catch {
      /* skip this photo */
    }
  }
  return out;
}

function brands(list: PublicList): string {
  const counts = new Map<string, number>();
  for (const i of list.items) counts.set(i.brand, (counts.get(i.brand) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([b]) => b)
    .slice(0, 4)
    .join(" · ");
}

export async function loadCardList(handle: string, kind: string): Promise<PublicList | null> {
  if (kind !== "collection" && kind !== "wishlist") return null;
  return loadPublicList(handle, kind as ListKind);
}

function Tile({ src, size }: { src?: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 28,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img src={src} width={size} height={size} style={{ objectFit: "contain" }} />
      ) : (
        <div style={{ width: size * 0.45, height: size * 0.45, borderRadius: 9999, border: `${Math.round(size * 0.04)}px solid ${NAVY}`, display: "flex" }} />
      )}
    </div>
  );
}

export async function cardImage(list: PublicList | null, format: "preview" | "story"): Promise<ImageResponse> {
  const W = format === "story" ? 1080 : 1200;
  const H = format === "story" ? 1920 : 630;
  const logo = await logoData();
  const isCollection = list?.kind !== "wishlist";
  const title = list ? `${possessive(list.display_name)} ${isCollection ? "watch collection" : "wishlist"}` : "Watch collections on Brandon's Brands";
  const count = list ? `${list.items.length} watch${list.items.length === 1 ? "" : "es"}` : "";
  const pics = list ? await photos(list, format === "story" ? 4 : 3) : [];
  const tile = format === "story" ? 440 : 250;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: format === "story" ? "110px 80px" : "56px 64px",
          background: `linear-gradient(160deg, ${NAVY} 0%, #10265c 55%, #07111F 100%)`,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={logo} width={format === "story" ? 120 : 84} height={format === "story" ? 120 : 84} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: format === "story" ? 34 : 24, letterSpacing: 8, color: BLUE }}>BRANDON&apos;S BRANDS</div>
            <div style={{ fontSize: format === "story" ? 30 : 22, color: "#cbd5e1" }}>Luxury Watch Curation</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: format === "story" ? 40 : 20 }}>
          <div style={{ fontSize: format === "story" ? 84 : 58, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          {list ? (
            <div style={{ fontSize: format === "story" ? 40 : 28, color: GOLD, display: "flex" }}>
              {`${count}${brands(list) ? ` · ${brands(list)}` : ""}`}
            </div>
          ) : null}
          {pics.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: format === "story" ? 30 : 6 }}>
              {pics.map((p, i) => (
                <Tile key={i} src={p} size={tile} />
              ))}
            </div>
          ) : list && list.items.length ? (
            // No usable photos: list the watches instead.
            <div style={{ display: "flex", flexDirection: "column", gap: format === "story" ? 22 : 10, marginTop: 10 }}>
              {list.items.slice(0, format === "story" ? 6 : 3).map((i, n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    fontSize: format === "story" ? 44 : 30,
                    color: "#ffffff",
                    padding: format === "story" ? "22px 32px" : "10px 22px",
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.08)",
                    border: "2px solid rgba(147,197,253,0.25)",
                  }}
                >
                  {`${i.brand} ${i.model}`.slice(0, 48)}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: format === "story" ? 40 : 26, color: "#e2e8f0" }}>
            {isCollection ? "See it, make an offer, and build your own:" : "Have one to sell? Make an offer:"}
          </div>
          <div style={{ fontSize: format === "story" ? 52 : 34, fontWeight: 700, color: GOLD }}>
            {list ? `brandonsbrands17.com/collectors/${list.handle}` : "brandonsbrands17.com"}
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
