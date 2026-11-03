import { SESSION_COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth";
import { apiSuccess } from "@/lib/rate-limit";

export async function POST() {
  const response = apiSuccess({ loggedOut: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
