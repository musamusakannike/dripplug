import { NextRequest } from "next/server";
import { Types } from "mongoose";
import {
  DELIVERY_POINTS,
  FREE_DELIVERY_THRESHOLD,
} from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { checkoutInputSchema } from "@/lib/validators";
import { initializePaystackTransaction } from "@/lib/paystack";
import { generateOrderNumber } from "@/lib/utils";
import {
  apiError,
  apiSuccess,
  checkRateLimit,
  getClientIp,
  handleApiException,
} from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`checkout_${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return apiError("Too many checkout attempts. Please wait a minute.", 429);
    }

    const user = await getCurrentUser();
    if (!user) {
      return apiError("Authentication is required to complete checkout.", 401);
    }

    if (!isDatabaseConfigured()) {
      return apiError(
        "Database is not connected. Set MONGODB_URI in your environment variables.",
        503
      );
    }

    const body = await req.json();
    const parsed = checkoutInputSchema.parse(body);

    // 1. Lookup delivery point strictly from server config (NEVER trust client fee)
    const deliveryPointConfig = DELIVERY_POINTS.find(
      (p) => p.id === parsed.deliveryPointId
    );
    if (!deliveryPointConfig) {
      return apiError("Invalid campus delivery point selected.", 400);
    }

    await connectDB();

    // 2. Load products from DB, verify variant stock, and recompute subtotal server-side
    const orderItems = [];
    let subtotal = 0;

    for (const reqItem of parsed.items) {
      const product = await Product.findOne({
        $or: [
          ...(Types.ObjectId.isValid(reqItem.productId)
            ? [{ _id: new Types.ObjectId(reqItem.productId) }]
            : []),
          { slug: reqItem.slug.toLowerCase() },
        ],
        isActive: true,
      });

      if (!product) {
        const displayName = reqItem.name || reqItem.slug.replace(/-/g, " ");
        return apiError(
          `Product "${displayName}" is no longer available.`,
          400
        );
      }

      const variant = product.variants.find(
        (v) => v.size === reqItem.size && v.color === reqItem.color
      );

      if (!variant) {
        return apiError(
          `Variant (${reqItem.size} / ${reqItem.color}) not found for ${product.name}.`,
          400
        );
      }

      if (variant.stock < reqItem.quantity) {
        return apiError(
          `Only ${variant.stock} left in stock for ${product.name} (${reqItem.size}, ${reqItem.color}).`,
          400
        );
      }

      const baseUnitPrice = variant.priceOverride || product.basePrice;
      const customText = reqItem.customizationText?.trim() || "";
      const isCustomized = Boolean(
        product.isCustomizable &&
        reqItem.isCustomized &&
        customText
      );
      const customizationFee = isCustomized
        ? Math.max(0, product.customizationPrice || 0)
        : 0;
      const unitPrice = baseUnitPrice + customizationFee;
      subtotal += unitPrice * reqItem.quantity;

      const isRetroProduct = Boolean(
        product.isRetroJersey ||
        product.slug.includes("retro") ||
        product.tags?.some((t) => t.toLowerCase().includes("retro"))
      );

      orderItems.push({
        productId: product._id as Types.ObjectId,
        slug: product.slug,
        name: product.name,
        image: product.images[0] || "",
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        unitPrice,
        quantity: reqItem.quantity,
        isCustomized,
        customizationFee,
        customizationText:
          (isCustomized || (isRetroProduct && customText))
            ? customText
            : undefined,
      });
    }

    // 3. Server-side coupon validation
    let discount = 0;
    let appliedCouponCode: string | undefined;

    if (parsed.couponCode && parsed.couponCode.trim()) {
      const code = parsed.couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code, isActive: true });
      if (
        coupon &&
        new Date(coupon.expiry) > new Date() &&
        coupon.usedCount < coupon.usageLimit &&
        subtotal >= coupon.minOrder
      ) {
        discount =
          coupon.type === "percent"
            ? Math.round((subtotal * coupon.value) / 100)
            : Math.min(subtotal, coupon.value);
        appliedCouponCode = coupon.code;
      }
    }

    // 4. Server-side delivery fee calculation
    let deliveryFee = deliveryPointConfig.fee;
    if (
      FREE_DELIVERY_THRESHOLD.enabled &&
      subtotal - discount >= FREE_DELIVERY_THRESHOLD.amount
    ) {
      deliveryFee = 0;
    }

    const total = Math.max(0, subtotal - discount + deliveryFee);

    // 5. Save customer name, phone, and hostel address to user profile for 1-tap repeat checkout
    if (Types.ObjectId.isValid(user.id)) {
      const dbUser = await User.findById(user.id);
      if (dbUser) {
        dbUser.name = parsed.customerName;
        dbUser.phone = parsed.phone;
        if (
          deliveryPointConfig.requiresAddress &&
          parsed.hostel &&
          parsed.room &&
          parsed.landmark &&
          parsed.saveAddress !== false
        ) {
          const exists = dbUser.savedAddresses.some(
            (a) =>
              a.hostel.toLowerCase() === parsed.hostel?.toLowerCase() &&
              a.room.toLowerCase() === parsed.room?.toLowerCase()
          );
          if (!exists && dbUser.savedAddresses.length < 5) {
            dbUser.savedAddresses.push({
              hostel: parsed.hostel,
              room: parsed.room,
              landmark: parsed.landmark,
              isDefault: dbUser.savedAddresses.length === 0,
            });
          }
        }
        await dbUser.save();
      }
    }

    // 6. Create pending_payment Order with unique reference
    const orderNumber = generateOrderNumber();
    const paystackReference = `dp_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const order = await Order.create({
      orderNumber,
      user: Types.ObjectId.isValid(user.id)
        ? new Types.ObjectId(user.id)
        : new Types.ObjectId(),
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      couponCode: appliedCouponCode,
      total,
      deliveryPoint: {
        id: deliveryPointConfig.id,
        name: deliveryPointConfig.name,
        fee: deliveryFee,
        estimatedTime: deliveryPointConfig.estimatedTime,
      },
      deliveryAddress: {
        customerName: parsed.customerName,
        phone: parsed.phone,
        email: user.email,
        ...(deliveryPointConfig.requiresAddress
          ? {
              hostel: parsed.hostel,
              room: parsed.room,
              landmark: parsed.landmark,
            }
          : {}),
      },
      status: "pending_payment",
      paymentStatus: "unpaid",
      paystackReference,
      statusHistory: [
        {
          status: "pending_payment",
          note: "Order created, awaiting Paystack payment",
          timestamp: new Date(),
        },
      ],
    });

    // 7. Initialize Paystack transaction
    const paystackInit = await initializePaystackTransaction({
      email: user.email,
      amountInNaira: total,
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
