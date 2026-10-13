// Thin line icons that replace emoji across the site (navy by default; they take the text colour).
// Pass either an icon name or the emoji it replaces, so data that still stores emoji (forum topics etc.)
// renders as a line icon: <Glyph e="💬" /> or <Glyph name="chat" />.

const PATHS: Record<string, string> = {
  chat: "M4 5h16v10H9l-5 4z",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0",
  bellOff: "M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l1.5 2H8M10 20a2 2 0 0 0 4 0M4 4l16 16",
  tag: "M3 12V4h8l9 9-8 8zM7.5 7.5h.01",
  coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM14.5 9c-.5-1-1.4-1.4-2.5-1.4-1.5 0-2.5.8-2.5 1.9 0 2.6 5 1.4 5 4 0 1.1-1 2-2.5 2-1.2 0-2.2-.5-2.6-1.5M12 6.5v1.1M12 16.5v1",
  handshake: "M3 11l4-4 4 2 3-2 7 5-4 4M7 7l-4 4 6 6 2-1M11 16l2 1.5M13 14l2.5 2M15 12l2.5 2",
  mail: "M3.5 6h17v12h-17zM3.5 6l8.5 7 8.5-7",
  camera: "M4 8h3l2-2.5h6L17 8h3v11H4zM12 10.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3.5v4M16 3.5v4",
  pen: "M4 20l1-4L16 5l3 3L8 19zM14 7l3 3",
  folder: "M3.5 6.5h6l2 2h9v10h-17z",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9s1.2-6.4 3.7-9z",
  megaphone: "M4 10v4h3l8 4V6L7 10zM18 9.5a3.5 3.5 0 0 1 0 5M7 14l1.5 5",
  phone: "M8 3h8v18H8zM11 18h2",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  pin: "M12 21s-6-5.6-6-10.5a6 6 0 1 1 12 0C18 15.4 12 21 12 21zM12 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  plus: "M12 5v14M5 12h14",
  inbox: "M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5",
  book: "M5 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5zM19 4h-6M19 4v14h-6",
  music: "M9 18V6l10-2v12M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0z",
  thumb: "M7 11v9H4v-9zM7 11l4-7c1.5 0 2.3 1 2 2.5L12.5 10H19a1.5 1.5 0 0 1 1.5 1.8l-1.4 6.6A2 2 0 0 1 17.2 20H7",
  chart: "M4 20h16M6 16l4-5 3 3 5-7",
  box: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8",
  smile: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14c1.8 2 5.2 2 7 0M9 9.5h.01M15 9.5h.01",
  wave: "M7 12V6.5a1.5 1.5 0 0 1 3 0V11M10 11V5a1.5 1.5 0 0 1 3 0v6M13 11V6.5a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7-6 7-2.5 0-4-1.5-5.5-4L3 13a1.5 1.5 0 0 1 2.5-1.5L7 13",
  puzzle: "M5 8h3.5a2 2 0 1 1 4 0H16v3.5a2 2 0 1 1 0 4V19H5z",
  bulb: "M9 17h6M10 20h4M12 3a6 6 0 0 0-3.5 10.9V15h7v-1.1A6 6 0 0 0 12 3z",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  thread: "M5 6h14M5 10h10M5 14h14M5 18h8",
  laptop: "M5 5h14v10H5zM3 19h18",
  cabinet: "M5 3h14v18H5zM5 9h14M5 15h14M10 6h4M10 12h4M10 18h4",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  cart: "M3 4h2.5l2 11h10.5l2-8H6.5M9 19.5a1 1 0 1 0 0 .01M17 19.5a1 1 0 1 0 0 .01",
  gear: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1",
  scroll: "M7 4h11v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3h11a3 3 0 0 0 3 3M7 4a2 2 0 0 0-2 2v11M10 8h5M10 12h5",
  film: "M4 5h16v14H4zM8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4",
  ballot: "M5 10h14v10H5zM8 10V4h8v6M10 7l1.5 1.5L14 6",
  watch: "M9 3h6l.8 3.5M9 3l-.8 3.5m0 11L9 21h6l.8-3.5M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2.5V12l1.6 1",
  money: "M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM6 10v4M18 10v4",
  hourglass: "M6.5 3h11M6.5 21h11M8 3c0 4.5 4 5 4 9s-4 4.5-4 9M16 3c0 4.5-4 5-4 9s4 4.5 4 9",
  reply: "M9 7l-5 5 5 5M4 12h11a5 5 0 0 1 5 5v1",
  newItem: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8",
  play: "M7.5 4.5v15l12-7.5z",
};

const EMOJI: Record<string, keyof typeof PATHS> = {
  "💬": "chat", "🗨": "chat", "⭐": "star", "🔔": "bell", "🔕": "bellOff", "🏷": "tag", "💰": "coin", "🤝": "handshake",
  "✉": "mail", "📷": "camera", "📸": "camera", "📅": "calendar", "📝": "pen", "✍": "pen", "📁": "folder", "📂": "folder",
  "🗂": "folder", "🔒": "lock", "🌐": "globe", "📢": "megaphone", "📲": "phone", "🔎": "search", "🔍": "search", "📍": "pin",
  "➕": "plus", "💵": "money", "📥": "inbox", "📚": "book", "🎵": "music", "👍": "thumb", "📈": "chart", "📦": "box",
  "🙂": "smile", "👋": "wave", "🧩": "puzzle", "💡": "bulb", "✨": "sparkle", "🧵": "thread", "💻": "laptop", "🗃": "cabinet",
  "👀": "eye", "🛒": "cart", "⚙": "gear", "📜": "scroll", "🎬": "film", "🗳": "ballot", "⌚": "watch", "🤍": "star",
  "⏳": "hourglass", "⌛": "hourglass", "↩": "reply", "🆕": "newItem", "▶": "play",
};

export function glyphName(emoji: string | null | undefined): string | null {
  if (!emoji) return null;
  const e = emoji.replace(/️/g, "").trim();
  return EMOJI[e] ?? (PATHS[e] ? e : null);
}

export default function Glyph({ e, name, size = 16, className = "" }: { e?: string | null; name?: string; size?: number; className?: string }) {
  const key = name ?? glyphName(e);
  const d = key ? PATHS[key] : null;
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
    >
      <path d={d} />
    </svg>
  );
}
