import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { SessionUser } from "@/types";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { User } from "@/models/User";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  const derivedBuffer = scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return timingSafeEqual(keyBuffer, derivedBuffer);
}

/**
 * SESSION ARCHITECTURE CHOICE:
 * We verify the Firebase ID token once at POST /api/auth/session using `firebase-admin`,
 * upsert the user in MongoDB, and issue a compact HS256-signed JWT stored in an
 * `httpOnly`, `secure`, `sameSite=lax` cookie (`dripplug_session`).
 *
 * Why a signed JWT via `jose` instead of a Firebase Session Cookie:
 * 1. Runs natively in Next.js Edge/Proxy middleware without requiring Node-only `firebase-admin`
 *    network round-trips on every route transition.
 * 2. Embeds the MongoDB `role` ("customer" | "admin") and `userId` directly in the verified
 *    token payload so `/admin` and `/checkout` route protection is instantaneous (<1ms).
 */

export const SESSION_COOKIE_NAME = "dripplug_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 14; // 14 days

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

function getSecretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET || "dripplug-fallback-dev-secret-key-minimum-32-chars";
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload || typeof payload.id !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return {
      id: payload.id,
      firebaseUid: String(payload.firebaseUid || ""),
      name: String(payload.name || ""),
      email: payload.email,
      phone: String(payload.phone || ""),
      role: payload.role === "admin" ? "admin" : "customer",
      avatar: payload.avatar ? String(payload.avatar) : undefined,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Server Component & Route Handler helper to retrieve the current authenticated user.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  // Optionally sync fresh role/profile from DB if connected
  if (isDatabaseConfigured()) {
    try {
      await connectDB();
      const dbUser = await User.findById(session.id).lean();
      if (dbUser) {
        return {
          id: String(dbUser._id),
          firebaseUid: dbUser.firebaseUid || "",
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone || "",
          role: dbUser.role,
          avatar: dbUser.avatar,
        };
      }
    } catch {
      // Return verified token payload if DB is momentarily unreachable
    }
  }

  return session;
}
