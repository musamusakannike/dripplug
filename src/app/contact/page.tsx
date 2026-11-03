import React from "react";
import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import {
  APP_NAME,
  CAMPUS_CITY,
  CAMPUS_NAME,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${APP_NAME} campus support via WhatsApp, phone, or email.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted">
          24/7 Student Support
        </p>
        <h1 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight mt-2">
          CONTACT {APP_NAME}
        </h1>
        <p className="text-sm text-muted mt-2 max-w-xl">
          Need help with sizing, an active campus delivery, or bulk departmental
          jersey orders at {CAMPUS_NAME}? Reach us directly below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <a
          href={SOCIAL_LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[24px] border border-border p-6 hover:bg-surface transition-colors flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base">WhatsApp Instant Support</h2>
            <p className="text-xs text-muted mt-1">
              Fastest response for active riders and size checks
            </p>
            <p className="text-sm font-bold mt-2 underline">Chat on WhatsApp &rarr;</p>
          </div>
        </a>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="rounded-[24px] border border-border p-6 hover:bg-surface transition-colors flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base">Email Support</h2>
            <p className="text-xs text-muted mt-1">
              Order receipts, returns, and partnership inquiries
            </p>
            <p className="text-sm font-bold mt-2">{SUPPORT_EMAIL}</p>
          </div>
        </a>

        <div className="rounded-[24px] border border-border p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-surface text-black flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base">Dispatch Hotline</h2>
            <p className="text-xs text-muted mt-1">Mon &ndash; Sat, 8 AM &ndash; 7 PM</p>
            <p className="text-sm font-bold mt-2">{SUPPORT_PHONE}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-border p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-surface text-black flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base">Campus Hub</h2>
            <p className="text-xs text-muted mt-1">{CAMPUS_NAME}</p>
            <p className="text-sm font-bold mt-2">{CAMPUS_CITY}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
