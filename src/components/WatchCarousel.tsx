"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type CarouselWatch = { id: string; brand: string; model: string; image: string; href: string };

// A slowly turning 3D ring of watches (Brandon's Favorites) built with CSS 3D transforms only.
// Hover or touch pauses it, drag or swipe spins it, tapping a watch opens it. People who ask their
// device to reduce motion get a still ring they can still drag.
const MIN_ITEMS = 8; // repeat watches so the ring always looks full
const SPEED = 6; // degrees per second

export default function WatchCarousel({ watches, className = "" }: { watches: CarouselWatch[]; className?: string }) {
  const router = useRouter();
  const ringRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const paused = useRef(false);
  const drag = useRef<{ x: number; start: number; moved: boolean; href?: string } | null>(null);
  const [size, setSize] = useState({ card: 150, radius: 320 });

  const items = watches.length ? Array.from({ length: Math.max(MIN_ITEMS, watches.length) }, (_, i) => watches[i % watches.length]) : [];
  const step = items.length ? 360 / items.length : 0;

  // Card size and ring radius follow the screen width.
  useEffect(() => {
    const fit = () => {
      const w = Math.min(window.innerWidth, 1200);
      const card = w < 480 ? 110 : w < 900 ? 140 : 170;
      const radius = Math.round((card / 2 + 14) / Math.tan(Math.PI / Math.max(items.length, 3)));
      setSize({ card, radius });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [items.length]);

  // Turn the ring every frame (unless paused, dragging or reduced motion).
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!still && !paused.current && !drag.current) angle.current -= SPEED * dt;
      if (ringRef.current) ringRef.current.style.transform = `translateZ(-${size.radius}px) rotateY(${angle.current}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size.radius]);

  if (items.length < 3) return null;

  return (
    <section aria-label="Brandon's Favorites" className={`relative select-none ${className}`}>
      <div
        className="relative mx-auto touch-pan-y overflow-hidden"
        style={{ height: size.card * 1.8, perspective: size.radius * 3.2 }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") paused.current = true;
        }}
        onPointerLeave={() => {
          paused.current = false;
          drag.current = null;
        }}
        onPointerDown={(e) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>("[data-href]");
          drag.current = { x: e.clientX, start: angle.current, moved: false, href: card?.dataset.href };
          e.currentTarget.setPointerCapture(e.pointerId);
          if (e.pointerType !== "mouse") paused.current = true;
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 6) d.moved = true;
          angle.current = d.start + dx * 0.35;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (e.pointerType !== "mouse") window.setTimeout(() => (paused.current = false), 1500);
          if (d && !d.moved && d.href) router.push(d.href);
        }}
        onPointerCancel={() => {
          drag.current = null;
          paused.current = false;
        }}
      >
        <div
          ref={ringRef}
          className="absolute left-1/2 top-1/2"
          style={{ transformStyle: "preserve-3d", width: size.card, height: size.card * 1.3, marginLeft: -size.card / 2, marginTop: -(size.card * 1.3) / 2 }}
        >
          {items.map((w, i) => (
            <div
              key={`${w.id}-${i}`}
              data-href={w.href}
              role="link"
              tabIndex={i < watches.length ? 0 : -1}
              aria-label={`${w.brand} ${w.model}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(w.href);
              }}
              className="absolute inset-0 flex cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border border-[#D9A43A]/30 bg-slate-950/85 shadow-[0_18px_50px_rgba(0,0,0,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-[#D9A43A]"
              style={{ transform: `rotateY(${i * step}deg) translateZ(${size.radius}px)`, backfaceVisibility: "hidden" }}
            >
              <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-white/10 to-transparent p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.image} alt="" draggable={false} loading="lazy" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="px-2 pb-2 pt-1 text-center">
                <p className="truncate text-[10px] uppercase tracking-[0.15em] text-[#D9A43A]">{w.brand}</p>
                <p className="truncate text-xs font-semibold text-white">{w.model}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-center text-xs text-slate-400">
        <span className="text-[#D9A43A]">⭐ Brandon&apos;s Favorites</span> · drag to spin, tap a watch to see it
      </p>
    </section>
  );
}
