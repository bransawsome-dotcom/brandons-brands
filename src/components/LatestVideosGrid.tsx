"use client";

import { useState } from "react";
import VideoEmbed from "@/components/VideoEmbed";
import { videoEmbed } from "@/lib/video";

// Thumbnails of Brandon's newest Shorts; tapping one plays it right here.
export default function LatestVideosGrid({ videos }: { videos: { id: string; title: string; thumbnail: string }[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const clean = (t: string) => t.replace(/\s#\S+/g, "").trim();
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {videos.map((v) => {
        const embed = videoEmbed(`https://youtu.be/${v.id}`);
        return (
          <li key={v.id} className="min-w-0">
            {playing === v.id && embed ? (
              <VideoEmbed embed={embed} title={clean(v.title)} />
            ) : (
              <button type="button" onClick={() => setPlaying(v.id)} className="group block w-full text-left" aria-label={`Play: ${clean(v.title)}`}>
                <span className="relative block aspect-[9/16] overflow-hidden rounded-2xl bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
                  <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-xl text-white group-hover:bg-[#0E5A8F]" aria-hidden>
                    ▶
                  </span>
                </span>
                <span className="mt-2 line-clamp-2 block text-xs font-semibold leading-5 text-slate-200">{clean(v.title)}</span>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
