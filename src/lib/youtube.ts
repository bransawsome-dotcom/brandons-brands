// Brandon's latest YouTube videos and Shorts, from YouTube's public feed (no API key needed).
// Used by the home page strip and the Friday "Brandon's Favorites" job.

const YT_CHANNEL = process.env.YOUTUBE_CHANNEL_ID || "UCkc5QQKBGM1_63nAZECyiQQ"; // @BrandonsBrands

export type Video = { id: string; title: string; url: string; published: string; description: string; thumbnail: string; views: number };

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// Brandon's latest YouTube videos and Shorts (YouTube's public feed: newest 15).
// cacheSeconds: how long pages may reuse the list (0 = always fresh, for the Friday job).
export async function latestYouTubeVideos(cacheSeconds = 0): Promise<Video[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL}`, {
    signal: AbortSignal.timeout(10_000),
    ...(cacheSeconds > 0 ? { next: { revalidate: cacheSeconds } } : { cache: "no-store" as const }),
  });
  if (!res.ok) throw new Error(`YouTube feed ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
    const id = e.match(/<yt:videoId>([^<]+)</)?.[1] ?? "";
    return {
      id,
      title: decode(e.match(/<title>([^<]*)</)?.[1] ?? ""),
      url: `https://youtu.be/${id}`,
      published: e.match(/<published>([^<]+)</)?.[1] ?? "",
      description: decode(e.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? "").slice(0, 600),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      views: Number(e.match(/views="(\d+)"/)?.[1] ?? 0),
    };
  }).filter((v) => v.id);
}

// The video ID in any YouTube link (youtu.be/x, watch?v=x, shorts/x), else the link itself.
export function videoKey(url: string | null | undefined): string {
  if (!url) return "";
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (m) return `yt:${m[1]}`;
  return url.replace(/[?#].*$/, "").replace(/\/$/, "").toLowerCase();
}

