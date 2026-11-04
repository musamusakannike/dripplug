import React from "react";

type MarqueeProps = {
  items: readonly string[];
  /** Seconds for one full loop. Higher = slower. */
  duration?: number;
  className?: string;
};

function Star() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-white/60"
      fill="currentColor"
    >
      <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
    </svg>
  );
}

/**
 * Pure-CSS infinite marquee (no package needed).
 * The track holds two identical halves and slides left by exactly 50%,
 * so the loop is seamless. Pauses on hover, stops for reduced-motion users.
 */
export function Marquee({ items, duration = 30, className = "" }: MarqueeProps) {
  // Repeat items so each half is wider than most screens.
  const half = [...items, ...items, ...items];

  const renderHalf = (hidden: boolean) => (
    <ul
      className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
      aria-hidden={hidden || undefined}
    >
      {half.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-center gap-8 sm:gap-12">
          <span className="font-heading whitespace-nowrap text-sm uppercase tracking-wider sm:text-lg">
            {item}
          </span>
          <Star />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] ${className}`}
    >
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${duration}s` }}
      >
        {renderHalf(false)}
        {renderHalf(true)}
      </div>
    </div>
  );
}