import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import {
  signSessionToken,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/lib/auth";
import { User } from "@/models/User";
import { SessionUser } from "@/types";
import { sendCustomerWelcomeEmail } from "@/lib/email";

const DEFAULT_GOOGLE_CLIENT_ID =
  "459411913645-in46ojva228tplj1lhtbgncg961763i6.apps.googleusercontent.com";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") || "/";
  const redirectPath = state.startsWith("/") ? state : "/";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=google_oauth_cancelled`, origin));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    // Must exactly match the redirect_uri sent to Google in the auth request
    // (see src/app/api/auth/google/route.ts) and the URI registered in the
    // Google Cloud Console, regardless of which host the user browsed on.
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || origin}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL(`/login?error=google_token_exchange_failed`, origin));
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL(`/login?error=google_missing_access_token`, origin));
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL(`/login?error=google_profile_failed`, origin));
    }

    const profile = (await profileRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    const email = profile.email?.toLowerCase();
    if (!email) {
      return NextResponse.redirect(new URL(`/login?error=google_email_required`, origin));
    }

    const displayName = profile.name?.trim() || email.split("@")[0];

    let sessionUser: SessionUser = {
      id: profile.sub,
      firebaseUid: profile.sub,
      name: displayName,
      email,
      phone: "",
      role: email === "admin@dripplug.com.ng" ? "admin" : "customer",
      avatar: profile.picture,
    };

    if (isDatabaseConfigured()) {
      await connectDB();
      let dbUser = await User.findOne({
        $or: [{ firebaseUid: profile.sub }, { email }],
      });

      if (!dbUser) {
        dbUser = await User.create({
          firebaseUid: profile.sub,
          name: displayName,
          email,
          avatar: profile.picture || "",
          role: email === "admin@dripplug.com.ng" ? "admin" : "customer",
        });
        await sendCustomerWelcomeEmail({ email: dbUser.email, name: dbUser.name });
      } else {
        if (!dbUser.firebaseUid) dbUser.firebaseUid = profile.sub;
        if (!dbUser.name && displayName) dbUser.name = displayName;
        if (!dbUser.avatar && profile.picture) dbUser.avatar = profile.picture;
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
    const response = NextResponse.redirect(new URL(redirectPath, origin));
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch {
    return NextResponse.redirect(new URL(`/login?error=google_server_error`, origin));
  }
}
