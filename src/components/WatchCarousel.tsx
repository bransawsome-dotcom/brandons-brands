"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type CarouselWatch = { id: string; brand: string; model: string; image: string; href: string };

// A slowly turning 3D ring of watches (Brandon's Favorites) built with CSS 3D transforms only.
// It keeps turning on its own; click-and-drag, a finger swipe, a two-finger trackpad swipe or the
// arrow buttons spin it (with momentum), and tapping a watch opens it. People who ask their device to
// reduce motion get a still ring they can still spin.
const MIN_ITEMS = 8; // repeat watches so the ring always looks full
const SPEED = 6; // degrees per second

export default function WatchCarousel({ watches, className = "" }: { watches: CarouselWatch[]; className?: string }) {
  const router = useRouter();
  const ringRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const vel = useRef(-SPEED); // degrees per second; eases back to the slow auto-turn after a spin
  const still = useRef(false);
  const drag = useRef<{ x: number; start: number; moved: boolean; href?: string; lastX: number; lastT: number; v: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ card: 150, radius: 320 });

  const items = watches.length ? Array.from({ length: Math.max(MIN_ITEMS, watches.length) }, (_, i) => watches[i % watches.length]) : [];
  const step = items.length ? 360 / items.length : 0;

  // Card size and ring radius follow the screen width.
  useEffect(() => {
    const fit = () => {
      const w = Math.min(window.innerWidth, 1200);
      const card = w < 480 ? 130 : w < 900 ? 170 : 210;
      const radius = Math.round((card / 2 + 14) / Math.tan(Math.PI / Math.max(items.length, 3)));
      setSize({ card, radius });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [items.length]);

  // Turn the ring every frame (unless paused, dragging or reduced motion).
  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!drag.current) {
        const cruise = still.current ? 0 : -SPEED;
        vel.current = cruise + (vel.current - cruise) * Math.exp(-dt * 2.2);
        angle.current += vel.current * dt;
      }
      if (ringRef.current) ringRef.current.style.transform = `translateZ(-${size.radius}px) rotateY(${angle.current}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size.radius]);

  // Two-finger sideways swipe on a trackpad spins the ring (vertical scrolling still scrolls the page).
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      angle.current -= e.deltaX * 0.25;
      vel.current = -e.deltaX * 4;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [items.length]);

  const nudge = (dir: 1 | -1) => {
    vel.current = dir * step * 3.2;
  };

  if (items.length < 3) return null;

  return (
    <section aria-label="Brandon's Favorites" className={`relative select-none ${className}`}>
      <div
        className="relative mx-auto cursor-grab touch-pan-y overflow-hidden"
        style={{ height: size.card * 1.8, perspective: size.radius * 3.2 }}
        ref={boxRef}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          const card = (e.target as HTMLElement).closest<HTMLElement>("[data-href]");
          drag.current = { x: e.clientX, start: angle.current, moved: false, href: card?.dataset.href, lastX: e.clientX, lastT: performance.now(), v: 0 };
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.style.cursor = "grabbing";
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 6) d.moved = true;
          angle.current = d.start + dx * 0.35;
          const now = performance.now();
          const dt = (now - d.lastT) / 1000;
          if (dt > 0) d.v = 0.7 * d.v + 0.3 * (((e.clientX - d.lastX) * 0.35) / dt);
          d.lastX = e.clientX;
          d.lastT = now;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          e.currentTarget.style.cursor = "";
          if (!d) return;
          if (d.moved) vel.current = Math.max(-400, Math.min(400, d.v)); // let it coast
          else if (d.href) router.push(d.href);
        }}
        onPointerCancel={(e) => {
          drag.current = null;
          e.currentTarget.style.cursor = "";
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
              className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.25rem] border border-[#D9A43A]/30 bg-slate-950/85 shadow-[0_18px_50px_rgba(0,0,0,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-[#D9A43A]"
              style={{ transform: `rotateY(${i * step}deg) translateZ(${size.radius}px)`, backfaceVisibility: "hidden" }}
            >
              <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/90 to-transparent" />
              </div>
              <div className="px-2 pb-2 pt-1 text-center">
                <p className="truncate text-[10px] uppercase tracking-[0.15em] text-[#D9A43A]">{w.brand}</p>
                <p className="truncate text-xs font-semibold text-white">{w.model}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex items-center justify-center gap-3 text-xs text-slate-400">
        <button type="button" onClick={() => nudge(1)} aria-label="Spin left" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-base text-slate-200 hover:border-[#D9A43A]/60 hover:text-[#D9A43A]">
          ‹
        </button>
        <p>
          <span className="text-[#D9A43A]">⭐ Brandon&apos;s Favorites</span> · drag to spin, tap a watch to see it
        </p>
        <button type="button" onClick={() => nudge(-1)} aria-label="Spin right" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-base text-slate-200 hover:border-[#D9A43A]/60 hover:text-[#D9A43A]">
          ›
        </button>
      </div>
    </section>
  );
}
