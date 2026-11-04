import { createRemoteJWKSet, jwtVerify } from "jose";

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export interface VerifiedFirebaseToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Verifies a Firebase ID token using Google's official public JWKS endpoint via `jose`.
 * Avoids importing `firebase-admin` (an external ESM package that triggers Next.js 16
 * Turbopack's `Invariant: The lazy module is still loading` crash on serverless routes).
 */
export async function verifyFirebaseIdToken(
  idToken: string
): Promise<VerifiedFirebaseToken> {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "dripplug";

  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid = String(payload.sub || payload.user_id || "");
  if (!uid) {
    throw new Error("Invalid Firebase ID token: missing subject (uid).");
  }

  return {
    uid,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}
