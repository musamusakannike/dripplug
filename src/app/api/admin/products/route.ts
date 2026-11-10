import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { adminProductSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { deleteObject } from "@/lib/storage";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }
    if (!isDatabaseConfigured()) {
      return apiSuccess({ products: [] });
    }
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return apiSuccess({ products });
  } catch (err) {
    return handleApiException(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = adminProductSchema.parse(body);

    const category = await Category.findOne({
      slug: parsed.categorySlug.toLowerCase(),
    });
    if (!category) {
      return apiError("Selected category does not exist.", 400);
    }

    const slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.name);

    const product = await Product.create({
      ...parsed,
      slug,
      compareAtPrice: parsed.compareAtPrice || undefined,
      category: category._id,
      categorySlug: category.slug,
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${category.slug}`);
    revalidatePath(`/product/${product.slug}`);

    return apiSuccess({ product }, 201);
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
    const { id, ...rest } = body;
    if (!id) {
      return apiError("Product ID is required for update.", 400);
    }

    const existing = await Product.findById(id);
    if (!existing) {
      return apiError("Product not found.", 404);
    }

    // Quick toggle shortcut (isActive, isFeatured, isNewArrival, isBestSeller, newArrivalOrder, bestSellerOrder)
    const allowedQuickKeys = new Set([
      "isActive",
      "isFeatured",
      "isNewArrival",
      "isBestSeller",
      "newArrivalOrder",
      "bestSellerOrder",
    ]);
    const restKeys = Object.keys(rest);
    if (
      restKeys.length > 0 &&
      restKeys.every((k) => allowedQuickKeys.has(k))
    ) {
      if (typeof rest.isActive === "boolean") existing.isActive = rest.isActive;
      if (typeof rest.isFeatured === "boolean") existing.isFeatured = rest.isFeatured;
      if (typeof rest.isNewArrival === "boolean") existing.isNewArrival = rest.isNewArrival;
      if (typeof rest.isBestSeller === "boolean") existing.isBestSeller = rest.isBestSeller;
      if (typeof rest.newArrivalOrder === "number") existing.newArrivalOrder = rest.newArrivalOrder;
      if (typeof rest.bestSellerOrder === "number") existing.bestSellerOrder = rest.bestSellerOrder;
      await existing.save();
      revalidatePath("/");
      revalidatePath("/shop");
      return apiSuccess({ product: existing });
    }

    const parsed = adminProductSchema.parse(rest);
    const category = await Category.findOne({
      slug: parsed.categorySlug.toLowerCase(),
    });
    if (!category) {
      return apiError("Selected category does not exist.", 400);
    }

    // Delete any removed images from R2
    const removedImages = existing.images.filter(
      (oldUrl) => !parsed.images.includes(oldUrl)
    );
    for (const url of removedImages) {
      await deleteObject(url);
    }

    existing.name = parsed.name;
    existing.slug = parsed.slug ? slugify(parsed.slug) : existing.slug;
    existing.description = parsed.description;
    existing.details = parsed.details;
    existing.faqs = parsed.faqs;
    existing.category = category._id;
    existing.categorySlug = category.slug;
    existing.images = parsed.images;
    existing.basePrice = parsed.basePrice;
    existing.compareAtPrice = parsed.compareAtPrice || undefined;
    existing.colors = parsed.colors;
    existing.variants = parsed.variants;
    existing.tags = parsed.tags;
    existing.isFeatured = parsed.isFeatured;
    existing.isActive = parsed.isActive;
    existing.isNewArrival = parsed.isNewArrival;
    existing.isBestSeller = parsed.isBestSeller;
    existing.newArrivalOrder = parsed.newArrivalOrder;
    existing.bestSellerOrder = parsed.bestSellerOrder;
    existing.metaTitle = parsed.metaTitle;
    existing.metaDescription = parsed.metaDescription;

    await existing.save();

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${category.slug}`);
    revalidatePath(`/product/${existing.slug}`);

    return apiSuccess({ product: existing });
  } catch (err) {
    return handleApiException(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return apiError("Product ID is required.", 400);
    }

    const existing = await Product.findById(id);
    if (!existing) {
      return apiError("Product not found.", 404);
    }

    for (const imgUrl of existing.images) {
      await deleteObject(imgUrl);
    }

    await existing.deleteOne();
    revalidatePath("/");
    revalidatePath("/shop");

    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiException(err);
  }
}
