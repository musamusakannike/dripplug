import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Review, recomputeProductRating } from "@/models/Review";
import { adminReviewUpdateSchema } from "@/lib/validators";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = adminReviewUpdateSchema.parse(body);

    const updateFields: Record<string, unknown> = {};
    if (parsed.status !== undefined) updateFields.status = parsed.status;
    if (parsed.rating !== undefined) updateFields.rating = parsed.rating;
    if (parsed.comment !== undefined) updateFields.comment = parsed.comment;
    if (parsed.userName !== undefined) updateFields.userName = parsed.userName;

    const review = await Review.findByIdAndUpdate(
      parsed.reviewId,
      { $set: updateFields },
      { new: true }
    );
    if (!review) {
      return apiError("Review not found.", 404);
    }

    await recomputeProductRating(review.product);
    revalidatePath("/");
    return apiSuccess({ review });
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
      return apiError("Review ID is required.", 400);
    }

    const review = await Review.findByIdAndDelete(id);
    if (review) {
      await recomputeProductRating(review.product);
    }
    revalidatePath("/");
    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiException(err);
  }
}
