// A collector shown as a watch medallion: a colored, ticked bezel around a cream dial with their initial.
// The bezel turns when the medallion is hovered or focused (CSS in globals.css: .bb-medal).

const DIAL_COLORS = ["#2f5a46", "#23406b", "#e4a487", "#b9d99a", "#1f1e1c", "#d8cfbd", "#7a2432", "#d2ad5c", "#4f6b82", "#8a6a4a"];

export function medalColor(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return DIAL_COLORS[h % DIAL_COLORS.length];
}

export default function CollectorMedallion({ name, seed, size = 176 }: { name: string; seed: string; size?: number }) {
  const color = medalColor(seed);
  const initial = (name.trim()[0] || "?").toUpperCase();
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden className="bb-medal block">
      <g className="bb-medal-bezel">
        <circle cx="100" cy="100" r="88" fill="none" stroke={color} strokeWidth="16" />
        {ticks.map((i) => (
          <line
            key={i}
            x1="100"
            y1={i % 5 ? 15 : 13}
            x2="100"
            y2={i % 5 ? 21 : 25}
            stroke={i % 15 ? "rgba(255,255,255,0.55)" : "#e6c27a"}
            strokeWidth={i % 5 ? 1 : 1.8}
            transform={`rotate(${i * 6} 100 100)`}
          />
        ))}
      </g>
      <circle cx="100" cy="100" r="78" fill="#f8f5ef" />
      <circle cx="100" cy="100" r="66" fill="none" stroke="#d8cebe" strokeWidth="1" />
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1="100" y1="36" x2="100" y2="42" stroke="#9d9382" strokeWidth="1.5" transform={`rotate(${a} 100 100)`} />
      ))}
      <text x="100" y="100" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-display-face), 'Times New Roman', serif" fontWeight="600" fontSize="50" fill="#1b2a41">
        {initial}
      </text>
    </svg>
  );
}
