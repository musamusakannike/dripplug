import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { adminOrderStatusSchema } from "@/lib/validators";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const { orderId, status, note } = body;
    if (!orderId) {
      return apiError("orderId is required.", 400);
    }

    const parsed = adminOrderStatusSchema.parse({ status, note });
    const order = await Order.findById(orderId);
    if (!order) {
      return apiError("Order not found.", 404);
    }

    order.status = parsed.status;
    order.statusHistory.push({
      status: parsed.status,
      note: parsed.note || `Updated by Admin (${user.email})`,
      timestamp: new Date(),
    });

    await order.save();
    return apiSuccess({ order });
  } catch (err) {
    return handleApiException(err);
  }
}
