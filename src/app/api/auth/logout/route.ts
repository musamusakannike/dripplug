import { clearSessionCookie } from "@/lib/auth";
import { apiSuccess } from "@/lib/rate-limit";

export async function POST() {
  await clearSessionCookie();
  return apiSuccess({ loggedOut: true });
}
