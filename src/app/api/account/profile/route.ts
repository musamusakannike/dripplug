import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { getCurrentUser, setSessionCookie } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { User } from "@/models/User";
import { profileUpdateSchema } from "@/lib/validators";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const parsed = profileUpdateSchema.parse(body);

    const updatedSession = {
      ...user,
      name: parsed.name,
      phone: parsed.phone,
    };

    if (isDatabaseConfigured() && Types.ObjectId.isValid(user.id)) {
      await connectDB();
      const dbUser = await User.findById(user.id);
      if (dbUser) {
        dbUser.name = parsed.name;
        dbUser.phone = parsed.phone;
        if (parsed.savedAddresses) {
          dbUser.savedAddresses = parsed.savedAddresses;
        }
        await dbUser.save();
      }
    }

    await setSessionCookie(updatedSession);
    return apiSuccess({ user: updatedSession });
  } catch (err) {
    return handleApiException(err);
  }
}
