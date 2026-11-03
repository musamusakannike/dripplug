import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/checkout", "/orders", "/account", "/admin"];

export async function handleRouteProtection(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Next.js 16 Proxy convention + classic Middleware export
export async function proxy(request: NextRequest) {
  return handleRouteProtection(request);
}

export async function middleware(request: NextRequest) {
  return handleRouteProtection(request);
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/account/:path*", "/admin/:path*"],
};
