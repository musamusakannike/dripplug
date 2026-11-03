import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Review, recomputeProductRating } from "@/models/Review";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const { reviewId, status } = await req.json();
    if (!reviewId || (status !== "published" && status !== "hidden")) {
      return apiError("Valid reviewId and status ('published' | 'hidden') required.", 400);
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
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
