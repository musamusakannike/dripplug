import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { adminCategorySchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { deleteObject } from "@/lib/storage";
import { apiError, apiSuccess, handleApiException } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return apiError("Admin access required.", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = adminCategorySchema.parse(body);
    const slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.name);

    const category = await Category.create({
      name: parsed.name,
      slug,
      image: parsed.image,
      description: parsed.description || "",
      order: parsed.order,
    });

    revalidatePath("/");
    revalidatePath("/shop");
    return apiSuccess({ category }, 201);
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
      return apiError("Category ID is required.", 400);
    }

    const existing = await Category.findById(id);
    if (!existing) {
      return apiError("Category not found.", 404);
    }

    const parsed = adminCategorySchema.parse(rest);
    const newSlug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.name);
    const oldSlug = existing.slug;

    if (existing.image && existing.image !== parsed.image) {
      await deleteObject(existing.image);
    }

    existing.name = parsed.name;
    existing.slug = newSlug;
    existing.image = parsed.image;
    existing.description = parsed.description || "";
    existing.order = parsed.order;
    await existing.save();

    if (oldSlug !== newSlug) {
      await Product.updateMany(
        { category: existing._id },
        { $set: { categorySlug: newSlug } }
      );
      revalidatePath(`/category/${oldSlug}`);
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${newSlug}`);
    return apiSuccess({ category: existing });
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
      return apiError("Category ID required.", 400);
    }

    const cat = await Category.findById(id);
    if (cat) {
      await deleteObject(cat.image);
      await cat.deleteOne();
    }

    revalidatePath("/");
    revalidatePath("/shop");
    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiException(err);
  }
}
