import React from "react";
import type { Metadata } from "next";
import { APP_DOMAIN, APP_NAME, CAMPUS_CITY, SUPPORT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms of service for shopping on ${APP_NAME} (${APP_DOMAIN}).`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-6 text-sm leading-relaxed">
      <h1 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight">
        TERMS &amp; CONDITIONS
      </h1>
      <p className="text-muted">
        Welcome to {APP_NAME} ({APP_DOMAIN}). By placing an order on our website, you agree
        to the following terms tailored for campus e-commerce in {CAMPUS_CITY}.
      </p>
      <div className="space-y-4">
        <h2 className="font-bold text-lg">1. Pricing &amp; Payments</h2>
        <p className="text-muted">
          All prices are listed in Nigerian Naira (₦). Orders are confirmed only once
          Paystack verifies payment. Server-side prices and delivery fees from our official
          schedule govern every order.
        </p>
        <h2 className="font-bold text-lg">2. Campus Delivery</h2>
        <p className="text-muted">
          Please keep your phone reachable after ordering so our dispatch rider can call
          you at Old Park, New Park, or your Hostel landmark.
        </p>
        <h2 className="font-bold text-lg">3. Support</h2>
        <p className="text-muted">
          Questions regarding these terms may be sent to {SUPPORT_EMAIL}.
        </p>
      </div>
    </div>
  );
}
