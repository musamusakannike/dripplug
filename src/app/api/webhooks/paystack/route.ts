import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  processVerifiedPayment,
  verifyPaystackWebhookSignature,
} from "@/lib/paystack";
import { Order } from "@/models/Order";
import { Transaction } from "@/models/Transaction";

/**
 * POST /api/webhooks/paystack
 * SOURCE OF TRUTH for payment status and stock decrement.
 * - Reads raw request body via req.text()
 * - Verifies HMAC SHA512 signature with timing-safe comparison
 * - Idempotently processes charge.success, failed, and refund events
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Paystack signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody) as {
      event: string;
      data: {
        id?: number | string;
        reference?: string;
        amount?: number;
        currency?: string;
        status?: string;
        [key: string]: unknown;
      };
    };

    const eventType = payload.event;
    const data = payload.data || {};
    const reference = String(data.reference || "");
    const eventId = `${eventType}_${data.id || reference}`;

    if (!reference) {
      return NextResponse.json({ ok: true, received: true }, { status: 200 });
    }

    await connectDB();

    if (eventType === "charge.success") {
      await processVerifiedPayment({
        reference,
        eventId,
        eventType,
        amountInKobo: Number(data.amount || 0),
        currency: String(data.currency || "NGN"),
        rawPayload: payload as unknown as Record<string, unknown>,
      });
    } else if (eventType === "charge.failed") {
      const order = await Order.findOne({
        paystackReference: reference,
        paymentStatus: "unpaid",
      });
      if (order) {
        order.paymentStatus = "failed";
        order.status = "cancelled";
        order.statusHistory.push({
          status: "cancelled",
          note: "Paystack charge failed",
          timestamp: new Date(),
        });
        await order.save();
      }
      await Transaction.findOneAndUpdate(
        { eventId },
        {
          reference,
          eventId,
          eventType,
          order: order?._id,
          amount: Number(data.amount || 0),
          status: "failed",
          rawPayload: payload,
        },
        { upsert: true }
      );
    } else if (eventType.startsWith("refund.")) {
      const order = await Order.findOne({ paystackReference: reference });
      if (order && order.status !== "refunded") {
        order.paymentStatus = "refunded";
        order.status = "refunded";
        order.statusHistory.push({
          status: "refunded",
          note: `Paystack refund processed (${eventType})`,
          timestamp: new Date(),
        });
        await order.save();
      }
      await Transaction.findOneAndUpdate(
        { eventId },
        {
          reference,
          eventId,
          eventType,
          order: order?._id,
          amount: Number(data.amount || 0),
          status: "refunded",
          rawPayload: payload,
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[Paystack Webhook Error]:", err);
    return NextResponse.json(
      { ok: false, error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
