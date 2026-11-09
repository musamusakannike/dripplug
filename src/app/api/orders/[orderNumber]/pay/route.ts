import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Order } from "@/models/Order";
import { initializePaystackTransaction } from "@/lib/paystack";
import { PENDING_ORDER_EXPIRY_MINUTES } from "@/config/site";
import {
  apiError,
  apiSuccess,
  checkRateLimit,
  getClientIp,
  handleApiException,
} from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`pay_retry_${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return apiError("Too many payment attempts. Please wait a moment.", 429);
    }

    const user = await getCurrentUser();
    if (!user) {
      return apiError("Authentication required.", 401);
    }

    if (!isDatabaseConfigured()) {
      return apiError("Database not configured.", 503);
    }

    const { orderNumber } = await params;
    if (!orderNumber) {
      return apiError("Order number is required.", 400);
    }

    await connectDB();
    const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() });
    if (!order) {
      return apiError("Order not found.", 404);
    }

    // Must be order owner or admin
    if (String(order.user) !== user.id && user.role !== "admin") {
      return apiError("Forbidden.", 403);
    }

    // If order is already paid
    if (order.paymentStatus === "paid" || order.status === "paid") {
      return apiError("This order has already been paid.", 400);
    }

    // Check expiry (e.g. 24 hours)
    const cutoff = new Date(Date.now() - PENDING_ORDER_EXPIRY_MINUTES * 60 * 1000);
    if (order.createdAt < cutoff) {
      order.status = "cancelled";
      order.paymentStatus = "failed";
      order.statusHistory.push({
        status: "cancelled",
        note: `Order expired after ${Math.round(PENDING_ORDER_EXPIRY_MINUTES / 60)} hours without payment`,
        timestamp: new Date(),
      });
      await order.save();
      return apiError(
        "This order has expired. Please add items to your cart to place a new order.",
        400
      );
    }

    // Generate fresh Paystack transaction reference and session
    const paystackReference = `dp_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    order.paystackReference = paystackReference;
    order.status = "pending_payment";
    order.paymentStatus = "unpaid";
    order.statusHistory.push({
      status: "pending_payment",
      note: `Payment session regenerated (${paystackReference})`,
      timestamp: new Date(),
    });
    await order.save();

    const paystackInit = await initializePaystackTransaction({
      email: user.email,
      amountInNaira: order.total,
      reference: paystackReference,
      orderId: String(order._id),
      orderNumber: order.orderNumber,
    });

    return apiSuccess({
      orderNumber: order.orderNumber,
      reference: paystackInit.reference,
      authorizationUrl: paystackInit.authorizationUrl,
    });
  } catch (err) {
    return handleApiException(err);
  }
}
