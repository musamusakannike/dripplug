import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Product } from "@/models/Product";
import { serializeProductDoc } from "@/lib/catalog";
import { adminCurationSchema } from "@/lib/validators";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    if (!isDatabaseConfigured()) {
      return apiSuccess({
        newArrivals: [],
        bestSellers: [],
        isNewArrivalsManual: false,
        isBestSellersManual: false,
        fallbackNewArrivals: [],
        fallbackBestSellers: [],
      });
    }

    await connectDB();

    const [
      manualNewArrivals,
      manualBestSellers,
      fallbackNewArrivals,
      fallbackBestSellers,
    ] = await Promise.all([
      Product.find({ isActive: true, isNewArrival: true })
        .sort({ newArrivalOrder: 1, createdAt: -1 })
        .lean(),
      Product.find({ isActive: true, isBestSeller: true })
        .sort({ bestSellerOrder: 1, soldCount: -1 })
        .lean(),
      Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).lean(),
      Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(4).lean(),
    ]);

    return apiSuccess({
      newArrivals: manualNewArrivals.map(serializeProductDoc),
      bestSellers: manualBestSellers.map(serializeProductDoc),
      isNewArrivalsManual: manualNewArrivals.length > 0,
      isBestSellersManual: manualBestSellers.length > 0,
      fallbackNewArrivals: fallbackNewArrivals.map(serializeProductDoc),
      fallbackBestSellers: fallbackBestSellers.map(serializeProductDoc),
    });
  } catch (err) {
    return handleApiException(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = adminCurationSchema.parse(body);

    if (parsed.action === "clear_new_arrivals") {
      await Product.updateMany({}, { isNewArrival: false, newArrivalOrder: 0 });
    } else if (parsed.action === "clear_best_sellers") {
      await Product.updateMany({}, { isBestSeller: false, bestSellerOrder: 0 });
    } else if (parsed.action === "clear_all") {
      await Product.updateMany(
        {},
        {
          isNewArrival: false,
          isBestSeller: false,
          newArrivalOrder: 0,
          bestSellerOrder: 0,
        }
      );
    }

    if (Array.isArray(parsed.newArrivalIds)) {
      // Reset current new arrivals
      await Product.updateMany({}, { isNewArrival: false, newArrivalOrder: 0 });
      // Apply new selection with order
      for (let i = 0; i < parsed.newArrivalIds.length; i++) {
        const id = parsed.newArrivalIds[i];
        if (id) {
          await Product.findByIdAndUpdate(id, {
            isNewArrival: true,
            newArrivalOrder: i,
          });
        }
      }
    }

    if (Array.isArray(parsed.bestSellerIds)) {
      // Reset current best sellers
      await Product.updateMany({}, { isBestSeller: false, bestSellerOrder: 0 });
      // Apply new selection with order
      for (let i = 0; i < parsed.bestSellerIds.length; i++) {
        const id = parsed.bestSellerIds[i];
        if (id) {
          await Product.findByIdAndUpdate(id, {
            isBestSeller: true,
            bestSellerOrder: i,
          });
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/shop");

    // Fetch updated products
    const [allProducts, manualNew, manualBest] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).lean(),
      Product.find({ isActive: true, isNewArrival: true })
        .sort({ newArrivalOrder: 1, createdAt: -1 })
        .lean(),
      Product.find({ isActive: true, isBestSeller: true })
        .sort({ bestSellerOrder: 1, soldCount: -1 })
        .lean(),
    ]);

    return apiSuccess({
      products: allProducts.map(serializeProductDoc),
      newArrivals: manualNew.map(serializeProductDoc),
      bestSellers: manualBest.map(serializeProductDoc),
      isNewArrivalsManual: manualNew.length > 0,
      isBestSellersManual: manualBest.length > 0,
    });
  } catch (err) {
    return handleApiException(err);
  }
}
