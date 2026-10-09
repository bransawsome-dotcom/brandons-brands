import { latestYouTubeVideos } from "@/lib/youtube";
import { socials } from "@/lib/socials";
import LatestVideosGrid from "@/components/LatestVideosGrid";

// "Latest from Brandon": his newest YouTube Shorts, refreshed hourly. Tap to play on the page.
// Hidden if YouTube can't be reached.
export default async function LatestVideos({ count = 6, className = "" }: { count?: number; className?: string }) {
  const videos = (await latestYouTubeVideos(3600).catch(() => [])).slice(0, count);
  if (!videos.length) return null;
  return (
    <section aria-label="Latest videos from Brandon" className={`rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-8 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300">New this week</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Latest from Brandon</h2>
          <p className="mt-1 text-sm text-slate-400">Hands-on looks at new releases, microbrands and independents.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {socials.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-1.5 text-slate-200 hover:bg-white/10">
              {s.name} ↗
            </a>
          ))}
        </div>
      </div>
      <LatestVideosGrid videos={videos.map(({ id, title, thumbnail }) => ({ id, title, thumbnail }))} />
    </section>
  );
}
