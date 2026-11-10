import { NextRequest } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import {
  getCurrentUser,
  signSessionToken,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  hashPassword,
  verifyPassword,
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
import { SessionUser } from "@/types";
import { sendCustomerWelcomeEmail } from "@/lib/email";

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
    const parsed = authSessionSchema.parse(body);

    // 1. Google OAuth flow (verifies Firebase ID token and syncs user to MongoDB, like sabilearn)
    if (parsed.idToken) {
      const decoded = await verifyFirebaseIdToken(parsed.idToken);
      const email = decoded.email?.toLowerCase();
      if (!email) {
        return apiError("Google account must have an email address.", 400);
      }

      const displayName =
        parsed.name?.trim() || decoded.name || email.split("@")[0];

      let sessionUser: SessionUser = {
        id: decoded.uid,
        firebaseUid: decoded.uid,
        name: displayName,
        email,
        phone: "",
        role: email === "admin@dripplug.com.ng" ? "admin" : "customer",
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
          await sendCustomerWelcomeEmail({ email: dbUser.email, name: dbUser.name });
        } else {
          if (!dbUser.firebaseUid) {
            dbUser.firebaseUid = decoded.uid;
          }
          if (!dbUser.name && displayName) {
            dbUser.name = displayName;
          }
          if (!dbUser.avatar && decoded.picture) {
            dbUser.avatar = decoded.picture;
          }
          await dbUser.save();
        }

        sessionUser = {
          id: String(dbUser._id),
          firebaseUid: dbUser.firebaseUid || "",
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone || "",
          role: dbUser.role,
          avatar: dbUser.avatar,
        };
      }

      const token = await signSessionToken(sessionUser);
      const response = apiSuccess({ user: sessionUser, token });
      response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
      return response;
    }

    // 2. Email + Password flow (handled directly in backend + MongoDB like sabilearn)
    const email = parsed.email?.toLowerCase();
    const password = parsed.password;

    if (!email || !password) {
      return apiError("Email and password are required.", 400);
    }

    if (!isDatabaseConfigured()) {
      return apiError("Database connection is not configured.", 500);
    }

    await connectDB();

    if (parsed.mode === "signup") {
      const displayName = parsed.name?.trim() || email.split("@")[0];
      let dbUser = await User.findOne({ email }).select("+password");

      if (dbUser) {
        if (dbUser.password) {
          return apiError("Email is already registered. Please sign in instead.", 400);
        }
        // Account existed via Google OAuth without a password — link password to existing account
        dbUser.password = hashPassword(password);
        if (parsed.name?.trim()) {
          dbUser.name = parsed.name.trim();
        }
        await dbUser.save();
      } else {
        dbUser = await User.create({
          name: displayName,
          email,
          password: hashPassword(password),
          role: email === "admin@dripplug.com.ng" ? "admin" : "customer",
        });
        await sendCustomerWelcomeEmail({ email: dbUser.email, name: dbUser.name });
      }

      const sessionUser: SessionUser = {
        id: String(dbUser._id),
        firebaseUid: dbUser.firebaseUid || "",
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone || "",
        role: dbUser.role,
        avatar: dbUser.avatar,
      };

      const token = await signSessionToken(sessionUser);
      const response = apiSuccess({ user: sessionUser, token }, 201);
      response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
      return response;
    }

    // Default: Email + Password Sign-In
    const dbUser = await User.findOne({ email }).select("+password");
    if (!dbUser) {
      return apiError("No account found with this email. Please create an account.", 401);
    }

    if (!dbUser.password) {
      return apiError(
        "This email was registered with Google. Click 'Continue with Google' or use 'Create an account' to set a password.",
        401
      );
    }

    const isMatch = verifyPassword(password, dbUser.password);
    if (!isMatch) {
      return apiError("Invalid email or password.", 401);
    }

    const sessionUser: SessionUser = {
      id: String(dbUser._id),
      firebaseUid: dbUser.firebaseUid || "",
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone || "",
      role: dbUser.role,
      avatar: dbUser.avatar,
    };

    const token = await signSessionToken(sessionUser);
    const response = apiSuccess({ user: sessionUser, token });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (err) {
    return handleApiException(err);
  }
}
