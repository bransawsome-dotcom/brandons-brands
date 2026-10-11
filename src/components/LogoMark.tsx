"use client";

import { useEffect, useState } from "react";

// The Brandon's Brands logo as a working watch: its hour and minute hands show the visitor's own local
// time (their device's time zone), and a gold seconds hand sweeps once a minute in step with the clock.
// The logo image has its printed hands removed (logo-dial-*.webp) so these live hands replace them.
// On loading screens the seconds hand sweeps faster. With "reduce motion" on, the seconds hand stays still.
const PIVOT_X = 49.6; // dial center in the logo, as % of its width
const PIVOT_Y = 48.8;

// One hand pointing straight up from the pivot, in the logo's style: a slim shaft and a leaf-shaped tip.
function Hand({ length, leafStart, leafEnd, leafWidth, shaft }: { length: number; leafStart: number; leafEnd: number; leafWidth: number; shaft: number }) {
  const x = PIVOT_X;
  const y = PIVOT_Y;
  const leaf = `M${x},${y - leafStart} C${x + leafWidth},${y - leafStart - 1.2} ${x + leafWidth * 0.9},${y - leafEnd + 2} ${x},${y - length} C${x - leafWidth * 0.9},${y - leafEnd + 2} ${x - leafWidth},${y - leafStart - 1.2} ${x},${y - leafStart} Z`;
  return (
    <>
      <line x1={x} y1={y + 1.5} x2={x} y2={y - leafStart - 0.5} stroke="#0b1220" strokeWidth={shaft + 0.9} strokeLinecap="round" />
      <line x1={x} y1={y + 1.5} x2={x} y2={y - leafStart - 0.5} stroke="#e0f2fe" strokeWidth={shaft} strokeLinecap="round" />
      <path d={leaf} fill="url(#bbHandFill)" stroke="#0b1220" strokeWidth="0.55" strokeLinejoin="round" />
      <path d={`M${x},${y - leafStart} L${x},${y - length}`} stroke="#7dd3fc" strokeWidth="0.35" opacity="0.8" />
    </>
  );
}

export default function LogoMark({
  className = "",
  secondsPerTurn = 60,
  syncToClock = true,
  src = "/logo-dial-256.webp",
  imgClassName = "",
  handClassName = "",
  handWidth = 1.6,
  timeHandsOpacity = 1,
}: {
  className?: string;
  secondsPerTurn?: number;
  syncToClock?: boolean;
  src?: string;
  imgClassName?: string; // e.g. faded logo behind the home page headline
  handClassName?: string;
  handWidth?: number; // gold seconds hand thickness in % of the logo width; thinner for big logos
  timeHandsOpacity?: number; // hour and minute hands (match a faded logo)
}) {
  // Start the seconds hand where the real one would be, and keep the hour and minute hands on local time.
  // Everything renders at 10:08 on the server, then jumps to the visitor's time once the page loads.
  const [delay, setDelay] = useState<string | undefined>(undefined);
  const [time, setTime] = useState({ h: 10, m: 8 });
  useEffect(() => {
    const read = () => {
      const now = new Date();
      setTime({ h: now.getHours() % 12, m: now.getMinutes() + now.getSeconds() / 60 });
      return now;
    };
    const now = new Date();
    if (syncToClock) {
      const s = now.getSeconds() + now.getMilliseconds() / 1000;
      Promise.resolve().then(() => setDelay(`-${s}s`));
    }
    Promise.resolve().then(read);
    const id = window.setInterval(read, 10_000);
    return () => window.clearInterval(id);
  }, [syncToClock]);

  const hourDeg = (time.h + time.m / 60) * 30;
  const minuteDeg = time.m * 6;
  const at = (deg: number) => `rotate(${deg} ${PIVOT_X} ${PIVOT_Y})`;

  return (
    <span className={`${/\babsolute\b/.test(className) ? "" : "relative"} inline-block shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={256} height={256} className={`h-full w-full ${imgClassName}`} />
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="bbHandFill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
        </defs>
        <g opacity={timeHandsOpacity}>
          <g transform={at(hourDeg)}>
            <Hand length={19.5} leafStart={6} leafEnd={14} leafWidth={3} shaft={1.3} />
          </g>
          <g transform={at(minuteDeg)}>
            <Hand length={24.6} leafStart={14} leafEnd={22.5} leafWidth={2.7} shaft={1.3} />
          </g>
          <circle cx={PIVOT_X} cy={PIVOT_Y} r="2.6" fill="#f8fafc" stroke="#0b1220" strokeWidth="0.6" />
          <circle cx={PIVOT_X} cy={PIVOT_Y} r="1.4" fill="#38bdf8" />
        </g>
        <g className={handClassName}>
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
        </g>
      </svg>
    </span>
  );
}
