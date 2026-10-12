"use client";

import { useEffect, useId, useState } from "react";

// The Brandon's Brands logo as an engraved watch dial, drawn in code so it stays crisp at every size:
// a navy bezel with "BRANDON'S BRANDS" engraved in the display capitals, a gold chapter ring, a navy sunburst
// dial with applied gold markers, and slim baton hands. The hour and minute hands show the visitor's local time;
// the gold seconds hand sweeps like a mechanical movement (8 small steps a second). Loading screens sweep faster.
// With "reduce motion" on, the seconds hand stays still.
const C = 100; // centre of the 200 x 200 drawing
const NAVY = "#1b2a41";
const NAVY_DEEP = "#111c2e";
const CREAM = "#f3efe7";
const GOLD = "#c9a45c";
const GOLD_DEEP = "#9c7a45";

function Baton({ length, width, tail }: { length: number; width: number; tail: number }) {
  // A slim tapered baton: cream face, gold edge, a fine centre line like a polished facet.
  const w = width / 2;
  const d = `M${C - w},${C + tail} L${C - w * 0.75},${C - length + 3} L${C},${C - length} L${C + w * 0.75},${C - length + 3} L${C + w},${C + tail} Z`;
  return (
    <>
      <path d={d} fill={CREAM} stroke={GOLD_DEEP} strokeWidth="0.7" strokeLinejoin="round" />
      <line x1={C} y1={C - 2} x2={C} y2={C - length + 4} stroke={GOLD_DEEP} strokeWidth="0.5" opacity="0.7" />
    </>
  );
}

export default function LogoMark({
  className = "",
  secondsPerTurn = 60,
  syncToClock = true,
  imgClassName = "",
  handClassName = "",
  timeHandsOpacity = 1,
}: {
  className?: string;
  secondsPerTurn?: number;
  syncToClock?: boolean;
  src?: string; // kept for older callers; the logo is now drawn, not an image
  imgClassName?: string; // classes for the dial drawing (e.g. a faded logo behind a headline)
  handClassName?: string;
  handWidth?: number; // kept for older callers
  timeHandsOpacity?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const [delay, setDelay] = useState<string | undefined>(undefined);
  const [time, setTime] = useState({ h: 10, m: 8 });
  useEffect(() => {
    const read = () => {
      const now = new Date();
      setTime({ h: now.getHours() % 12, m: now.getMinutes() + now.getSeconds() / 60 });
    };
    if (syncToClock) {
      const now = new Date();
      const s = now.getSeconds() + now.getMilliseconds() / 1000;
      Promise.resolve().then(() => setDelay(`-${s}s`));
    }
    Promise.resolve().then(read);
    const id = window.setInterval(read, 10_000);
    return () => window.clearInterval(id);
  }, [syncToClock]);

  const hourDeg = (time.h + time.m / 60) * 30;
  const minuteDeg = time.m * 6;
  const at = (deg: number) => `rotate(${deg} ${C} ${C})`;
  const steps = Math.max(8, Math.round(secondsPerTurn * 8));

  return (
    <span className={`${/\babsolute\b/.test(className) ? "" : "relative"} inline-block shrink-0 ${className}`}>
      <svg viewBox="0 0 200 200" className={`block h-full w-full ${imgClassName}`} aria-hidden>
        <defs>
          <radialGradient id={`dial${uid}`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#2f4566" />
            <stop offset="70%" stopColor={NAVY} />
            <stop offset="100%" stopColor={NAVY_DEEP} />
          </radialGradient>
          <linearGradient id={`gold${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6c785" />
            <stop offset="50%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DEEP} />
          </linearGradient>
          <path id={`top${uid}`} d={`M ${C - 79},${C} A 79 79 0 0 1 ${C + 79},${C}`} />
          <path id={`bot${uid}`} d={`M ${C - 86},${C} A 86 86 0 0 0 ${C + 86},${C}`} />
        </defs>

        {/* Bezel */}
        <circle cx={C} cy={C} r="98" fill={NAVY_DEEP} />
        <circle cx={C} cy={C} r="96" fill="none" stroke={`url(#gold${uid})`} strokeWidth="1.6" />
        <circle cx={C} cy={C} r="93" fill={NAVY} />
        <text fill={CREAM} fontFamily="var(--font-display-face), 'Times New Roman', serif" fontWeight="600" fontSize="17" letterSpacing="3.2">
          <textPath href={`#top${uid}`} startOffset="50%" textAnchor="middle">
            BRANDON&apos;S
          </textPath>
        </text>
        <text fill={CREAM} fontFamily="var(--font-display-face), 'Times New Roman', serif" fontWeight="600" fontSize="17" letterSpacing="3.2">
          <textPath href={`#bot${uid}`} startOffset="50%" textAnchor="middle">
            BRANDS
          </textPath>
        </text>
        {/* Gold studs at 3 and 9 o'clock, echoing the original badge */}
        <circle cx={C - 83} cy={C} r="3" fill={`url(#gold${uid})`} />
        <circle cx={C + 83} cy={C} r="3" fill={`url(#gold${uid})`} />

        {/* Chapter ring and minute track */}
        <circle cx={C} cy={C} r="70" fill={NAVY_DEEP} stroke={`url(#gold${uid})`} strokeWidth="1.2" />
        <circle cx={C} cy={C} r="64" fill={`url(#dial${uid})`} />
        {Array.from({ length: 60 }, (_, i) => (
          <line
            key={i}
            x1={C}
            y1={C - 68.5}
            x2={C}
            y2={C - (i % 5 ? 66 : 65)}
            stroke={i % 5 ? CREAM : GOLD}
            strokeOpacity={i % 5 ? 0.45 : 1}
            strokeWidth={i % 5 ? 0.5 : 1}
            transform={at(i * 6)}
          />
        ))}

        {/* Sunburst: fine rays that catch the light */}
        <g opacity="0.07" stroke={CREAM} strokeWidth="0.35">
          {Array.from({ length: 90 }, (_, i) => (
            <line key={i} x1={C} y1={C - 6} x2={C} y2={C - 63} transform={at(i * 4)} />
          ))}
        </g>

        {/* Applied hour markers (double at 12) */}
        {Array.from({ length: 12 }, (_, i) =>
          i === 0 ? (
            <g key={i}>
              <rect x={C - 4} y={C - 60} width="2.6" height="11" rx="0.6" fill={`url(#gold${uid})`} />
              <rect x={C + 1.4} y={C - 60} width="2.6" height="11" rx="0.6" fill={`url(#gold${uid})`} />
            </g>
          ) : (
            <rect key={i} x={C - 1.4} y={C - 60} width="2.8" height={i % 3 ? 7 : 10} rx="0.6" fill={`url(#gold${uid})`} transform={at(i * 30)} />
          ),
        )}

        {/* Hour and minute hands */}
        <g opacity={timeHandsOpacity}>
          <g transform={at(hourDeg)}>
            <Baton length={36} width={5.2} tail={8} />
          </g>
          <g transform={at(minuteDeg)}>
            <Baton length={54} width={4.2} tail={10} />
          </g>
        </g>

        {/* Seconds hand: a fine gold needle with a round counterweight */}
        <g className={handClassName}>
          <g
            className="bb-seconds-hand"
            style={{
              transformOrigin: `${C}px ${C}px`,
              transformBox: "view-box",
              animationDuration: `${secondsPerTurn}s`,
              animationDelay: delay,
              animationTimingFunction: `steps(${steps})`,
            }}
          >
            <line x1={C} y1={C + 16} x2={C} y2={C - 60} stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
            <circle cx={C} cy={C + 13} r="2.6" fill={GOLD} />
          </g>
        </g>
        <circle cx={C} cy={C} r="3.4" fill={`url(#gold${uid})`} stroke={NAVY_DEEP} strokeWidth="0.6" />
        <circle cx={C} cy={C} r="1.1" fill={NAVY_DEEP} />
      </svg>
    </span>
  );
}
