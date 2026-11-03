import React from "react";
import { APP_NAME } from "@/config/site";

interface BrandLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

/**
 * Unique monochrome brand loader featuring an animated minimal clothes hanger
 * and price tag in SVG/CSS, with the APP_NAME wordmark below.
 */
export function BrandLoader({
  label = "Loading campus fits...",
  fullScreen = false,
}: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-[65vh] w-full" : "py-12 w-full"
      }`}
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 84"
          className="w-20 h-16 text-black overflow-visible"
          fill="none"
        >
          {/* Animated swaying hanger */}
          <g className="origin-[50px_18px] animate-[pulse_1.4s_ease-in-out_infinite]">
            {/* Hanger hook */}
            <path
              d="M50 28V22C50 19.5 53 18 55 15.5C57.5 12.5 56 7 50 7C45 7 43 10.5 43 13"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Hanger body triangle */}
            <path
              d="M50 28L12 54C8.5 56.4 10.2 62 14.5 62H85.5C89.8 62 91.5 56.4 88 54L50 28Z"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#F0EEED"
            />
            {/* Hanging price tag */}
            <rect
              x="43"
              y="56"
              width="14"
              height="20"
              rx="3"
              fill="#000000"
            />
            <circle cx="50" cy="61" r="1.8" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      <div className="text-center">
        <p className="font-heading text-xl uppercase tracking-tighter text-black">
          {APP_NAME}
        </p>
        <p className="text-xs text-muted mt-1">{label}</p>
      </div>
    </div>
  );
}
