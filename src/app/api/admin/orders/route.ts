import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { DELIVERY_POINTS } from "@/config/site";
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
    const { orderId, ...rest } = body;
    if (!orderId) {
      return apiError("orderId is required.", 400);
    }

    const parsed = adminOrderStatusSchema.parse(rest);
    const order = await Order.findById(orderId);
    if (!order) {
      return apiError("Order not found.", 404);
    }

    const changes: string[] = [];

    if (parsed.status && parsed.status !== order.status) {
      order.status = parsed.status;
      changes.push(`Status → ${parsed.status}`);
    }

    if (parsed.paymentStatus && parsed.paymentStatus !== order.paymentStatus) {
      order.paymentStatus = parsed.paymentStatus;
      if (parsed.paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
      changes.push(`Payment → ${parsed.paymentStatus}`);
    }

    if (parsed.deliveryPointId) {
      const point = DELIVERY_POINTS.find((p) => p.id === parsed.deliveryPointId);
      if (point && point.id !== order.deliveryPoint.id) {
        order.deliveryPoint = {
          id: point.id,
          name: point.name,
          fee: point.fee,
          estimatedTime: point.estimatedTime,
        };
        changes.push(`Delivery point → ${point.name}`);
      }
    }

    if (parsed.deliveryAddress) {
      order.deliveryAddress = {
        customerName: parsed.deliveryAddress.customerName,
        phone: parsed.deliveryAddress.phone,
        email: parsed.deliveryAddress.email,
        hostel: parsed.deliveryAddress.hostel,
        room: parsed.deliveryAddress.room,
        landmark: parsed.deliveryAddress.landmark,
      };
      changes.push("Delivery address updated");
    }

    if (changes.length > 0 || parsed.note) {
      order.statusHistory.push({
        status: order.status,
        note:
          parsed.note ||
          `${changes.join(", ")} by Admin (${user.email})`,
        timestamp: new Date(),
      });
    }

    await order.save();
    return apiSuccess({ order });
  } catch (err) {
    return handleApiException(err);
  }
}
