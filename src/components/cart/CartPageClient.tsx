"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Trash2,
  Minus,
  Plus,
  Tag,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useToastStore } from "@/store/toast";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/hooks/useHydrated";

export function CartPageClient() {
  const router = useRouter();
  const mounted = useHydrated();
  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const coupon = useCartStore((s) => s.coupon);
  const setCoupon = useCartStore((s) => s.setCoupon);

  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const addToast = useToastStore((s) => s.addToast);

  const couponDiscount = coupon
    ? coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(subtotal, coupon.value)
    : 0;

  const discountPercentLabel =
    coupon?.type === "percent"
      ? `(-${coupon.value}%)`
      : coupon
      ? `(${coupon.code})`
      : "";

  const finalTotalBeforeDelivery = Math.max(0, subtotal - couponDiscount);

  async function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), subtotal }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        addToast(json.error || "Invalid promo code", "error");
      } else {
        setCoupon(json.data);
        addToast(`Promo code ${json.data.code} applied!`, "success");
        setPromoInput("");
      }
    } catch {
      addToast("Could not validate promo code.", "error");
    } finally {
      setApplyingPromo(false);
    }
  }

  function handleGoToCheckout() {
    if (!user) {
      openAuthModal("/checkout");
    } else {
      router.push("/checkout");
    }
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-10 w-56 bg-surface rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-80 bg-surface rounded-[20px] animate-pulse" />
          <div className="lg:col-span-5 h-80 bg-surface rounded-[20px] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-muted mb-5"
      >
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Cart</span>
      </nav>

      <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mb-6 md:mb-8">
        YOUR CART
      </h1>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-border p-12 text-center my-6">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 text-muted" />
          </div>
          <h2 className="font-heading text-xl uppercase">
            Your shopping cart is empty
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-md mx-auto">
            Looks like you haven&apos;t added any jerseys, round necks, or baggy jeans yet.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:bg-black/90 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Rounded Bordered Card Listing Items (Matches Screenshot 1) */}
          <div className="lg:col-span-7 rounded-[20px] border border-border px-4 sm:px-6 divide-y divide-border">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const key = `${item.productId}_${item.size}_${item.color}`;
                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="py-5 flex gap-4 overflow-hidden"
                  >
                    {/* Thumbnail on soft grey */}
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[16px] bg-surface overflow-hidden shrink-0"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </Link>

                    {/* Item Details + Right Actions */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${item.slug}`}
                            className="font-bold text-sm sm:text-base text-black hover:underline line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted mt-1">
                            Size:{" "}
                            <span className="text-black font-medium">
                              {item.size}
                            </span>
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            Color:{" "}
                            <span className="text-black font-medium">
                              {item.color}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productId, item.size, item.color)
                          }
                          aria-label={`Remove ${item.name} from cart`}
                          className="p-1.5 text-danger hover:bg-danger-bg rounded-full transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-lg sm:text-xl text-black">
                          {formatPrice(item.unitPrice)}
                        </span>

                        <div className="inline-flex items-center rounded-full bg-surface px-3.5 py-2 gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                item.quantity - 1
                              )
                            }
                            aria-label="Decrease quantity"
                            className="text-black hover:opacity-70 cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-xs sm:text-sm font-semibold min-w-[16px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity >= 8) {
                                addToast("Maximum 8 units per item allowed per order.", "info");
                                return;
                              }
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                item.quantity + 1
                              );
                            }}
                            aria-label="Increase quantity"
                            className="text-black hover:opacity-70 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right: Rounded Order Summary Card (Matches Screenshot 1) */}
          <div className="lg:col-span-5 rounded-[20px] border border-border p-6 space-y-5">
            <h2 className="font-bold text-xl text-black">Order Summary</h2>

            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex items-center justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-bold text-black">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">
                    Discount {discountPercentLabel}
                  </span>
                  <span className="font-bold text-danger">
                    -{formatPrice(couponDiscount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted">Delivery Fee</span>
                <span className="text-xs sm:text-sm font-semibold text-black">
                  Chosen at checkout (from ₦0)
                </span>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-base font-medium text-black">Total</span>
                <span className="font-bold text-xl sm:text-2xl text-black">
                  {formatPrice(finalTotalBeforeDelivery)}
                </span>
              </div>
            </div>

            {/* Promo Code Input Pill + Black Apply Pill */}
            <form onSubmit={handleApplyPromo} className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <label htmlFor="cart-promo" className="visually-hidden">
                  Add promo code
                </label>
                <Tag
                  aria-hidden="true"
                  className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2"
                />
                <input
                  id="cart-promo"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Add promo code (e.g. UNILORIN10)"
                  className="w-full h-12 rounded-full bg-surface pl-11 pr-4 text-xs sm:text-sm text-black placeholder:text-muted"
                />
              </div>
              <button
                type="submit"
                disabled={applyingPromo}
                className="h-12 px-6 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:bg-black/90 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {applyingPromo ? "..." : "Apply"}
              </button>
            </form>

            {/* Wide Black Go to Checkout Pill with Arrow */}
            <button
              type="button"
              onClick={handleGoToCheckout}
              className="w-full h-14 rounded-full bg-black text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 hover:bg-black/90 transition-colors cursor-pointer"
            >
              <span>Go to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
