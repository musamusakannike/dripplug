import { NextRequest, NextResponse } from "next/server";

const DEFAULT_GOOGLE_CLIENT_ID =
  "459411913645-in46ojva228tplj1lhtbgncg961763i6.apps.googleusercontent.com";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  const redirectPath = req.nextUrl.searchParams.get("redirect") || "/";
  const origin = req.nextUrl.origin;
  // Google requires the redirect_uri to exactly match a URI registered in the
  // Google Cloud Console. Derive it from the canonical app URL so host
  // variations (www vs non-www) can never cause a redirect_uri_mismatch.
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || origin}/api/auth/google/callback`;

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", redirectPath);

  return NextResponse.redirect(googleAuthUrl.toString());
}
