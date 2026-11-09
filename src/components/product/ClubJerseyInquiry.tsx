"use client";

import React, { useState } from "react";
import { MessageCircle, Shirt } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/config/site";

const QUICK_CLUBS = [
  "PSG",
  "AC Milan",
  "Bayern Munich",
  "Inter Milan",
  "Juventus",
  "Inter Miami",
  "Al Nassr",
  "Super Eagles",
] as const;

const JERSEY_SIZES = ["M", "L", "XL", "XXL", "XXXL"] as const;

interface ClubJerseyInquiryProps {
  variant?: "product" | "catalog";
  defaultSize?: string;
  initialQuery?: string;
}

export function ClubJerseyInquiry({
  variant = "product",
  defaultSize = "L",
  initialQuery = "",
}: ClubJerseyInquiryProps) {
  const [clubInput, setClubInput] = useState(initialQuery);
  const [size, setSize] = useState(
    JERSEY_SIZES.includes(defaultSize as (typeof JERSEY_SIZES)[number])
      ? defaultSize
      : "L"
  );

  function buildWhatsAppUrl() {
    const targetClub = clubInput.trim() || "a specific football club";
    const text = `Hi Dripplug! I want to check if you have the *${targetClub}* jersey available in size *${size}* (₦12,500).`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.open(buildWhatsAppUrl(), "_blank", "noopener,noreferrer");
  }

  if (variant === "catalog") {
    return (
      <div className="mt-8 rounded-[20px] border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 mb-2.5">
              <Shirt className="w-3.5 h-3.5" />
              Club Jersey Finder
            </div>
            <h3 className="font-heading text-lg sm:text-xl uppercase tracking-tight text-black">
              Don&apos;t see your club or kit version?
            </h3>
            <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
              We stock more clubs and Home/Away/Third kits than what&apos;s pictured online. Enter the club &amp; size below to confirm availability instantly on WhatsApp.
            </p>
            <div className="flex items-center flex-wrap gap-1.5 mt-3">
              {QUICK_CLUBS.map((club) => (
                <button
                  key={club}
                  type="button"
                  onClick={() => setClubInput(club)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    clubInput.toLowerCase() === club.toLowerCase()
                      ? "bg-black text-white border-black font-semibold"
                      : "bg-white text-muted border-border hover:border-black hover:text-black"
                  }`}
                >
                  {club}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0"
          >
            <input
              type="text"
              value={clubInput}
              onChange={(e) => setClubInput(e.target.value)}
              placeholder="e.g. AC Milan Away, PSG Home..."
              aria-label="Club name and kit version"
              className="h-11 px-4 rounded-full bg-white border border-border text-xs sm:text-sm text-black placeholder:text-muted-light focus:outline-none focus:border-black min-w-[210px]"
            />
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              aria-label="Select jersey size"
              className="h-11 px-3.5 rounded-full bg-white border border-border text-xs sm:text-sm font-medium text-black focus:outline-none focus:border-black cursor-pointer"
            >
              {JERSEY_SIZES.map((s) => (
                <option key={s} value={s}>
                  Size: {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-11 px-5 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#25D366] shrink-0" />
              Ask on WhatsApp
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-[16px] border border-border bg-surface/70 p-4">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
          <Shirt className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-black">
            Looking for another club or kit version?
          </p>
          <p className="text-xs text-muted mt-0.5">
            Type any club (e.g. PSG, AC Milan, Bayern, Inter Miami) or kit below to check instant stock on WhatsApp.
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-1.5 mt-3">
        {QUICK_CLUBS.slice(0, 6).map((club) => (
          <button
            key={club}
            type="button"
            onClick={() => setClubInput(club)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
              clubInput.toLowerCase() === club.toLowerCase()
                ? "bg-black text-white border-black font-semibold"
                : "bg-white text-muted border-border hover:border-black hover:text-black"
            }`}
          >
            {club}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <input
          type="text"
          value={clubInput}
          onChange={(e) => setClubInput(e.target.value)}
          placeholder="Enter club & kit (e.g. AC Milan Home)..."
          aria-label="Club name and kit"
          className="flex-1 h-10 px-3.5 rounded-full bg-white border border-border text-xs sm:text-sm text-black placeholder:text-muted-light focus:outline-none focus:border-black"
        />
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          aria-label="Jersey size"
          className="h-10 px-3 rounded-full bg-white border border-border text-xs font-medium text-black focus:outline-none focus:border-black cursor-pointer"
        >
          {JERSEY_SIZES.map((s) => (
            <option key={s} value={s}>
              Size {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 px-4 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4 fill-white text-[#25D366] shrink-0" />
          Check Availability
        </button>
      </form>
    </div>
  );
}
