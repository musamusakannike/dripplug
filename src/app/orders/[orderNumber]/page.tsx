import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ChevronRight,
  CheckCircle2,
  MapPin,
  Clock,
  Star,
  Sparkles,
} from "lucide-react";
import {
  ORDER_STATUS_LABELS,
  OrderStatus,
} from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Order, IOrder } from "@/models/Order";
import { formatDate, formatPrice } from "@/lib/format";
import { OrderPaymentAction } from "@/components/orders/OrderPaymentAction";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
};

const TIMELINE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending_payment", label: "Order Placed" },
  { key: "paid", label: "Payment Confirmed" },
  { key: "processing", label: "Packing at Campus Hub" },
  { key: "out_for_delivery", label: "Out for Campus Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirect=/orders/${encodeURIComponent(orderNumber)}`);
  }

  if (!isDatabaseConfigured()) {
    notFound();
  }

  await connectDB();
  const order = (await Order.findOne({
    orderNumber: orderNumber.toUpperCase(),
  }).lean()) as unknown as IOrder | null;

  if (!order) {
    notFound();
  }

  // Only allow owner or admin to view
  if (String(order.user) !== user.id && user.role !== "admin") {
    redirect("/orders");
  }

  const isPaymentFailed = order.paymentStatus === "failed" && order.status !== "cancelled";
  const isPendingPayment =
    (order.status === "pending_payment" || order.paymentStatus === "unpaid") &&
    order.status !== "cancelled";
  const canPay = (isPendingPayment || isPaymentFailed) && order.status !== "cancelled";
  const currentStepIdx = TIMELINE_STEPS.findIndex((s) => s.key === order.status);

  let badgeClass = "bg-black text-white";
  let badgeLabel = ORDER_STATUS_LABELS[order.status] || order.status;

  if (order.status === "delivered" || order.status === "paid") {
    badgeClass = "bg-success/15 text-success border border-success/30";
  } else if (order.status === "cancelled" || order.status === "refunded") {
    badgeClass = "bg-danger-bg text-danger border border-danger/30";
  } else if (isPaymentFailed) {
    badgeClass = "bg-amber-100 text-amber-900 border border-amber-300";
    badgeLabel = "Payment Failed";
  } else if (isPendingPayment) {
    badgeClass = "bg-amber-50 text-amber-800 border border-amber-200";
    badgeLabel = "Pending Payment";
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-muted mb-5"
      >
        <Link href="/orders" className="hover:text-black">
          Orders
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">{order.orderNumber}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight">
            ORDER {order.orderNumber}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Placed on {formatDate(order.createdAt)} &bull; Ref:{" "}
            <span className="font-mono">{order.paystackReference}</span>
          </p>
        </div>

        <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Payment Action Banner for Unpaid / Failed Orders */}
      {canPay && (
        <OrderPaymentAction
          orderNumber={order.orderNumber}
          total={order.total}
          variant="banner"
        />
      )}

      {/* Status Timeline */}
      {order.status !== "cancelled" && order.status !== "refunded" && (
        <div className="rounded-[24px] border border-border p-6 mb-8 bg-white">
          <h2 className="font-bold text-base mb-5">Campus Delivery Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {TIMELINE_STEPS.map((step, idx) => {
              const reached = currentStepIdx >= idx;
              return (
                <div
                  key={step.key}
                  className={`rounded-2xl p-3.5 border flex sm:flex-col items-center sm:items-start gap-3 ${
                    reached
                      ? "bg-surface border-black text-black"
                      : "bg-white border-border text-muted"
                  }`}
                >
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 ${
                      reached ? "text-success" : "text-muted-light"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold">{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ordered Items + Review Product Action */}
        <div className="lg:col-span-7 rounded-[24px] border border-border p-6 bg-white divide-y divide-border">
          <h2 className="font-bold text-lg pb-4">Items Ordered</h2>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-16 rounded-2xl bg-surface overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-bold text-sm text-black hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted mt-0.5">
                    Size: {item.size} &bull; Color: {item.color} &bull; Qty:{" "}
                    {item.quantity}
                  </p>
                  {item.customizationText && (
                    <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-200/90 rounded-lg px-2.5 py-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold">Customization: </span>
                        <span className="font-mono">{item.customizationText}</span>
                        {item.customizationFee ? (
                          <span className="text-amber-700/80 text-[11px] ml-1.5 font-sans">
                            (+{formatPrice(item.customizationFee)} each)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <p className="text-xs font-bold mt-1.5">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>

              {(order.status === "delivered" || order.status === "paid") && (
                <Link
                  href={`/product/${item.slug}`}
                  className="h-9 px-3.5 rounded-full bg-surface hover:bg-surface-hover text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Star className="w-3.5 h-3.5" />
                  Review Product
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Delivery Snapshot & Status History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[24px] border border-border p-6 bg-white space-y-3 text-xs sm:text-sm">
            <h2 className="font-bold text-lg text-black flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Delivery Details
            </h2>
            <p>
              <span className="text-muted">Drop-Off Point:</span>{" "}
              <strong className="text-black">{order.deliveryPoint.name}</strong>
            </p>
            <p>
              <span className="text-muted">Recipient:</span>{" "}
              <strong className="text-black">
                {order.deliveryAddress.customerName} ({order.deliveryAddress.phone})
              </strong>
            </p>
            {order.deliveryAddress.hostel && (
              <p>
                <span className="text-muted">Hostel Address:</span>{" "}
                <strong className="text-black">
                  {order.deliveryAddress.hostel}, {order.deliveryAddress.room} (
                  {order.deliveryAddress.landmark})
                </strong>
              </p>
            )}
            <div className="pt-3 border-t border-border space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-danger">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -{formatPrice(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Delivery Fee</span>
                <span className="font-semibold">
                  {formatPrice(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-border p-6 bg-white space-y-3">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Status History
            </h2>
            <ul className="space-y-3 text-xs">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-black">
                      {ORDER_STATUS_LABELS[h.status] || h.status}
                    </p>
                    {h.note && <p className="text-muted">{h.note}</p>}
                  </div>
                  <span className="text-muted shrink-0">
                    {formatDate(h.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
