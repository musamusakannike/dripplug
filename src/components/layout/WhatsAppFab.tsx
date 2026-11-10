"use client";

import React, { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/config/site";

const STORAGE_KEY = "dripplug_whatsapp_fab_dismissed_v1";
const emptySubscribe = () => () => {};

export function WhatsAppFab() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        return false;
      }
    }
    return false;
  });

  // Hide on admin, checkout, and login pages
  const isHiddenRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/login");

  if (!mounted || dismissed || isHiddenRoute) {
    return null;
  }

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors
    }
  }

  const defaultMessage = encodeURIComponent(
    "Hi Dripplug! I have a question about an item on your store."
  );
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-1.5">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Dripplug on WhatsApp"
        className="group flex items-center gap-2.5 rounded-full bg-[#25D366] text-white pl-3.5 pr-4 py-2.5 shadow-lg hover:bg-[#1ebe5d] hover:shadow-xl active:scale-95 transition-all"
      >
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366] shrink-0" />
        <span className="text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap">
          Chat on WhatsApp
        </span>
      </a>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Close WhatsApp chat button"
        title="Dismiss"
        className="w-7 h-7 rounded-full bg-black/80 text-white hover:bg-black flex items-center justify-center shadow-md transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
