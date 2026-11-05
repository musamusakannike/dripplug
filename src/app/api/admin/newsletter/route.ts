import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Newsletter } from "@/models/Newsletter";
import { newsletterSchema } from "@/lib/validators";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = newsletterSchema.parse(body);

    const existing = await Newsletter.findOne({
      email: parsed.email.toLowerCase(),
    });
    if (existing) {
      return apiError("Email is already subscribed.", 400);
    }

    const subscriber = await Newsletter.create({
      email: parsed.email.toLowerCase(),
      subscribedAt: new Date(),
    });

    return apiSuccess(
      {
        subscriber: {
          _id: String(subscriber._id),
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt.toISOString(),
        },
      },
      201
    );
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
    const { id, email } = body;
    if (!id) {
      return apiError("Subscriber ID required.", 400);
    }

    const parsed = newsletterSchema.parse({ email });
    const updated = await Newsletter.findByIdAndUpdate(
      id,
      { $set: { email: parsed.email.toLowerCase() } },
      { new: true }
    );
    if (!updated) {
      return apiError("Subscriber not found.", 404);
    }

    return apiSuccess({
      subscriber: {
        _id: String(updated._id),
        email: updated.email,
        subscribedAt: updated.subscribedAt.toISOString(),
      },
    });
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
      return apiError("Subscriber ID required.", 400);
    }

    await Newsletter.findByIdAndDelete(id);
    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiException(err);
  }
}
