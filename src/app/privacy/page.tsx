import React from "react";
import type { Metadata } from "next";
import { APP_NAME, SUPPORT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${APP_NAME} protects your student data and payment privacy.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-6 text-sm leading-relaxed">
      <h1 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight">
        PRIVACY POLICY
      </h1>
      <p className="text-muted">
        {APP_NAME} respects your privacy. We collect only the minimum information required
        to deliver your clothing order on campus.
      </p>
      <div className="space-y-4">
        <h2 className="font-bold text-lg">1. Information We Collect</h2>
        <p className="text-muted">
          We collect your name, email address (via Firebase Authentication), phone number,
          and optional hostel room/landmark solely to fulfill your campus orders.
        </p>
        <h2 className="font-bold text-lg">2. Payment Security</h2>
        <p className="text-muted">
          Card and bank details are handled directly by Paystack over encrypted connections
          and are never stored on {APP_NAME} servers.
        </p>
        <h2 className="font-bold text-lg">3. Contact</h2>
        <p className="text-muted">
          To request deletion of your account data, email {SUPPORT_EMAIL}.
        </p>
      </div>
    </div>
  );
}
