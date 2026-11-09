import { NextRequest } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Order } from "@/models/Order";
import {
  processVerifiedPayment,
  verifyPaystackTransactionApi,
} from "@/lib/paystack";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

/**
 * GET /api/checkout/verify?reference=...
 * Fallback verification endpoint to help the return UI poll or recover if the webhook
 * is still in flight. Always routes through the same idempotent `processVerifiedPayment`
 * helper used by the webhook.
 */
export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference")?.trim() || "";
    if (!reference) {
      return apiError("Missing transaction reference.", 400);
    }

    if (!isDatabaseConfigured()) {
      return apiError("Database not configured.", 503);
    }

    await connectDB();
    const order = await Order.findOne({ paystackReference: reference });
    if (!order) {
      return apiError("Order not found for this reference.", 404);
    }

    // If the webhook already marked the order paid, return immediately
    if (order.paymentStatus === "paid") {
      return apiSuccess({
        paymentStatus: "paid",
        orderNumber: order.orderNumber,
        status: order.status,
      });
    }

    // Otherwise query Paystack Verify API and run idempotent fulfillment
    try {
      const txData = await verifyPaystackTransactionApi(reference);
      if (txData.status === "success") {
        const result = await processVerifiedPayment({
          reference,
          eventId: `verify_api_${txData.id || reference}`,
          eventType: "verify.success",
          amountInKobo: Number(txData.amount || 0),
          currency: String(txData.currency || "NGN"),
          rawPayload: txData,
        });

        return apiSuccess({
          paymentStatus: result.order?.paymentStatus || "paid",
          orderNumber: order.orderNumber,
          status: result.order?.status || "paid",
        });
      } else if (txData.status === "failed" || txData.status === "abandoned") {
        order.paymentStatus = "failed";
        const alreadyNoted = order.statusHistory.some((h) =>
          h.note?.toLowerCase().includes("failed") || h.note?.toLowerCase().includes("abandoned")
        );
        if (!alreadyNoted) {
          order.statusHistory.push({
            status: order.status,
            note: `Paystack payment ${txData.status} (${reference})`,
            timestamp: new Date(),
          });
        }
        await order.save();
        return apiSuccess({
          paymentStatus: "failed",
          orderNumber: order.orderNumber,
          status: order.status,
        });
      }
    } catch {
      // Paystack API may not have finalized yet; return current DB state for polling
    }

    return apiSuccess({
      paymentStatus: order.paymentStatus,
      orderNumber: order.orderNumber,
      status: order.status,
    });
  } catch (err) {
    return handleApiException(err);
  }
}
