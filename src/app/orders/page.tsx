import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import type { Metadata } from "next";
import { ChevronRight, Package, ArrowRight } from "lucide-react";
import {
  APP_NAME,
  ORDER_STATUS_LABELS,
  OrderStatus,
  PENDING_ORDER_EXPIRY_MINUTES,
} from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Order, IOrder } from "@/models/Order";
import { formatDate, formatPrice } from "@/lib/format";
import { OrderPaymentAction } from "@/components/orders/OrderPaymentAction";

export const metadata: Metadata = {
  title: "My Orders",
  description: `Track your ${APP_NAME} campus deliveries.`,
  robots: { index: false, follow: false },
};

function getOrderExpiryCutoff() {
  return new Date(Date.now() - PENDING_ORDER_EXPIRY_MINUTES * 60 * 1000);
}

export default async function OrdersListPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/orders");
  }

  let orders: IOrder[] = [];
  if (isDatabaseConfigured() && Types.ObjectId.isValid(user.id)) {
    try {
      await connectDB();
      const userObjectId = new Types.ObjectId(user.id);

      // Lazily auto-expire any stale pending orders (> 24 hours)
      const cutoff = getOrderExpiryCutoff();
      await Order.updateMany(
        {
          user: userObjectId,
          status: "pending_payment",
          paymentStatus: { $ne: "paid" },
          createdAt: { $lt: cutoff },
        },
        {
          $set: { status: "cancelled", paymentStatus: "failed" },
          $push: {
            statusHistory: {
              status: "cancelled",
              note: `Auto-expired after ${Math.round(PENDING_ORDER_EXPIRY_MINUTES / 60)} hours without payment`,
              timestamp: new Date(),
            },
          },
        }
      );

      orders = (await Order.find({ user: userObjectId })
        .sort({ createdAt: -1 })
        .lean()) as unknown as IOrder[];
    } catch {
      orders = [];
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-muted mb-5"
      >
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Orders</span>
      </nav>

      <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mb-6 md:mb-8">
        MY CAMPUS ORDERS
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-[24px] border border-border p-12 text-center my-6">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-muted" />
          </div>
          <h2 className="font-heading text-xl uppercase">No orders yet</h2>
          <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-md mx-auto">
            Once you place an order, you can track its campus delivery status right here.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-full bg-black text-white text-xs sm:text-sm font-semibold"
          >
            Shop Campus Fits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = order.status as OrderStatus;
            const isPaymentFailed = order.paymentStatus === "failed" && status !== "cancelled";
            const isPendingPayment = (status === "pending_payment" || order.paymentStatus === "unpaid") && status !== "cancelled";

            let badgeClass = "bg-surface text-black";
            let badgeLabel = ORDER_STATUS_LABELS[status] || status;

            if (status === "delivered" || status === "paid") {
              badgeClass = "bg-success/10 text-success";
            } else if (status === "cancelled" || status === "refunded") {
              badgeClass = "bg-danger-bg text-danger";
            } else if (isPaymentFailed) {
              badgeClass = "bg-amber-100 text-amber-900 border border-amber-300";
              badgeLabel = "Payment Failed";
            } else if (isPendingPayment) {
              badgeClass = "bg-amber-50 text-amber-800 border border-amber-200";
              badgeLabel = "Pending Payment";
            }

            const canPay = isPendingPayment || isPaymentFailed;

            return (
              <div
                key={String(order._id)}
                className="rounded-[20px] border border-border p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <span className="font-heading text-base sm:text-lg uppercase">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
                    >
                      {badgeLabel}
                    </span>
                    <span className="text-xs text-muted">
                      Placed on {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted">
                    Delivery Point:{" "}
                    <span className="text-black font-semibold">
                      {order.deliveryPoint.name}
                    </span>{" "}
                    &bull; Total:{" "}
                    <span className="text-black font-bold">
                      {formatPrice(order.total)}
                    </span>
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="relative w-12 h-12 rounded-xl bg-surface overflow-hidden border border-border"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-xs font-semibold text-muted pl-1">
                        +{order.items.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                  {canPay && (
                    <OrderPaymentAction orderNumber={order.orderNumber} total={order.total} />
                  )}
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="h-10 px-4 rounded-full border border-border hover:bg-surface text-black text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
