import { z } from "zod";
import { DELIVERY_POINTS, ORDER_STATUSES } from "@/config/site";

const deliveryPointIds = DELIVERY_POINTS.map((p) => p.id) as [string, ...string[]];

export const authSessionSchema = z.object({
  idToken: z.string().min(10, "Valid Firebase ID token is required").optional(),
  mode: z.enum(["signin", "signup", "google"]).optional(),
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Enter a valid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").max(128).optional(),
});

export const cartItemInputSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  colorHex: z.string().optional(),
  unitPrice: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  quantity: z.number().int().min(1).max(20),
  isCustomized: z.boolean().optional(),
  customizationFee: z.number().nonnegative().optional(),
  customizationText: z.string().trim().max(150).optional(),
});

export const cartSyncSchema = z.object({
  items: z.array(cartItemInputSchema).max(50),
});

export const checkoutInputSchema = z
  .object({
    customerName: z.string().trim().min(2, "Full name is required").max(100),
    phone: z
      .string()
      .trim()
      .min(10, "Enter a valid Nigerian phone number")
      .max(20),
    deliveryPointId: z.enum(deliveryPointIds),
    hostel: z.string().trim().max(120).optional(),
    room: z.string().trim().max(60).optional(),
    landmark: z.string().trim().max(160).optional(),
    saveAddress: z.boolean().optional(),
    couponCode: z.string().trim().max(30).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          slug: z.string().min(1),
          name: z.string().optional(),
          image: z.string().trim().optional(),
          size: z.string().min(1),
          color: z.string().min(1),
          quantity: z.number().int().min(1).max(20),
          isCustomized: z.boolean().optional(),
          customizationText: z.string().trim().max(150).optional(),
        })
      )
      .min(1, "Your cart is empty"),
  })
  .superRefine((data, ctx) => {
    const point = DELIVERY_POINTS.find((p) => p.id === data.deliveryPointId);
    if (point?.requiresAddress) {
      if (!data.hostel || data.hostel.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hostel"],
          message: "Hostel name is required for Hostel delivery",
        });
      }
      if (!data.room || data.room.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["room"],
          message: "Room number is required for Hostel delivery",
        });
      }
      if (!data.landmark || data.landmark.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["landmark"],
          message: "Nearest landmark is required for Hostel delivery",
        });
      }
    }
  });

export const couponValidateSchema = z.object({
  code: z.string().trim().min(2).max(30),
  subtotal: z.number().nonnegative(),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export const reviewInputSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Review comment must be at least 10 characters")
    .max(1000),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Full name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number is required").max(20),
  savedAddresses: z
    .array(
      z.object({
        hostel: z.string().trim().min(2).max(120),
        room: z.string().trim().min(1).max(60),
        landmark: z.string().trim().min(2).max(160),
        isDefault: z.boolean().optional(),
      })
    )
    .max(5)
    .optional(),
});

export const adminUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  fileType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileSize: z.number().int().positive().max(5 * 1024 * 1024, "Maximum file size is 5MB"),
  folder: z.enum(["products", "categories"]).default("products"),
});

export const adminCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).optional(),
  image: z.string().url("Valid image URL is required"),
  description: z.string().trim().max(300).optional(),
  order: z.number().int().min(0).default(0),
});

export const adminProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().min(10).max(2000),
  details: z.array(z.string().trim().min(1)).default([]),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(2),
        answer: z.string().trim().min(2),
      })
    )
    .default([]),
  categorySlug: z.string().trim().min(1),
  images: z.array(z.string().url()).min(1, "At least one product image is required"),
  basePrice: z.number().int().positive("Base price must be greater than 0"),
  compareAtPrice: z.number().int().positive().optional().nullable(),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        hex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, "Valid hex color required"),
      })
    )
    .min(1, "At least one color is required"),
  variants: z
    .array(
      z.object({
        size: z.string().trim().min(1),
        color: z.string().trim().min(1),
        sku: z.string().trim().min(1),
        stock: z.number().int().min(0),
        priceOverride: z.number().int().positive().optional(),
      })
    )
    .min(1, "At least one size/color variant is required"),
  tags: z.array(z.string().trim()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isCustomizable: z.boolean().default(false),
  isRetroJersey: z.boolean().default(false).optional(),
  allowImageSelection: z.boolean().default(false).optional(),
  customizationPrice: z.number().int().nonnegative().optional().nullable(),
  customizationPrompt: z.string().trim().max(160).optional().nullable(),
  newArrivalOrder: z.number().int().default(0),
  bestSellerOrder: z.number().int().default(0),
  metaTitle: z.string().trim().max(120).optional(),
  metaDescription: z.string().trim().max(250).optional(),
});

export const adminCurationSchema = z.object({
  newArrivalIds: z.array(z.string().trim()).optional(),
  bestSellerIds: z.array(z.string().trim()).optional(),
  action: z
    .enum(["update", "clear_new_arrivals", "clear_best_sellers", "clear_all"])
    .optional(),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z
    .enum(["unpaid", "paid", "failed", "refunded", "flagged_mismatch"])
    .optional(),
  note: z.string().trim().max(300).optional(),
  deliveryPointId: z.enum(deliveryPointIds).optional(),
  deliveryAddress: z
    .object({
      customerName: z.string().trim().min(2).max(100),
      phone: z.string().trim().min(7).max(20),
      email: z.string().trim().email(),
      hostel: z.string().trim().max(120).optional(),
      room: z.string().trim().max(60).optional(),
      landmark: z.string().trim().max(160).optional(),
    })
    .optional(),
});

export const adminCouponSchema = z.object({
  code: z.string().trim().min(3).max(30).toUpperCase(),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive(),
  minOrder: z.number().nonnegative().default(0),
  expiry: z.string().min(1),
  usageLimit: z.number().int().positive().default(100),
  isActive: z.boolean().default(true),
});

export const adminReviewUpdateSchema = z.object({
  reviewId: z.string().min(1),
  status: z.enum(["published", "hidden"]).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().min(2).max(1000).optional(),
  userName: z.string().trim().min(1).max(100).optional(),
});
