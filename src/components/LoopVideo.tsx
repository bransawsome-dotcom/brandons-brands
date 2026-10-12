"use client";

import { useEffect, useRef, useState } from "react";

// Muted background film that only loads and plays while on screen. Phones get the small 640px file;
// people who ask for reduced motion just see the poster.
export default function LoopVideo({
  name,
  poster,
  className = "",
  label,
  loop = true,
}: {
  name: string; // file stem in /redesign/video, e.g. "movement"
  poster: string;
  className?: string;
  label?: string; // accessible description; omit for decoration
  loop?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [sources, setSources] = useState<{ src: string; type: string }[]>([]);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const small = window.matchMedia("(max-width: 700px)").matches;
    const base = `/redesign/video/${name}`;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!started) {
            started = true;
            setSources(small ? [{ src: `${base}-640.mp4`, type: "video/mp4" }] : [{ src: `${base}.webm`, type: "video/webm" }, { src: `${base}.mp4`, type: "video/mp4" }]);
          } else void v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [name]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !sources.length) return;
    v.load();
    void v.play().catch(() => {});
  }, [sources]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop={loop}
      playsInline
      preload="none"
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}
