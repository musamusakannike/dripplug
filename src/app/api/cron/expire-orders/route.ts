import { NextRequest } from "next/server";
import { PENDING_ORDER_EXPIRY_MINUTES } from "@/config/site";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Order } from "@/models/Order";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

/**
 * Cron-callable route that auto-cancels abandoned `pending_payment` orders
 * older than PENDING_ORDER_EXPIRY_MINUTES. Protected by CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretQuery = req.nextUrl.searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (
      !cronSecret ||
      (authHeader !== `Bearer ${cronSecret}` && secretQuery !== cronSecret)
    ) {
      return apiError("Unauthorized cron invocation.", 401);
    }

    if (!isDatabaseConfigured()) {
      return apiSuccess({ expiredCount: 0 });
    }

    await connectDB();
    const cutoff = new Date(
      Date.now() - PENDING_ORDER_EXPIRY_MINUTES * 60 * 1000
    );

    const result = await Order.updateMany(
      {
        status: "pending_payment",
        paymentStatus: "unpaid",
        createdAt: { $lt: cutoff },
      },
      {
        $set: {
          status: "cancelled",
          paymentStatus: "failed",
        },
        $push: {
          statusHistory: {
            status: "cancelled",
            note: `Auto-expired after ${PENDING_ORDER_EXPIRY_MINUTES} minutes without payment`,
            timestamp: new Date(),
          },
        },
      }
    );

    return apiSuccess({
      expiredCount: result.modifiedCount,
      cutoff: cutoff.toISOString(),
    });
  } catch (err) {
    return handleApiException(err);
  }
}
