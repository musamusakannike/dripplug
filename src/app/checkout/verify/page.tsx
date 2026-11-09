"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Package, ShoppingBag } from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { useCartStore } from "@/store/cart";

function VerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  const [state, setState] = useState<"polling" | "success" | "failed" | "timeout">(
    reference ? "polling" : "failed"
  );
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const clearCart = useCartStore((s) => s.clearCart);

  async function handleRetryPayment() {
    if (!orderNumber) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/pay`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.ok && json.data?.authorizationUrl) {
        window.location.href = json.data.authorizationUrl;
      } else {
        setRetryError(json.error || "Could not restart payment. Please try from your Orders page.");
        setRetrying(false);
      }
    } catch {
      setRetryError("Network error. Please try again or check your Orders page.");
      setRetrying(false);
    }
  }

  useEffect(() => {
    if (!reference) return;

    let attempts = 0;
    const maxAttempts = 12;
    let cancelled = false;

    async function pollStatus() {
      try {
        const res = await fetch(
          `/api/checkout/verify?reference=${encodeURIComponent(reference)}`,
          { cache: "no-store" }
        );
        const json = await res.json();

        if (cancelled) return;

        if (res.ok && json.ok) {
          const paymentStatus = json.data.paymentStatus;
          if (json.data.orderNumber) {
            setOrderNumber(json.data.orderNumber);
          }

          if (paymentStatus === "paid") {
            clearCart();
            setState("success");
            return;
          }

          if (paymentStatus === "failed" || paymentStatus === "flagged_mismatch") {
            setState("failed");
            return;
          }
        }
      } catch {
        // Retry on next tick
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        if (!cancelled) setState("timeout");
      } else if (!cancelled) {
        setTimeout(pollStatus, 2500);
      }
    }

    pollStatus();

    return () => {
      cancelled = true;
    };
  }, [reference, clearCart]);

  if (state === "polling") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <BrandLoader
          label="Verifying your payment with Paystack... Please do not close this tab."
        />
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg
            aria-hidden="true"
            viewBox="0 0 52 52"
            className="w-10 h-10 text-white"
            fill="none"
          >
            <motion.path
              d="M14 27L22.5 35.5L38 18"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </svg>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-success">
          Payment Confirmed
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mt-2">
          YOUR DRIP IS ON THE WAY!
        </h1>
        {orderNumber && (
          <p className="text-sm font-semibold text-black mt-2">
            Order Number: <span className="underline">{orderNumber}</span>
          </p>
        )}
        <p className="text-xs sm:text-sm text-muted mt-3 leading-relaxed">
          We&apos;ve sent a confirmation receipt to your email and our campus dispatch team is preparing your items.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {orderNumber ? (
            <Link
              href={`/orders/${orderNumber}`}
              className="h-12 px-7 rounded-full bg-black text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:bg-black/90 transition-colors"
            >
              <Package className="w-4 h-4" />
              Track Order
            </Link>
          ) : (
            <Link
              href="/orders"
              className="h-12 px-7 rounded-full bg-black text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              View My Orders
            </Link>
          )}
          <Link
            href="/shop"
            className="h-12 px-7 rounded-full border border-border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:bg-surface transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (state === "timeout") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7 text-black" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl uppercase">
          STILL CONFIRMING YOUR PAYMENT
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
          Your bank or Paystack is taking a little longer than usual. As soon as
          the webhook arrives, your order will automatically update to Paid.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/orders"
            className="h-12 px-7 rounded-full bg-black text-white text-xs sm:text-sm font-semibold inline-flex items-center"
          >
            Check Orders Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-danger-bg text-danger flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl uppercase">
        PAYMENT WAS NOT COMPLETED
      </h1>
      {orderNumber && (
        <p className="text-sm font-semibold text-black mt-2">
          Order Number: <span className="underline">{orderNumber}</span>
        </p>
      )}
      <p className="text-xs sm:text-sm text-muted mt-2">
        Your payment attempt was declined or cancelled. Your order and items are saved so you can retry now.
      </p>

      {retryError && (
        <p className="text-xs font-semibold text-danger mt-3 bg-danger-bg p-2 rounded-xl">
          {retryError}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {orderNumber ? (
          <>
            <button
              type="button"
              onClick={handleRetryPayment}
              disabled={retrying}
              className="h-12 px-7 rounded-full bg-black text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:bg-black/90 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {retrying ? "Opening Paystack..." : "Retry Payment"}
            </button>
            <Link
              href={`/orders/${orderNumber}`}
              className="h-12 px-7 rounded-full border border-border text-xs sm:text-sm font-semibold inline-flex items-center hover:bg-surface transition-colors"
            >
              View Order Details
            </Link>
          </>
        ) : (
          <Link
            href="/checkout"
            className="h-12 px-7 rounded-full bg-black text-white text-xs sm:text-sm font-semibold inline-flex items-center"
          >
            Return to Checkout
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CheckoutVerifyPage() {
  return (
    <Suspense fallback={<BrandLoader fullScreen label="Verifying transaction..." />}>
      <VerifyContent />
    </Suspense>
  );
}
