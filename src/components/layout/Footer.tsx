"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, MessageCircle } from "lucide-react";
import {
  APP_DESCRIPTION,
  APP_NAME,
  CAMPUS_CITY,
  CAMPUS_SHORT_NAME,
  FOOTER_COLUMNS,
  Logo,
  SOCIAL_LINKS,
} from "@/config/site";
import { useToastStore } from "@/store/toast";
import Image from "next/image";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        addToast(json.error || "Could not subscribe right now.", "error");
      } else {
        addToast("You're on the list for new campus drops!", "success");
        setEmail("");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="relative mt-24 bg-surface pt-32 pb-24 md:pb-12 text-black">
      {/* Overlapping Black Rounded Newsletter CTA Banner (Matches Shop.co screenshots) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-52 mb-14">
        <div className="rounded-[24px] bg-black text-white px-6 py-8 md:px-14 md:py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight leading-[1.08] max-w-xl">
            STAY UPDATED ON NEW CAMPUS DROPS &amp; OFFERS
          </h2>

          <form
            onSubmit={handleNewsletterSubmit}
            className="w-full lg:w-[360px] flex flex-col gap-3 shrink-0"
          >
            <div className="relative">
              <label htmlFor="newsletter-email" className="visually-hidden">
                Enter your email address
              </label>
              <Mail
                aria-hidden="true"
                className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full h-12 rounded-full bg-white pl-11 pr-4 text-sm text-black placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-full bg-white text-black font-semibold text-sm hover:bg-surface transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Subscribing..." : "Subscribe to Newsletter"}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-border">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block">
              <Logo className="text-3xl" />
            </Link>
            <p className="text-xs sm:text-sm text-muted mt-4 max-w-xs leading-relaxed">
              {APP_DESCRIPTION}
            </p>

            {/* Round Social Icon Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={SOCIAL_LINKS.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${APP_NAME} on X`}
                className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
              >
                <Image
                  src="/twitter.png"
                  alt="X (Twitter)"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${APP_NAME} on Instagram`}
                className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
              >
                <Image
                  src="/instagram.png"
                  alt="Instagram"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${APP_NAME} on TikTok`}
                className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
              >
                <Image
                  src="/tiktok.png"
                  alt="TikTok"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${APP_NAME} on WhatsApp`}
                className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
              >
                <Image
                  src="/whatsapp.png"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </a>
            </div>
          </div>

          {/* Link Columns from Config */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-black mb-4">
                {col.title}
              </h3>
              <ul role="list" className="space-y-2.5 text-xs sm:text-sm text-muted">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright & Secured by Paystack Badge */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>
            {APP_NAME} &copy; {new Date().getFullYear()}. Built for {CAMPUS_SHORT_NAME} students in{" "}
            {CAMPUS_CITY}. All Rights Reserved.
          </p>

          <div className="flex items-center gap-2">
            <Image src={"/paystack.png"}  alt="Paystack" width={100} height={100} />
          </div>
        </div>
      </div>
    </footer>
  );
}
