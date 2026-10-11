"use client";

import { useEffect, useState } from "react";

// The Brandon's Brands logo with a gold seconds hand sweeping around the dial's center, like a luxury
// automatic. In the header it runs at real time (one turn a minute, matched to the clock); on loading
// screens it sweeps faster. People who ask their device to reduce motion get a still hand.
const PIVOT_X = 49.7; // dial center in the logo, as % of its width
const PIVOT_Y = 48.7;

export default function LogoMark({
  className = "",
  secondsPerTurn = 60,
  syncToClock = true,
  src = "/logo-256.webp",
  imgClassName = "",
  handClassName = "",
  handWidth = 1.6,
}: {
  className?: string;
  secondsPerTurn?: number;
  syncToClock?: boolean;
  src?: string;
  imgClassName?: string; // e.g. faded logo behind the home page headline
  handClassName?: string;
  handWidth?: number; // in % of the logo width; thinner for big logos
}) {
  // Start the hand where the real seconds hand would be (set after load so the server and browser agree).
  const [delay, setDelay] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!syncToClock) return;
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    Promise.resolve().then(() => setDelay(`-${s}s`));
  }, [syncToClock]);

  return (
    <span className={`${/\babsolute\b/.test(className) ? "" : "relative"} inline-block shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={256} height={256} className={`h-full w-full ${imgClassName}`} />
      <svg viewBox="0 0 100 100" className={`pointer-events-none absolute inset-0 h-full w-full ${handClassName}`} aria-hidden>
        <g
          className="bb-seconds-hand"
          style={{
            transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`,
            transformBox: "view-box",
            animationDuration: `${secondsPerTurn}s`,
            animationDelay: delay,
          }}
        >
          <line x1={PIVOT_X} y1={PIVOT_Y + 6} x2={PIVOT_X} y2={PIVOT_Y - 22} stroke="#D9A43A" strokeWidth={handWidth} strokeLinecap="round" />
          <circle cx={PIVOT_X} cy={PIVOT_Y + 5} r={handWidth * 1.05} fill="#D9A43A" />
          <circle cx={PIVOT_X} cy={PIVOT_Y} r={handWidth * 1.25} fill="#D9A43A" stroke="#0b1220" strokeWidth={handWidth * 0.35} />
        </g>
      </svg>
    </span>
  );
}
