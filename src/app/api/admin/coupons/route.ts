import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { adminCouponSchema } from "@/lib/validators";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = adminCouponSchema.parse(body);

    const coupon = await Coupon.create({
      code: parsed.code.toUpperCase(),
      type: parsed.type,
      value: parsed.value,
      minOrder: parsed.minOrder,
      expiry: new Date(parsed.expiry),
      usageLimit: parsed.usageLimit,
      isActive: parsed.isActive,
    });

    return apiSuccess({ coupon }, 201);
  } catch (err) {
    return handleApiException(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) {
      return apiError("Coupon ID required.", 400);
    }

    const existing = await Coupon.findById(id);
    if (!existing) {
      return apiError("Coupon not found.", 404);
    }

    if (typeof rest.isActive === "boolean" && Object.keys(rest).length === 1) {
      existing.isActive = rest.isActive;
      await existing.save();
      return apiSuccess({ coupon: existing });
    }

    const parsed = adminCouponSchema.parse(rest);
    existing.code = parsed.code.toUpperCase();
    existing.type = parsed.type;
    existing.value = parsed.value;
    existing.minOrder = parsed.minOrder;
    existing.expiry = new Date(parsed.expiry);
    existing.usageLimit = parsed.usageLimit;
    existing.isActive = parsed.isActive;
    await existing.save();

    return apiSuccess({ coupon: existing });
  } catch (err) {
    return handleApiException(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return apiError("Coupon ID required.", 400);
    }

    await Coupon.findByIdAndDelete(id);
    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiException(err);
  }
}
