// The Brandon's Brands logo: Brandon's blue chronograph dial. "dial" is the round dial on its own (headers,
// footers, icons); "watch" is the full watch head with case, lugs and pushers (About, Connect).
// A soft glint of light sweeps across the crystal every few seconds; it stays still with "reduce motion" on.
// (Older callers pass secondsPerTurn / syncToClock / handWidth etc.; they're accepted and ignored.)

type Props = {
  className?: string;
  variant?: "dial" | "watch";
  imgClassName?: string;
  glint?: boolean;
  priority?: boolean;
  secondsPerTurn?: number;
  syncToClock?: boolean;
  src?: string;
  handClassName?: string;
  handWidth?: number;
  timeHandsOpacity?: number;
};

// Where the dial sits inside the full watch image (logo-watch-*.webp, 1311 x 1134), as percentages.
const DIAL = { left: 52.1, top: 49.8, size: 69 };

export default function LogoMark({ className = "", variant = "dial", imgClassName = "", glint = true, priority = false, secondsPerTurn }: Props) {
  const fast = secondsPerTurn !== undefined && secondsPerTurn < 10; // loading screens: quicker glint
  const sweep = glint ? (
    <span aria-hidden className={`bb-glint ${fast ? "bb-glint-fast" : ""}`} />
  ) : null;

  if (variant === "watch") {
    return (
      <span className={`${/\babsolute\b/.test(className) ? "" : "relative"} inline-block shrink-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-watch-1024.webp"
          srcSet="/logo-watch-512.webp 512w, /logo-watch-1024.webp 1024w"
          sizes="(max-width: 640px) 80vw, 420px"
          alt=""
          width={1311}
          height={1134}
          loading={priority ? "eager" : "lazy"}
          className={`h-full w-full object-contain ${imgClassName}`}
        />
        <span
          className="pointer-events-none absolute overflow-hidden rounded-full"
          style={{ left: `${DIAL.left - DIAL.size / 2}%`, top: `${DIAL.top - (DIAL.size * 1311) / 1134 / 2}%`, width: `${DIAL.size}%`, aspectRatio: "1" }}
        >
          {sweep}
        </span>
      </span>
    );
  }

  return (
    <span className={`${/\babsolute\b/.test(className) ? "" : "relative"} inline-block shrink-0 overflow-hidden rounded-full ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dial-256.webp"
        srcSet="/logo-dial-256.webp 256w, /logo-dial-512.webp 512w"
        sizes="128px"
        alt=""
        width={256}
        height={256}
        className={`h-full w-full ${imgClassName}`}
      />
      {sweep}
    </span>
  );
}
