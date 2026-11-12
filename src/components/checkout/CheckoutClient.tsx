"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Lock,
  Check,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  DELIVERY_POINTS,
  FREE_DELIVERY_THRESHOLD,
} from "@/config/site";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";

interface CheckoutClientProps {
  initialCustomer: {
    name: string;
    email: string;
    phone: string;
    savedAddresses: {
      hostel: string;
      room: string;
      landmark: string;
      isDefault?: boolean;
    }[];
  };
}

export function CheckoutClient({ initialCustomer }: CheckoutClientProps) {
  const defaultAddress =
    initialCustomer.savedAddresses.find((a) => a.isDefault) ||
    initialCustomer.savedAddresses[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const [customerName, setCustomerName] = useState(initialCustomer.name || "");
  const [phone, setPhone] = useState(initialCustomer.phone || "");
  const [deliveryPointId, setDeliveryPointId] = useState<
    "old_park" | "hostel" | "new_park"
  >("old_park");
  const [hostel, setHostel] = useState(defaultAddress?.hostel || "");
  const [room, setRoom] = useState(defaultAddress?.room || "");
  const [landmark, setLandmark] = useState(defaultAddress?.landmark || "");
  const [saveAddress, setSaveAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const coupon = useCartStore((s) => s.coupon);
  const addToast = useToastStore((s) => s.addToast);

  const selectedPoint =
    DELIVERY_POINTS.find((p) => p.id === deliveryPointId) || DELIVERY_POINTS[0];

  const couponDiscount = coupon
    ? coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(subtotal, coupon.value)
    : 0;

  let deliveryFee = selectedPoint.fee;
  if (
    FREE_DELIVERY_THRESHOLD.enabled &&
    subtotal - couponDiscount >= FREE_DELIVERY_THRESHOLD.amount
  ) {
    deliveryFee = 0;
  }

  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

  function handleStep1Continue(e: React.FormEvent) {
    e.preventDefault();
    if (customerName.trim().length < 2) {
      addToast("Please enter your full name.", "error");
      return;
    }
    if (phone.trim().length < 10) {
      addToast("Please enter a valid 11-digit phone number.", "error");
      return;
    }
    setStep(2);
  }

  function handleStep2Continue(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPoint.requiresAddress) {
      if (!hostel.trim() || !room.trim() || !landmark.trim()) {
        addToast(
          "Hostel name, room number, and landmark are required for Hostel delivery.",
          "error"
        );
        return;
      }
    }
    setStep(3);
  }

  async function handlePayWithPaystack() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          deliveryPointId,
          hostel: selectedPoint.requiresAddress ? hostel : undefined,
          room: selectedPoint.requiresAddress ? room : undefined,
          landmark: selectedPoint.requiresAddress ? landmark : undefined,
          saveAddress,
          couponCode: coupon?.code,
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            image: i.image,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            isCustomized: i.isCustomized,
            customizationText: i.customizationText,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        addToast(json.error || "Could not initialize checkout.", "error");
        setSubmitting(false);
        return;
      }

      // Redirect to Paystack hosted checkout URL
      window.location.href = json.data.authorizationUrl;
    } catch {
      addToast("Network error starting payment. Please try again.", "error");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-7 h-7 text-muted" />
        </div>
        <h1 className="font-heading text-2xl uppercase">Your cart is empty</h1>
        <p className="text-sm text-muted mt-1">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-full bg-black text-white text-sm font-semibold"
        >
          Browse Campus Drip
        </Link>
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
        <Link href="/cart" className="hover:text-black">
          Cart
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Checkout</span>
      </nav>

      <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mb-6">
        CAMPUS CHECKOUT
      </h1>

      {/* 3-Step Progress Tracker */}
      <nav aria-label="Checkout progress" className="mb-8">
        <ol className="grid grid-cols-3 gap-2 sm:gap-4">
          {(
            [
              { num: 1, label: "1. Your Details" },
              { num: 2, label: "2. Delivery Point" },
              { num: 3, label: "3. Review & Pay" },
            ] as const
          ).map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <li
                key={s.num}
                aria-current={isActive ? "step" : undefined}
                className={`rounded-2xl px-3.5 py-3 border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
                  isActive
                    ? "bg-black text-white border-black"
                    : isCompleted
                    ? "bg-surface text-black border-border"
                    : "bg-white text-muted border-border"
                }`}
              >
                {isCompleted && <Check className="w-4 h-4 shrink-0" />}
                <span className="truncate">{s.label}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Collapsible Order Summary Toggle */}
      <div className="lg:hidden mb-6 rounded-[20px] border border-border bg-surface/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen((o) => !o)}
          aria-expanded={mobileSummaryOpen}
          className="w-full px-5 py-4 flex items-center justify-between text-sm font-bold text-black cursor-pointer"
        >
          <span>
            {mobileSummaryOpen ? "Hide" : "Show"} Order Summary ({items.length}{" "}
            items)
          </span>
          <span className="flex items-center gap-1.5">
            {formatPrice(grandTotal)}
            {mobileSummaryOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {mobileSummaryOpen && (
          <div className="px-5 pb-5 pt-2 border-t border-border bg-white space-y-3 text-xs">
            {items.map((item) => (
              <div
                key={`${item.productId}_${item.size}_${item.color}_${item.customizationText || ""}`}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="truncate block">
                    {item.quantity}x {item.name} ({item.size}, {item.color})
                  </span>
                  {item.customizationText && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/70 rounded px-1.5 py-0.2 inline-block font-mono">
                      Custom: {item.customizationText}
                    </span>
                  )}
                </div>
                <span className="font-bold shrink-0">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Checkout Step Form */}
        <div className="lg:col-span-7 rounded-[24px] border border-border p-6 sm:p-8 bg-white">
          {/* STEP 1: YOUR DETAILS */}
          {step === 1 && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleStep1Continue}
              className="space-y-5"
            >
              <div>
                <h2 className="font-heading text-xl uppercase">
                  1. Student Contact Details
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Saved to your profile so future campus orders take one tap.
                </p>
              </div>

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-semibold mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="checkout-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tobi Adeyemi"
                  className="w-full h-12 rounded-full bg-surface px-4 text-base text-black"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-semibold mb-1.5"
                >
                  Active Phone / WhatsApp Number (for rider call) *
                </label>
                <input
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08140003747"
                  className="w-full h-12 rounded-full bg-surface px-4 text-base text-black"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-xs font-semibold mb-1.5"
                >
                  Email Address (Receipt &amp; Paystack verification)
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  disabled
                  value={initialCustomer.email}
                  className="w-full h-12 rounded-full bg-surface/60 px-4 text-sm text-muted cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                className="w-full h-13 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-black/90 transition-colors cursor-pointer"
              >
                <span>Continue to Delivery Point</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {/* STEP 2: DELIVERY POINT */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleStep2Continue}
              className="space-y-5"
            >
              <div>
                <h2 className="font-heading text-xl uppercase">
                  2. Choose Campus Drop-Off Point
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Pick one of our three UNILORIN delivery points. Fee updates live.
                </p>
              </div>

              <fieldset className="space-y-3">
                <legend className="visually-hidden">
                  Select a campus delivery point
                </legend>
                {DELIVERY_POINTS.map((pt) => {
                  const isSelected = deliveryPointId === pt.id;
                  return (
                    <label
                      key={pt.id}
                      onClick={() => setDeliveryPointId(pt.id)}
                      className={`block rounded-[20px] border-2 p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-black bg-surface/50"
                          : "border-border hover:border-black/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="deliveryPoint"
                            value={pt.id}
                            checked={isSelected}
                            onChange={() => setDeliveryPointId(pt.id)}
                            className="mt-1 accent-black"
                          />
                          <div>
                            <p className="font-bold text-sm sm:text-base text-black flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {pt.name}
                            </p>
                            <p className="text-xs text-muted mt-0.5">
                              {pt.description}
                            </p>
                            <p className="text-[11px] font-semibold text-black mt-1">
                              Estimated: {pt.estimatedTime}
                            </p>
                          </div>
                        </div>

                        <span className="font-bold text-sm sm:text-base text-black shrink-0">
                          {pt.fee === 0 ? "FREE (₦0)" : formatPrice(pt.fee)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </fieldset>

              {/* Conditional Hostel Fields ONLY when requiresAddress = true */}
              {selectedPoint.requiresAddress && (
                <div className="rounded-[20px] bg-surface p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-black">
                      Hostel Delivery Address
                    </h3>
                    {initialCustomer.savedAddresses.length > 0 && (
                      <select
                        aria-label="Fill from saved hostel address"
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          const addr = initialCustomer.savedAddresses[idx];
                          if (addr) {
                            setHostel(addr.hostel);
                            setRoom(addr.room);
                            setLandmark(addr.landmark);
                          }
                        }}
                        className="text-xs font-semibold bg-white rounded-full px-3 py-1 border border-border"
                      >
                        <option value="">Use Saved Address...</option>
                        {initialCustomer.savedAddresses.map((a, idx) => (
                          <option key={idx} value={idx}>
                            {a.hostel} ({a.room})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="hostel-name"
                      className="block text-xs font-semibold mb-1"
                    >
                      Hostel Name *
                    </label>
                    <input
                      id="hostel-name"
                      type="text"
                      required
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                      placeholder="e.g. Lagos Hostel (School) or Sanusi Hostel (Tanke)"
                      className="w-full h-11 rounded-full bg-white px-4 text-sm text-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="hostel-room"
                        className="block text-xs font-semibold mb-1"
                      >
                        Room / Block Number *
                      </label>
                      <input
                        id="hostel-room"
                        type="text"
                        required
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="e.g. Block C, Room 14"
                        className="w-full h-11 rounded-full bg-white px-4 text-sm text-black"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="hostel-landmark"
                        className="block text-xs font-semibold mb-1"
                      >
                        Nearest Landmark *
                      </label>
                      <input
                        id="hostel-landmark"
                        type="text"
                        required
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Opposite Chapel / Tipper Garage"
                        className="w-full h-11 rounded-full bg-white px-4 text-sm text-black"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="accent-black"
                    />
                    <span>Save this hostel address for next time</span>
                  </label>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-13 px-6 rounded-full border border-border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:bg-surface transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 h-13 rounded-full bg-black text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-black/90 transition-colors cursor-pointer"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: REVIEW & PAY */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-heading text-xl uppercase">
                  3. Confirm &amp; Pay with Paystack
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Double-check your delivery details before completing secure payment.
                </p>
              </div>

              <div className="rounded-[20px] bg-surface p-5 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Student</span>
                  <span className="font-bold text-black">
                    {customerName} ({phone})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Drop-Off Point</span>
                  <span className="font-bold text-black">
                    {selectedPoint.name} (
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)})
                  </span>
                </div>
                {selectedPoint.requiresAddress && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted">Hostel Address</span>
                    <span className="font-semibold text-black text-right">
                      {hostel}, {room} &bull; {landmark}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setStep(2)}
                  className="h-14 px-6 rounded-full border border-border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:bg-surface transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePayWithPaystack}
                  className="flex-1 h-14 rounded-full bg-black text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 hover:bg-black/90 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay {formatPrice(grandTotal)} with Paystack</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Persistent Live Order Summary Card */}
        <aside
          aria-label="Order summary"
          className="lg:col-span-5 rounded-[24px] border border-border p-6 bg-white space-y-5"
        >
          <h2 className="font-bold text-xl text-black">Order Summary</h2>

          <div className="divide-y divide-border max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={`${item.productId}_${item.size}_${item.color}_${item.customizationText || ""}`}
                className="py-3 flex items-center gap-3"
              >
                <div className="relative w-14 h-14 rounded-xl bg-surface overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-black truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted">
                    Qty: {item.quantity} &bull; {item.size} &bull; {item.color}
                  </p>
                  {item.customizationText && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-900 bg-amber-50 border border-amber-200/70 rounded px-1.5 py-0.5 max-w-fit">
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="font-mono truncate max-w-[140px]" title={item.customizationText}>
                        {item.customizationText}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-bold text-black">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-border text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-bold text-black">
                {formatPrice(subtotal)}
              </span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted">
                  Discount ({coupon?.code})
                </span>
                <span className="font-bold text-danger">
                  -{formatPrice(couponDiscount)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted">
                Delivery ({selectedPoint.name})
              </span>
              <span className="font-bold text-black">
                {deliveryFee === 0 ? "FREE (₦0)" : formatPrice(deliveryFee)}
              </span>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="font-medium text-base text-black">Total</span>
              <span className="font-bold text-xl sm:text-2xl text-black">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
