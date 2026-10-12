import { loadFavorites } from "@/lib/favorites";
import { latestYouTubeVideos } from "@/lib/youtube";
import { socials } from "@/lib/socials";

// "Recent videos": tall portrait cards, one per watch Brandon filmed. Uses his favorites that have a photo and a
// video link (brand + model), topped up with his newest YouTube Shorts. Each card opens the video on its platform.
type Card = { key: string; href: string; image: string; brand: string; title: string; platform: string; handle: string };

function platformOf(url: string): string {
  if (/instagram\.com/i.test(url)) return "Instagram";
  if (/tiktok\.com/i.test(url)) return "TikTok";
  if (/facebook\.com|fb\.watch/i.test(url)) return "Facebook";
  return "YouTube";
}

export default async function RecentVideoCards({ count = 4 }: { count?: number }) {
  const [favorites, videos] = await Promise.all([loadFavorites(), latestYouTubeVideos(3600).catch(() => [])]);
  const cards: Card[] = [];
  for (const f of favorites) {
    if (cards.length >= count) break;
    if (!f.image_url || !f.link_url || !/^https:\/\//i.test(f.link_url)) continue;
    const platform = platformOf(f.link_url);
    cards.push({
      key: f.id,
      href: f.link_url,
      image: f.image_url,
      brand: f.brand,
      title: f.model,
      platform,
      handle: socials.find((s) => s.name === platform)?.handle ?? "@brandonsbrands17",
    });
  }
  for (const v of videos) {
    if (cards.length >= count) break;
    const title = v.title.replace(/\s#\S+/g, "").trim();
    cards.push({ key: v.id, href: v.url, image: v.thumbnail, brand: "Brandon's Brands", title, platform: "YouTube", handle: "@BrandonsBrands" });
  }
  if (!cards.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {cards.map((c) => (
        <li key={c.key} className="min-w-0">
          <a
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${c.brand} ${c.title} on ${c.platform}`}
            className="group relative block aspect-[9/16] overflow-hidden rounded-md border border-hairline bg-surface"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.image}
              alt={`${c.brand} ${c.title}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" />
            <span className="absolute left-3 top-3 text-[11px] font-medium tracking-[0.06em] text-white/90 sm:left-4 sm:top-4">{c.handle}</span>
            <span
              aria-hidden
              className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-black/25 pl-0.5 text-base text-white backdrop-blur-sm transition group-hover:border-gold-bright group-hover:bg-gold group-hover:text-on-gold sm:h-14 sm:w-14"
            >
              ▶
            </span>
            <span className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-[#e6c27a]">
                {c.brand} · {c.platform}
              </span>
              <span className="mt-1 line-clamp-2 block font-display text-lg font-semibold uppercase leading-tight text-white sm:text-xl">{c.title}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
