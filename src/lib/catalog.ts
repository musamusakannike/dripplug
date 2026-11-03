import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Product, IProduct } from "@/models/Product";
import { Category, ICategory } from "@/models/Category";
import { Review, IReview } from "@/models/Review";
import {
  SAMPLE_CATEGORIES,
  SAMPLE_PRODUCTS,
  SAMPLE_VERIFIED_REVIEWS,
} from "@/lib/sample-data";
import {
  SerializedCategory,
  SerializedProduct,
  SerializedReview,
} from "@/types";
import { PAGINATION_LIMIT } from "@/config/site";

function serializeProductDoc(doc: IProduct | Record<string, unknown>): SerializedProduct {
  const d = doc as Record<string, unknown>;
  return {
    _id: String(d._id || `sample_${d.slug}`),
    name: String(d.name),
    slug: String(d.slug),
    description: String(d.description),
    details: Array.isArray(d.details) ? (d.details as string[]) : [],
    faqs: Array.isArray(d.faqs)
      ? (d.faqs as { question: string; answer: string }[])
      : [],
    category: String(d.category || d.categorySlug),
    categorySlug: String(d.categorySlug),
    images: Array.isArray(d.images) ? (d.images as string[]) : [],
    basePrice: Number(d.basePrice),
    compareAtPrice: d.compareAtPrice ? Number(d.compareAtPrice) : undefined,
    colors: Array.isArray(d.colors)
      ? (d.colors as { name: string; hex: string }[])
      : [],
    variants: Array.isArray(d.variants)
      ? (d.variants as {
          size: string;
          color: string;
          sku: string;
          stock: number;
          priceOverride?: number;
        }[])
      : [],
    tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
    isFeatured: Boolean(d.isFeatured),
    isActive: d.isActive !== false,
    soldCount: Number(d.soldCount || 0),
    ratingAverage: Number(d.ratingAverage || 0),
    ratingCount: Number(d.ratingCount || 0),
    metaTitle: d.metaTitle ? String(d.metaTitle) : undefined,
    metaDescription: d.metaDescription ? String(d.metaDescription) : undefined,
    createdAt: d.createdAt ? new Date(String(d.createdAt)).toISOString() : new Date().toISOString(),
  };
}

function getFallbackSampleProducts(): SerializedProduct[] {
  return SAMPLE_PRODUCTS.map((p, idx) => ({
    ...p,
    _id: `sample_prod_${idx + 1}`,
    category: `sample_cat_${p.categorySlug}`,
    createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
  }));
}

export async function getCategories(): Promise<SerializedCategory[]> {
  if (isDatabaseConfigured()) {
    try {
      await connectDB();
      const cats = await Category.find().sort({ order: 1 }).lean();
      if (cats.length > 0) {
        return cats.map((c: ICategory | Record<string, unknown>) => ({
          _id: String((c as Record<string, unknown>)._id),
          name: String((c as Record<string, unknown>).name),
          slug: String((c as Record<string, unknown>).slug),
          image: String((c as Record<string, unknown>).image),
          description: (c as Record<string, unknown>).description
            ? String((c as Record<string, unknown>).description)
            : "",
          order: Number((c as Record<string, unknown>).order || 0),
        }));
      }
    } catch {
      // Fallback to sample categories
    }
  }

  return SAMPLE_CATEGORIES.map((c, i) => ({
    ...c,
    _id: `sample_cat_${i + 1}`,
  }));
}

export async function getHomePageData() {
  if (isDatabaseConfigured()) {
    try {
      await connectDB();
      const [newArrivalsDocs, topSellingDocs, totalActiveProducts, verifiedReviewsDocs] =
        await Promise.all([
          Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).lean(),
          Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(4).lean(),
          Product.countDocuments({ isActive: true }),
          Review.find({ status: "published" }).sort({ createdAt: -1 }).limit(8).lean(),
        ]);

      if (newArrivalsDocs.length > 0) {
        return {
          newArrivals: newArrivalsDocs.map(serializeProductDoc),
          topSelling: topSellingDocs.map(serializeProductDoc),
          totalProductsInStock: totalActiveProducts,
          verifiedReviews: verifiedReviewsDocs.map((r: IReview | Record<string, unknown>) => ({
            _id: String((r as Record<string, unknown>)._id),
            product: String((r as Record<string, unknown>).product),
            user: String((r as Record<string, unknown>).user),
            userName: String((r as Record<string, unknown>).userName),
            rating: Number((r as Record<string, unknown>).rating),
            comment: String((r as Record<string, unknown>).comment),
            status: "published" as const,
            createdAt: new Date(String((r as Record<string, unknown>).createdAt)).toISOString(),
          })),
        };
      }
    } catch {
      // Fallback to sample catalog
    }
  }

  const allSample = getFallbackSampleProducts();
  const topSelling = [...allSample].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);
  const newArrivals = allSample.slice(0, 4);

  return {
    newArrivals,
    topSelling,
    totalProductsInStock: allSample.length,
    verifiedReviews: SAMPLE_VERIFIED_REVIEWS,
  };
}

export interface CatalogFilterParams {
  category?: string;
  q?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort?: "popular" | "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export async function getFilteredCatalog(params: CatalogFilterParams): Promise<{
  products: SerializedProduct[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, params.page || 1);
  const limit = params.limit || PAGINATION_LIMIT;
  const skip = (page - 1) * limit;

  if (isDatabaseConfigured()) {
    try {
      await connectDB();
      const query: Record<string, unknown> = { isActive: true };

      if (params.category) {
        query.categorySlug = params.category.toLowerCase();
      }
      if (params.q && params.q.trim()) {
        const regex = new RegExp(params.q.trim(), "i");
        query.$or = [{ name: regex }, { tags: regex }, { description: regex }];
      }
      if (params.size) {
        query["variants.size"] = params.size;
      }
      if (params.color) {
        query["colors.name"] = new RegExp(`^${params.color}$`, "i");
      }
      if (typeof params.minPrice === "number" || typeof params.maxPrice === "number") {
        const priceFilter: Record<string, number> = {};
        if (typeof params.minPrice === "number") priceFilter.$gte = params.minPrice;
        if (typeof params.maxPrice === "number") priceFilter.$lte = params.maxPrice;
        query.basePrice = priceFilter;
      }
      if (params.onSale) {
        query.$expr = { $gt: ["$compareAtPrice", "$basePrice"] };
      }

      let sortSpec: Record<string, 1 | -1> = { soldCount: -1 };
      if (params.sort === "newest") sortSpec = { createdAt: -1 };
      if (params.sort === "price_asc") sortSpec = { basePrice: 1 };
      if (params.sort === "price_desc") sortSpec = { basePrice: -1 };

      const [docs, count] = await Promise.all([
        Product.find(query).sort(sortSpec).skip(skip).limit(limit).lean(),
        Product.countDocuments(query),
      ]);

      if (count > 0 || (await Product.countDocuments()) > 0) {
        return {
          products: docs.map(serializeProductDoc),
          total: count,
          page,
          totalPages: Math.max(1, Math.ceil(count / limit)),
        };
      }
    } catch {
      // Fallback to in-memory filtering on sample products
    }
  }

  let items = getFallbackSampleProducts();

  if (params.category) {
    items = items.filter((p) => p.categorySlug === params.category?.toLowerCase());
  }
  if (params.q && params.q.trim()) {
    const qLower = params.q.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower) ||
        p.tags.some((t) => t.toLowerCase().includes(qLower))
    );
  }
  if (params.size) {
    items = items.filter((p) =>
      p.variants.some((v) => v.size === params.size && v.stock > 0)
    );
  }
  if (params.color) {
    const cLower = params.color.toLowerCase();
    items = items.filter((p) => p.colors.some((c) => c.name.toLowerCase() === cLower));
  }
  if (typeof params.minPrice === "number") {
    items = items.filter((p) => p.basePrice >= (params.minPrice as number));
  }
  if (typeof params.maxPrice === "number") {
    items = items.filter((p) => p.basePrice <= (params.maxPrice as number));
  }
  if (params.onSale) {
    items = items.filter((p) => p.compareAtPrice && p.compareAtPrice > p.basePrice);
  }

  if (params.sort === "newest") {
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (params.sort === "price_asc") {
    items.sort((a, b) => a.basePrice - b.basePrice);
  } else if (params.sort === "price_desc") {
    items.sort((a, b) => b.basePrice - a.basePrice);
  } else {
    items.sort((a, b) => b.soldCount - a.soldCount);
  }

  const total = items.length;
  const paginated = items.slice(skip, skip + limit);

  return {
    products: paginated,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getProductBySlug(slug: string): Promise<{
  product: SerializedProduct | null;
  related: SerializedProduct[];
  reviews: SerializedReview[];
}> {
  if (isDatabaseConfigured()) {
    try {
      await connectDB();
      const doc = await Product.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
      if (doc) {
        const serialized = serializeProductDoc(doc);
        const [relatedDocs, reviewDocs] = await Promise.all([
          Product.find({
            categorySlug: serialized.categorySlug,
            slug: { $ne: serialized.slug },
            isActive: true,
          })
            .limit(4)
            .lean(),
          Review.find({ product: doc._id, status: "published" })
            .sort({ createdAt: -1 })
            .lean(),
        ]);

        return {
          product: serialized,
          related: relatedDocs.map(serializeProductDoc),
          reviews: reviewDocs.map((r: IReview | Record<string, unknown>) => ({
            _id: String((r as Record<string, unknown>)._id),
            product: String((r as Record<string, unknown>).product),
            user: String((r as Record<string, unknown>).user),
            userName: String((r as Record<string, unknown>).userName),
            rating: Number((r as Record<string, unknown>).rating),
            comment: String((r as Record<string, unknown>).comment),
            status: "published" as const,
            createdAt: new Date(String((r as Record<string, unknown>).createdAt)).toISOString(),
          })),
        };
      }
    } catch {
      // Fallback to sample catalog
    }
  }

  const allSample = getFallbackSampleProducts();
  const product = allSample.find((p) => p.slug === slug.toLowerCase()) || null;
  if (!product) {
    return { product: null, related: [], reviews: [] };
  }

  const related = allSample
    .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
    .slice(0, 4);

  return {
    product,
    related,
    reviews: SAMPLE_VERIFIED_REVIEWS,
  };
}
