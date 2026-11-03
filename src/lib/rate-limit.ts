import { NextResponse } from "next/server";
import { ZodError } from "zod";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

/**
 * Lightweight rate limiter abstraction (in-memory sliding window per IP + endpoint key).
 * Can be swapped transparently for Upstash Redis in multi-region edge deployments.
 */
export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export function handleApiException(err: unknown) {
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    return apiError(
      firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid request input",
      400,
      err.issues
    );
  }
  if (err instanceof Error) {
    console.error("[API Error]:", err.message);
    return apiError(err.message, 500);
  }
  return apiError("An unexpected server error occurred.", 500);
}
