import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME, CAMPUS_CITY, CAMPUS_NAME, DELIVERY_POINTS } from "@/config/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: `About ${APP_NAME}`,
  description: `How ${APP_NAME} makes buying campus streetwear effortless for ${CAMPUS_NAME} students.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted">
          Our Story
        </p>
        <h1 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight mt-2">
          BUILT FOR {CAMPUS_NAME} STUDENTS
        </h1>
      </div>

      <div className="rounded-[24px] bg-surface p-6 sm:p-8 space-y-4 text-sm sm:text-base leading-relaxed text-black">
        <p>
          Every semester at {CAMPUS_NAME} in {CAMPUS_CITY}, buying a simple
          heavyweight round neck tee, retro football jersey, or baggy jeans used
          to mean messaging ten different WhatsApp statuses, waiting hours for
          &ldquo;DM for price&rdquo;, and haggling over delivery fees.
        </p>
        <p>
          <strong>{APP_NAME}</strong> puts verified campus fashion in one fast,
          transparent store. Every price is clearly listed in Naira, every size
          and color shows real-time stock, and checkout is protected by Paystack.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DELIVERY_POINTS.map((pt) => (
          <div
            key={pt.id}
            className="rounded-[20px] border border-border p-5 bg-white"
          >
            <h2 className="font-bold text-base">{pt.name} Drop-Off</h2>
            <p className="text-2xl font-black mt-1">
              {pt.fee === 0 ? "FREE" : formatPrice(pt.fee)}
            </p>
            <p className="text-xs text-muted mt-2">{pt.description}</p>
          </div>
        ))}
      </div>

      <div>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/90 transition-colors"
        >
          Browse the Collection
        </Link>
      </div>
    </div>
  );
}
