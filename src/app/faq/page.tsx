import React from "react";
import type { Metadata } from "next";
import { APP_NAME, CAMPUS_SHORT_NAME, DELIVERY_POINTS } from "@/config/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: `Answers to common questions about ${APP_NAME} sizing, Paystack payments, and ${CAMPUS_SHORT_NAME} campus delivery.`,
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const faqs = [
    {
      q: "Do I need an account to browse and add clothes to my cart?",
      a: "No! You can browse the entire store, filter by size and color, and build your cart without signing in. You only sign in with Google or Email when you are ready to checkout.",
    },
    {
      q: "What are the campus delivery points and fees?",
      a: DELIVERY_POINTS.map(
        (p) => `${p.name}: ${p.fee === 0 ? "Free (₦0)" : formatPrice(p.fee)} (${p.estimatedTime})`
      ).join(" • "),
    },
    {
      q: "How do I pay for my order?",
      a: "All payments are processed securely through Paystack using your debit card, bank transfer, or USSD. As soon as Paystack confirms your payment, your order status updates automatically.",
    },
    {
      q: "What if the size I ordered doesn't fit?",
      a: "You can request a free size exchange within 48 hours of receiving your order at Old Park, provided the item is unworn, unwashed, and has original tags intact.",
    },
    {
      q: "Are the jerseys and heavyweight tees pre-shrunk?",
      a: "Yes. Our 280GSM round necks, graphic tees, and 400GSM hoodies are pre-shrunk so they keep their boxy streetwear fit wash after wash.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-sm text-muted mt-2">
          Everything you need to know about shopping on {APP_NAME}.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="rounded-[20px] border border-border p-6 bg-white"
          >
            <h2 className="font-bold text-base sm:text-lg text-black">
              {item.q}
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
