import React from "react";
import type { Metadata } from "next";
import { APP_NAME, DELIVERY_POINTS, SUPPORT_EMAIL } from "@/config/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Campus Delivery & Returns Policy",
  description: `Delivery points, estimated drop-off windows, and 48-hour size exchange policy at ${APP_NAME}.`,
  alternates: { canonical: "/delivery-returns" },
};

export default function DeliveryReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <h1 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight">
        DELIVERY &amp; RETURNS
      </h1>

      <section className="space-y-4">
        <h2 className="font-bold text-xl">UNILORIN Campus Drop-Off Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DELIVERY_POINTS.map((pt) => (
            <div
              key={pt.id}
              className="rounded-[20px] border border-border p-5 bg-surface/50"
            >
              <div className="flex items-center justify-between font-bold text-base">
                <span>{pt.name}</span>
                <span>{pt.fee === 0 ? "FREE" : formatPrice(pt.fee)}</span>
              </div>
              <p className="text-xs font-semibold mt-1">{pt.estimatedTime}</p>
              <p className="text-xs text-muted mt-2">{pt.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-border p-6 space-y-3 text-sm leading-relaxed">
        <h2 className="font-bold text-xl">48-Hour Easy Campus Returns &amp; Exchanges</h2>
        <p className="text-muted">
          If your jersey, tee, or jeans don&apos;t fit the way you want, you can exchange
          them for another size or request a refund within 48 hours of delivery.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted">
          <li>Items must be unworn, unwashed, and in original packaging with tags.</li>
          <li>Drop-off exchanges at Old Park are completely free (₦0).</li>
          <li>
            Contact us on WhatsApp or email <strong>{SUPPORT_EMAIL}</strong> with your
            order number (e.g., DP-XXXXXX) to initiate an exchange.
          </li>
        </ul>
      </section>
    </div>
  );
}
