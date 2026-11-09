"use client";

import React, { useState } from "react";
import { CreditCard, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface OrderPaymentActionProps {
  orderNumber: string;
  total?: number;
  variant?: "compact" | "banner";
}

export function OrderPaymentAction({
  orderNumber,
  total,
  variant = "compact",
}: OrderPaymentActionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/pay`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.ok && json.data?.authorizationUrl) {
        window.location.href = json.data.authorizationUrl;
      } else {
        setError(json.error || "Could not restart payment session.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (variant === "banner") {
    return (
      <div className="rounded-[24px] border border-amber-300 bg-amber-50/80 p-5 sm:p-6 mb-8 text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <h3 className="font-heading text-base sm:text-lg uppercase text-amber-950">
                Payment Required
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/80">
              Your order is reserved. Complete payment {total ? `of ${formatPrice(total)} ` : ""}to begin dispatch to your campus pickup point.
            </p>
            {error && <p className="text-xs font-semibold text-danger pt-1">{error}</p>}
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="h-12 px-7 rounded-full bg-black text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-black/90 transition-colors shrink-0 disabled:opacity-60 cursor-pointer shadow-md"
          >
            <CreditCard className="w-4 h-4" />
            <span>{loading ? "Opening Paystack..." : "Complete Payment"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="h-10 px-5 rounded-full bg-black text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-black/90 transition-colors disabled:opacity-60 cursor-pointer"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>{loading ? "Opening..." : "Pay Now"}</span>
      </button>
      {error && <span className="text-[11px] text-danger mt-1">{error}</span>}
    </div>
  );
}
