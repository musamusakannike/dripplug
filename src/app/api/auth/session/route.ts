import { NextRequest } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import {
  getCurrentUser,
  signSessionToken,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/lib/auth";
import { User } from "@/models/User";
import { authSessionSchema } from "@/lib/validators";
import {
  apiError,
  apiSuccess,
  checkRateLimit,
  getClientIp,
  handleApiException,
} from "@/lib/rate-limit";

export async function GET() {
  const user = await getCurrentUser();
  return apiSuccess({ user });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`auth_session_${ip}`, 15, 60_000);
    if (!rate.allowed) {
      return apiError("Too many sign-in attempts. Please wait a minute.", 429);
    }

    const body = await req.json();
    const { idToken, name } = authSessionSchema.parse(body);

    const decoded = await verifyFirebaseIdToken(idToken);
    const email = decoded.email?.toLowerCase();
    if (!email) {
      return apiError("Firebase account must have a verified email address.", 400);
    }

    const displayName =
      name?.trim() || decoded.name || email.split("@")[0];

    let sessionUser = {
      id: decoded.uid,
      firebaseUid: decoded.uid,
      name: displayName,
      email,
      phone: "",
      role: (email === "admin@dripplug.com.ng" ? "admin" : "customer") as
        | "customer"
        | "admin",
      avatar: decoded.picture,
    };

    if (isDatabaseConfigured()) {
      await connectDB();
      let dbUser = await User.findOne({
        $or: [{ firebaseUid: decoded.uid }, { email }],
      });

      if (!dbUser) {
        dbUser = await User.create({
          firebaseUid: decoded.uid,
          name: displayName,
          email,
          avatar: decoded.picture || "",
          role: email === "admin@dripplug.com.ng" ? "admin" : "customer",
        });
      } else {
        dbUser.firebaseUid = decoded.uid;
        if (!dbUser.name && displayName) dbUser.name = displayName;
        if (decoded.picture && !dbUser.avatar) dbUser.avatar = decoded.picture;
        await dbUser.save();
      }

      sessionUser = {
        id: String(dbUser._id),
        firebaseUid: dbUser.firebaseUid,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone || "",
        role: dbUser.role,
        avatar: dbUser.avatar,
      };
    }

    const token = await signSessionToken(sessionUser);
    const response = apiSuccess({ user: sessionUser });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (err) {
    return handleApiException(err);
  }
}
