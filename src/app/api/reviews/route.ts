import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Order } from "@/models/Order";
import { Review, recomputeProductRating } from "@/models/Review";
import { reviewInputSchema } from "@/lib/validators";
import {
  apiError,
  apiSuccess,
  checkRateLimit,
  getClientIp,
  handleApiException,
} from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId") || "";
    const user = await getCurrentUser();
    if (!user || !isDatabaseConfigured() || !Types.ObjectId.isValid(productId)) {
      return apiSuccess({ canReview: false });
    }

    await connectDB();
    const eligibleOrder = await Order.findOne({
      user: new Types.ObjectId(user.id),
      status: { $in: ["paid", "processing", "out_for_delivery", "delivered"] },
      "items.productId": new Types.ObjectId(productId),
    }).lean();

    const existingReview = await Review.findOne({
      product: new Types.ObjectId(productId),
      user: new Types.ObjectId(user.id),
    }).lean();

    return apiSuccess({
      canReview: Boolean(eligibleOrder && !existingReview),
      orderId: eligibleOrder ? String(eligibleOrder._id) : null,
      alreadyReviewed: Boolean(existingReview),
    });
  } catch (err) {
    return handleApiException(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`review_post_${ip}`, 5, 60_000);
    if (!rate.allowed) {
      return apiError("Please wait before submitting another review.", 429);
    }

    const user = await getCurrentUser();
    if (!user) {
      return apiError("Please sign in to write a review.", 401);
    }

    if (!isDatabaseConfigured()) {
      return apiError("Database connection required to post reviews.", 503);
    }

    const body = await req.json();
    const { productId, rating, comment } = reviewInputSchema.parse(body);

    if (!Types.ObjectId.isValid(productId)) {
      return apiError("Invalid product ID.", 400);
    }

    await connectDB();
    const prodObjId = new Types.ObjectId(productId);
    const userObjId = new Types.ObjectId(user.id);

    const verifiedOrder = await Order.findOne({
      user: userObjId,
      status: { $in: ["paid", "processing", "out_for_delivery", "delivered"] },
      "items.productId": prodObjId,
    }).lean();

    if (!verifiedOrder) {
      return apiError(
        "Only verified buyers who purchased this product can write a review.",
        403
      );
    }

    const existing = await Review.findOne({ product: prodObjId, user: userObjId });
    if (existing) {
      return apiError("You have already reviewed this product.", 409);
    }

    const created = await Review.create({
      product: prodObjId,
      user: userObjId,
      userName: user.name || "UNILORIN Student",
      order: verifiedOrder._id,
      rating,
      comment,
      status: "published",
    });

    await recomputeProductRating(prodObjId);

    return apiSuccess(
      {
        review: {
          _id: String(created._id),
          product: String(created.product),
          user: String(created.user),
          userName: created.userName,
          rating: created.rating,
          comment: created.comment,
          status: created.status,
          createdAt: created.createdAt.toISOString(),
        },
      },
      201
    );
  } catch (err) {
    return handleApiException(err);
  }
}
