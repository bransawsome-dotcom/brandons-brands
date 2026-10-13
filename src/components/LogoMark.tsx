"use client";

import { useEffect, useId, useState } from "react";

// The Brandon's Brands logo: Brandon's blue chronograph, telling the visitor's own local time.
// The photo has its hands removed (logo-*-live-*.webp); the hands, cap and the two sub-dials are drawn on top
// and set from the device clock, so the time is right in every time zone (Eastern, Central, Pacific, anywhere).
// The center seconds hand sweeps smoothly; the left sub-dial counts seconds, the right one minutes (to 30).
// "dial" = the round dial alone (header, footer); "watch" = the whole watch head (About, Connect).
// With "reduce motion" on, the hands still show the right time; the seconds hands simply don't sweep.
// (Older callers pass secondsPerTurn / syncToClock / handWidth etc.; secondsPerTurn < 10 speeds up the loading screen.)

type Props = {
  className?: string;
  variant?: "dial" | "watch";
  imgClassName?: string;
  priority?: boolean;
  secondsPerTurn?: number;
  syncToClock?: boolean;
  src?: string;
  handClassName?: string;
  handWidth?: number;
  timeHandsOpacity?: number;
  glint?: boolean;
};

// Geometry in the photo's own pixels.
const WATCH = { w: 1311, h: 1134, c: [683, 565], subs: [[452, 582], [913, 582]] as [number, number][] };
const DIAL = { w: 904, h: 904, c: [452, 452], subs: [[221, 469], [682, 469]] as [number, number][] };

function SubDial({ x, y, labels, uid }: { x: number; y: number; labels: [string, string, string]; uid: string }) {
  const pos: [number, number][] = [
    [0, -70],
    [61, 37],
    [-61, 37],
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="124" fill={`url(#rim${uid})`} />
      <circle r="114" fill={`url(#face${uid})`} />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          x1="0"
          y1={i % 5 ? -104 : -110}
          x2="0"
          y2={i % 5 ? -96 : -90}
          stroke="#1f242c"
          strokeWidth={i % 5 ? 1.6 : 4.5}
          transform={`rotate(${i * 6})`}
        />
      ))}
      {labels.map((t, i) => (
        <text key={t} x={pos[i][0]} y={pos[i][1]} textAnchor="middle" dominantBaseline="central" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fill="#1f242c">
          {t}
        </text>
      ))}
    </g>
  );
}

export default function LogoMark({ className = "", variant = "dial", imgClassName = "", priority = false, secondsPerTurn }: Props) {
  const uid = useId().replace(/:/g, "");
  const g = variant === "watch" ? WATCH : DIAL;
  const fast = secondsPerTurn !== undefined && secondsPerTurn < 10;
  const turn = fast ? secondsPerTurn! : 60;

  // Rendered at 10:10 on the server, then set to the visitor's local time as soon as the page loads.
  const [t, setT] = useState<{ h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    const read = () => {
      const now = new Date();
      setT({ h: now.getHours() % 12, m: now.getMinutes(), s: now.getSeconds() + now.getMilliseconds() / 1000 });
    };
    Promise.resolve().then(read);
    const id = window.setInterval(read, 15_000);
    const onVisible = () => document.visibilityState === "visible" && read();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const h = t?.h ?? 10;
  const m = t?.m ?? 10;
  const s = t?.s ?? 0;
  const hourDeg = (h + m / 60 + s / 3600) * 30;
  const minuteDeg = (m + s / 60) * 6;
  const counterDeg = ((m % 30) + s / 60) * 12;
  const [cx, cy] = g.c;
  const at = (deg: number, x = cx, y = cy) => `rotate(${deg} ${x} ${y})`;
  const sweep = (x: number, y: number): React.CSSProperties => ({
    transformBox: "view-box",
    transformOrigin: `${x}px ${y}px`,
    animationName: "bb-sweep",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationDuration: `${turn}s`,
    animationDelay: fast || !t ? "0s" : `-${s}s`,
  });

  // A faceted (dauphine) hand pointing up from the center: light left facet, darker right facet.
  const hand = (len: number, half: number, tail: number) => (
    <>
      <path d={`M${cx} ${cy - len} L${cx - half} ${cy - len * 0.16} L${cx} ${cy + tail} Z`} fill={`url(#hl${uid})`} />
      <path d={`M${cx} ${cy - len} L${cx + half} ${cy - len * 0.16} L${cx} ${cy + tail} Z`} fill={`url(#hd${uid})`} />
      <path
        d={`M${cx} ${cy - len} L${cx - half} ${cy - len * 0.16} L${cx} ${cy + tail} L${cx + half} ${cy - len * 0.16} Z`}
        fill="none"
        stroke="#5b636e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </>
  );

  const img =
    variant === "watch"
      ? { src: "/logo-watch-live-1024.webp", srcSet: "/logo-watch-live-512.webp 512w, /logo-watch-live-1024.webp 1024w", sizes: "(max-width: 640px) 80vw, 420px" }
      : { src: "/logo-dial-live-256.webp", srcSet: "/logo-dial-live-256.webp 256w, /logo-dial-live-512.webp 512w", sizes: "128px" };

  return (
    <span
      className={`${/\babsolute\b/.test(className) ? "" : "relative"} inline-block shrink-0 ${variant === "dial" ? "overflow-hidden rounded-full" : ""} ${className}`}
      title={t ? "Your local time" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes={img.sizes}
        alt=""
        width={g.w}
        height={g.h}
        loading={priority ? "eager" : "lazy"}
        className={`block h-full w-full object-contain ${imgClassName}`}
      />
      <svg viewBox={`0 0 ${g.w} ${g.h}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`hl${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d7dce2" />
          </linearGradient>
          <linearGradient id={`hd${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#aeb5be" />
            <stop offset="100%" stopColor="#7d8590" />
          </linearGradient>
          <radialGradient id={`face${uid}`} cx="45%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#fbfbfb" />
            <stop offset="70%" stopColor="#e3e5e8" />
            <stop offset="100%" stopColor="#c9cdd2" />
          </radialGradient>
          <linearGradient id={`rim${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5f6f7" />
            <stop offset="50%" stopColor="#a7aeb6" />
            <stop offset="100%" stopColor="#eef0f2" />
          </linearGradient>
          <radialGradient id={`cap${uid}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#8b939d" />
          </radialGradient>
          <filter id={`sh${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="5" dy="8" stdDeviation="5" floodColor="#000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Sub-dials: left counts seconds, right counts minutes up to 30. */}
        <SubDial x={g.subs[0][0]} y={g.subs[0][1]} labels={["60", "20", "40"]} uid={uid} />
        <SubDial x={g.subs[1][0]} y={g.subs[1][1]} labels={["30", "10", "20"]} uid={uid} />
        <g className="bb-live-sec" style={sweep(g.subs[0][0], g.subs[0][1])}>
          <line x1={g.subs[0][0]} y1={g.subs[0][1] + 18} x2={g.subs[0][0]} y2={g.subs[0][1] - 98} stroke="#1e4f9c" strokeWidth="5" strokeLinecap="round" />
        </g>
        <line
          x1={g.subs[1][0]}
          y1={g.subs[1][1] + 18}
          x2={g.subs[1][0]}
          y2={g.subs[1][1] - 98}
          stroke="#1e4f9c"
          strokeWidth="5"
          strokeLinecap="round"
          transform={at(counterDeg, g.subs[1][0], g.subs[1][1])}
        />
        {g.subs.map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="10" fill="#1e4f9c" />
            <circle cx={x} cy={y} r="4" fill="#9fb4d6" />
          </g>
        ))}

        <g filter={`url(#sh${uid})`}>
          <g transform={at(hourDeg)}>{hand(250, 17, 34)}</g>
          <g transform={at(minuteDeg)}>{hand(372, 14, 40)}</g>
          <g className="bb-live-sec" style={sweep(cx, cy)}>
            <rect x={cx - 2.5} y={cy - 372} width="5" height="482" rx="2.5" fill="#eef0f2" stroke="#6b7480" strokeWidth="0.8" />
          </g>
          <circle cx={cx} cy={cy} r="24" fill={`url(#cap${uid})`} stroke="#4b535e" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="7" fill="#3b424c" />
        </g>
      </svg>
    </span>
  );
}
