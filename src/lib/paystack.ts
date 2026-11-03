import crypto from "crypto";
import mongoose from "mongoose";
import { APP_URL, CURRENCY } from "@/config/site";
import { nairaToKobo } from "@/lib/format";
import { connectDB } from "@/lib/db";
import { Order, IOrder } from "@/models/Order";
import { Product } from "@/models/Product";
import { Transaction } from "@/models/Transaction";
import { Coupon } from "@/models/Coupon";
import { sendOrderConfirmationEmail } from "@/lib/email";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getPaystackSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing PAYSTACK_SECRET_KEY environment variable.");
  }
  return secret;
}

/**
 * Verifies the `x-paystack-signature` header against the raw request body
 * using HMAC SHA512 and timing-safe comparison.
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  const expectedHash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signatureHeader, "utf8");
  const hashBuffer = Buffer.from(expectedHash, "utf8");

  if (sigBuffer.length !== hashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, hashBuffer);
}

export async function initializePaystackTransaction(params: {
  email: string;
  amountInNaira: number;
  reference: string;
  orderId: string;
  orderNumber: string;
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const secret = getPaystackSecret();
  const amountKobo = nairaToKobo(params.amountInNaira);
  const callbackUrl = `${APP_URL}/checkout/verify?reference=${encodeURIComponent(
    params.reference
  )}`;

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: amountKobo,
      currency: CURRENCY,
      reference: params.reference,
      callback_url: callbackUrl,
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    }),
  });

  const json = await response.json();
  if (!response.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message || "Paystack transaction initialization failed.");
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export async function verifyPaystackTransactionApi(reference: string) {
  const secret = getPaystackSecret();
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    }
  );

  const json = await response.json();
  if (!response.ok || !json.status) {
    throw new Error(json.message || "Could not verify transaction with Paystack.");
  }

  return json.data as {
    id: number | string;
    status: string;
    reference: string;
    amount: number; // Kobo
    currency: string;
    paid_at?: string;
    [key: string]: unknown;
  };
}

/**
 * Shared IDEMPOTENT fulfillment helper used by BOTH the Paystack webhook (source of truth)
 * and the fallback verify endpoint.
 * - Verifies amount in kobo & currency NGN match the order total.
 * - Uses an atomic conditional update / replica-set transaction so double deliveries or
 *   simultaneous webhook + verify calls never double-decrement variant stock or double-mark paid.
 */
export async function processVerifiedPayment(params: {
  reference: string;
  eventId: string;
  eventType: string;
  amountInKobo: number;
  currency: string;
  rawPayload: Record<string, unknown>;
}): Promise<{
  status: "already_processed" | "fulfilled" | "flagged_mismatch" | "not_found";
  order: IOrder | null;
}> {
  await connectDB();

  // 1. Check idempotency in Transaction log
  const existingTx = await Transaction.findOne({
    $or: [{ eventId: params.eventId }, { reference: params.reference, status: "success" }],
  });

  const order = await Order.findOne({ paystackReference: params.reference });
  if (!order) {
    return { status: "not_found", order: null };
  }

  if (existingTx && order.paymentStatus === "paid") {
    return { status: "already_processed", order };
  }

  // 2. Verify amount (in kobo) and currency match order total
  const expectedKobo = nairaToKobo(order.total);
  const currencyMatches =
    (params.currency || CURRENCY).toUpperCase() === CURRENCY;
  const amountMatches = params.amountInKobo === expectedKobo;

  if (!amountMatches || !currencyMatches) {
    order.paymentStatus = "flagged_mismatch";
    order.statusHistory.push({
      status: order.status,
      note: `Flagged mismatch: Paid ${params.amountInKobo} kobo (${params.currency}), expected ${expectedKobo} kobo (${CURRENCY})`,
      timestamp: new Date(),
    });
    await order.save();

    await Transaction.findOneAndUpdate(
      { eventId: params.eventId },
      {
        reference: params.reference,
        eventId: params.eventId,
        eventType: params.eventType,
        order: order._id,
        amount: params.amountInKobo,
        status: "flagged_mismatch",
        rawPayload: params.rawPayload,
      },
      { upsert: true }
    );

    return { status: "flagged_mismatch", order };
  }

  // 3. Atomic conditional transition from unpaid -> paid inside a session transaction
  const session = await mongoose.startSession();
  let updatedOrder: IOrder | null = null;

  try {
    await session.withTransaction(async () => {
      updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          paymentStatus: { $ne: "paid" },
        },
        {
          $set: {
            status: "paid",
            paymentStatus: "paid",
            paidAt: new Date(),
          },
          $push: {
            statusHistory: {
              status: "paid",
              note: `Payment confirmed via Paystack (${params.reference})`,
              timestamp: new Date(),
            },
          },
        },
        { new: true, session }
      );

      // Only decrement stock if this invocation transitioned the order to "paid"
      if (updatedOrder) {
        for (const item of updatedOrder.items) {
          await Product.updateOne(
            {
              _id: item.productId,
              "variants.size": item.size,
              "variants.color": item.color,
            },
            {
              $inc: {
                "variants.$.stock": -item.quantity,
                soldCount: item.quantity,
              },
            },
            { session }
          );
        }

        if (updatedOrder.couponCode) {
          await Coupon.updateOne(
            { code: updatedOrder.couponCode },
            { $inc: { usedCount: 1 } },
            { session }
          );
        }

        await Transaction.findOneAndUpdate(
          { eventId: params.eventId },
          {
            reference: params.reference,
            eventId: params.eventId,
            eventType: params.eventType,
            order: updatedOrder._id,
            amount: params.amountInKobo,
            status: "success",
            rawPayload: params.rawPayload,
          },
          { upsert: true, session }
        );
      }
    });
  } finally {
    await session.endSession();
  }

  if (!updatedOrder) {
    const freshOrder = await Order.findById(order._id);
    return { status: "already_processed", order: freshOrder };
  }

  // 4. Send fail-safe confirmation email outside the DB transaction
  await sendOrderConfirmationEmail(updatedOrder);

  return { status: "fulfilled", order: updatedOrder };
}
