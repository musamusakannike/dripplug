import React from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { APP_NAME } from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { getCategories, getFilteredCatalog } from "@/lib/catalog";
import { Order } from "@/models/Order";
import { Coupon } from "@/models/Coupon";
import { Review } from "@/models/Review";
import { Newsletter } from "@/models/Newsletter";
import { SAMPLE_VERIFIED_REVIEWS } from "@/lib/sample-data";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { SerializedOrder, SerializedReview } from "@/types";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: `${APP_NAME} store administration.`,
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin");
  }

  const [categories, catalog] = await Promise.all([
    getCategories(),
    getFilteredCatalog({ limit: 100 }),
  ]);

  let orders: SerializedOrder[] = [];
  let coupons: {
    _id: string;
    code: string;
    type: "percent" | "fixed";
    value: number;
    minOrder: number;
    expiry: string;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
  }[] = [];
  let reviews: SerializedReview[] = SAMPLE_VERIFIED_REVIEWS;
  let subscribers: { _id: string; email: string; subscribedAt: string }[] = [];

  if (isDatabaseConfigured()) {
    try {
      await connectDB();
      const [orderDocs, couponDocs, reviewDocs, subDocs] = await Promise.all([
        Order.find().sort({ createdAt: -1 }).limit(100).lean(),
        Coupon.find().sort({ createdAt: -1 }).lean(),
        Review.find().sort({ createdAt: -1 }).limit(50).lean(),
        Newsletter.find().sort({ subscribedAt: -1 }).lean(),
      ]);

      orders = orderDocs.map((o) => ({
        _id: String(o._id),
        orderNumber: o.orderNumber,
        user: String(o.user),
        items: o.items.map((i) => ({
          productId: String(i.productId),
          slug: i.slug,
          name: i.name,
          image: i.image,
          size: i.size,
          color: i.color,
          sku: i.sku,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        discount: o.discount,
        couponCode: o.couponCode,
        total: o.total,
        deliveryPoint: o.deliveryPoint,
        deliveryAddress: o.deliveryAddress,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paystackReference: o.paystackReference,
        paidAt: o.paidAt ? new Date(o.paidAt).toISOString() : undefined,
        statusHistory: o.statusHistory.map((h) => ({
          status: h.status,
          note: h.note,
          timestamp: new Date(h.timestamp).toISOString(),
        })),
        createdAt: new Date(o.createdAt).toISOString(),
      }));

      coupons = couponDocs.map((c) => ({
        _id: String(c._id),
        code: c.code,
        type: c.type,
        value: c.value,
        minOrder: c.minOrder,
        expiry: new Date(c.expiry).toISOString(),
        usageLimit: c.usageLimit,
        usedCount: c.usedCount,
        isActive: c.isActive,
      }));

      if (reviewDocs.length > 0) {
        reviews = reviewDocs.map((r) => ({
          _id: String(r._id),
          product: String(r.product),
          user: String(r.user),
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          status: r.status,
          createdAt: new Date(r.createdAt).toISOString(),
        }));
      }

      subscribers = subDocs.map((s) => ({
        _id: String(s._id),
        email: s.email,
        subscribedAt: new Date(s.subscribedAt).toISOString(),
      }));
    } catch {
      // Fallback to sample state
    }
  }

  return (
    <AdminDashboardClient
      initialProducts={catalog.products}
      initialCategories={categories}
      initialOrders={orders}
      initialCoupons={coupons}
      initialReviews={reviews}
      initialSubscribers={subscribers}
    />
  );
}
