"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ANNOUNCEMENT_BAR } from "@/config/site";
import { useHydrated } from "@/hooks/useHydrated";

export function AnnouncementBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [dismissedInSession, setDismissedInSession] = useState(false);

  const isStoredDismissed =
    hydrated &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(ANNOUNCEMENT_BAR.storageKey) === "true";

  if (
    pathname?.startsWith("/admin") ||
    !ANNOUNCEMENT_BAR.enabled ||
    dismissedInSession ||
    isStoredDismissed
  ) {
    return null;
  }

  function handleDismiss() {
    setDismissedInSession(true);
    try {
      window.localStorage.setItem(ANNOUNCEMENT_BAR.storageKey, "true");
    } catch {
      // Ignore storage errors
    }
  }

  return (
    <div className="bg-black text-white text-xs sm:text-sm py-2 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center pr-6 sm:pr-0">
        <p className="font-normal">
          {ANNOUNCEMENT_BAR.text}{" "}
          <Link
            href={ANNOUNCEMENT_BAR.ctaHref}
            className="font-semibold underline underline-offset-4 hover:text-white/80 transition-colors ml-1"
          >
            {ANNOUNCEMENT_BAR.ctaText}
          </Link>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
