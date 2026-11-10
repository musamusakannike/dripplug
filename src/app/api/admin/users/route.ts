import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";
import { sendAdminRolePromotionEmail } from "@/lib/email";

const adminUserUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(25).optional(),
  role: z.enum(["customer", "admin"]).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = adminUserUpdateSchema.parse(body);

    const existingUser = await User.findById(parsed.id);
    if (!existingUser) {
      return apiError("User not found.", 404);
    }

    const wasAdmin = existingUser.role === "admin";

    if (parsed.name !== undefined) existingUser.name = parsed.name;
    if (parsed.email !== undefined) existingUser.email = parsed.email.toLowerCase();
    if (parsed.phone !== undefined) existingUser.phone = parsed.phone;
    if (parsed.role !== undefined) existingUser.role = parsed.role;

    const updated = await existingUser.save();

    // If upgraded to admin, send notification email
    if (!wasAdmin && updated.role === "admin") {
      await sendAdminRolePromotionEmail(
        { email: updated.email, name: updated.name },
        admin.email
      );
    }

    return apiSuccess({
      user: {
        _id: String(updated._id),
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    return handleApiException(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return apiError("User ID required.", 400);
    }
    if (id === admin.id) {
      return apiError("You cannot delete your own active admin account.", 400);
    }

    await User.findByIdAndDelete(id);
    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiException(err);
  }
}
