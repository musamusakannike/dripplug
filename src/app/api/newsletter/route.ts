import { NextRequest } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Newsletter } from "@/models/Newsletter";
import { newsletterSchema } from "@/lib/validators";
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
    const rate = checkRateLimit(`newsletter_${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return apiError("Too many subscription requests. Try again in a minute.", 429);
    }

    const body = await req.json();
    const { email } = newsletterSchema.parse(body);

    if (isDatabaseConfigured()) {
      await connectDB();
      await Newsletter.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email: email.toLowerCase(), subscribedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    return apiSuccess({ subscribed: true, email });
  } catch (err) {
    return handleApiException(err);
  }
}
