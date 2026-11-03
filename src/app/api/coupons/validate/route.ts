import { NextRequest } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { couponValidateSchema } from "@/lib/validators";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";
import { formatPrice } from "@/lib/format";

const FALLBACK_COUPONS = [
  { code: "UNILORIN10", type: "percent" as const, value: 10, minOrder: 10000 },
  { code: "FRESHERS2K", type: "fixed" as const, value: 2000, minOrder: 15000 },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = couponValidateSchema.parse(body);
    const normalizedCode = code.toUpperCase();

    let couponData: {
      code: string;
      type: "percent" | "fixed";
      value: number;
      minOrder: number;
    } | null = null;

    if (isDatabaseConfigured()) {
      await connectDB();
      const dbCoupon = await Coupon.findOne({
        code: normalizedCode,
        isActive: true,
      }).lean();

      if (dbCoupon) {
        if (new Date(dbCoupon.expiry) < new Date()) {
          return apiError("This promo code has expired.", 400);
        }
        if (dbCoupon.usedCount >= dbCoupon.usageLimit) {
          return apiError("This promo code has reached its usage limit.", 400);
        }
        couponData = {
          code: dbCoupon.code,
          type: dbCoupon.type,
          value: dbCoupon.value,
          minOrder: dbCoupon.minOrder,
        };
      }
    }

    if (!couponData) {
      const fallback = FALLBACK_COUPONS.find((c) => c.code === normalizedCode);
      if (fallback) {
        couponData = fallback;
      }
    }

    if (!couponData) {
      return apiError("Invalid promo code. Try UNILORIN10 or FRESHERS2K.", 404);
    }

    if (subtotal < couponData.minOrder) {
      return apiError(
        `Minimum order of ${formatPrice(couponData.minOrder)} required for code ${couponData.code}.`,
        400
      );
    }

    const discountAmount =
      couponData.type === "percent"
        ? Math.round((subtotal * couponData.value) / 100)
        : Math.min(subtotal, couponData.value);

    return apiSuccess({
      code: couponData.code,
      type: couponData.type,
      value: couponData.value,
      discountAmount,
    });
  } catch (err) {
    return handleApiException(err);
  }
}
