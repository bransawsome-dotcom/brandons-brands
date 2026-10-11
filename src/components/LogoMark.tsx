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
}: {
  className?: string;
  secondsPerTurn?: number;
  syncToClock?: boolean;
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
    <span className={`relative inline-block shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-256.webp" alt="" width={256} height={256} className="h-full w-full" />
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <g
          className="bb-seconds-hand"
          style={{
            transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`,
            transformBox: "view-box",
            animationDuration: `${secondsPerTurn}s`,
            animationDelay: delay,
          }}
        >
          <line x1={PIVOT_X} y1={PIVOT_Y + 6} x2={PIVOT_X} y2={PIVOT_Y - 22} stroke="#D9A43A" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx={PIVOT_X} cy={PIVOT_Y + 5} r="1.7" fill="#D9A43A" />
          <circle cx={PIVOT_X} cy={PIVOT_Y} r="2" fill="#D9A43A" stroke="#0b1220" strokeWidth="0.6" />
        </g>
      </svg>
    </span>
  );
}
