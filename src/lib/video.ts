// Turn a link to one of Brandon's videos into something the site can play in place
// (YouTube videos/Shorts, Instagram reels/posts, TikTok videos). Returns null for anything else.

export type Embed = { src: string; platform: "YouTube" | "Instagram" | "TikTok"; vertical: boolean };

export function videoEmbed(link: string | null | undefined): Embed | null {
  if (!link) return null;
  let u: URL;
  try {
    u = new URL(link);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be" || host.endsWith("youtube.com")) {
    const id =
      host === "youtu.be"
        ? u.pathname.slice(1)
        : u.searchParams.get("v") ?? u.pathname.match(/\/(?:shorts|embed|live)\/([^/?#]+)/)?.[1] ?? "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    // Brandon's channel is Shorts, so play them upright.
    return { src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`, platform: "YouTube", vertical: true };
  }
  if (host === "instagram.com") {
    const m = u.pathname.match(/^\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!m) return null;
    const kind = m[1] === "reels" ? "reel" : m[1];
    return { src: `https://www.instagram.com/${kind}/${m[2]}/embed/`, platform: "Instagram", vertical: true };
  }
  if (host === "tiktok.com") {
    const id = u.pathname.match(/\/video\/(\d+)/)?.[1];
    if (!id) return null;
    return { src: `https://www.tiktok.com/embed/v2/${id}`, platform: "TikTok", vertical: true };
  }
  return null;
}
