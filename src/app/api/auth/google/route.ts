import { NextRequest, NextResponse } from "next/server";

const DEFAULT_GOOGLE_CLIENT_ID =
  "459411913645-in46ojva228tplj1lhtbgncg961763i6.apps.googleusercontent.com";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  const redirectPath = req.nextUrl.searchParams.get("redirect") || "/";
  const origin = req.nextUrl.origin;
  const callbackUrl = `${origin}/api/auth/google/callback`;

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", redirectPath);

  return NextResponse.redirect(googleAuthUrl.toString());
}
