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
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`newsletter_${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return apiError("Too many subscription requests. Try again in a minute.", 429);
    }

    const body = await req.json();
    const { email } = newsletterSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    if (isDatabaseConfigured()) {
      await connectDB();
      const existing = await Newsletter.findOne({ email: normalizedEmail });
      await Newsletter.findOneAndUpdate(
        { email: normalizedEmail },
        { email: normalizedEmail, subscribedAt: new Date() },
        { upsert: true, new: true }
      );
      if (!existing) {
        await sendNewsletterWelcomeEmail(normalizedEmail);
      }
    } else {
      await sendNewsletterWelcomeEmail(normalizedEmail);
    }

    return apiSuccess({ subscribed: true, email: normalizedEmail });
  } catch (err) {
    return handleApiException(err);
  }
}
