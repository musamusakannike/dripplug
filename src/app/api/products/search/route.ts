import { NextRequest } from "next/server";
import { getFilteredCatalog } from "@/lib/catalog";
import {
  apiError,
  apiSuccess,
  checkRateLimit,
  getClientIp,
  handleApiException,
} from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`search_${ip}`, 40, 60_000);
    if (!rate.allowed) {
      return apiError("Rate limit exceeded", 429);
    }

    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    if (q.length < 2) {
      return apiSuccess({ suggestions: [] });
    }

    const { products } = await getFilteredCatalog({ q, limit: 5 });
    const suggestions = products.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      basePrice: p.basePrice,
      image: p.images[0],
      categorySlug: p.categorySlug,
    }));

    return apiSuccess({ suggestions });
  } catch (err) {
    return handleApiException(err);
  }
}
