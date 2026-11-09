import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { cartSyncSchema } from "@/lib/validators";
import { apiSuccess, handleApiException } from "@/lib/rate-limit";
import { CartItemClient } from "@/types";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isDatabaseConfigured() || !Types.ObjectId.isValid(user.id)) {
      return apiSuccess({ items: [] });
    }

    await connectDB();
    const cart = await Cart.findOne({ user: new Types.ObjectId(user.id) }).lean();
    if (!cart) {
      return apiSuccess({ items: [] });
    }

    const items: CartItemClient[] = cart.items.map((item) => ({
      productId: String(item.productId),
      slug: item.slug,
      name: item.name,
      image: item.image,
      size: item.size,
      color: item.color,
      colorHex: item.colorHex,
      unitPrice: item.unitPrice,
      compareAtPrice: item.compareAtPrice,
      quantity: item.quantity,
    }));

    return apiSuccess({ items });
  } catch (err) {
    return handleApiException(err);
  }
}

/**
 * Merges guest localStorage cart items into the user's server-side cart on login
 * or updates the server cart without losing items.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items: clientItems } = cartSyncSchema.parse(body);

    const user = await getCurrentUser();
    if (!user || !isDatabaseConfigured() || !Types.ObjectId.isValid(user.id)) {
      return apiSuccess({ items: clientItems });
    }

    await connectDB();
    const userId = new Types.ObjectId(user.id);
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: clientItems.map((i) => ({
          ...i,
          productId: Types.ObjectId.isValid(i.productId)
            ? new Types.ObjectId(i.productId)
            : i.productId,
        })),
      });
    } else {
      // Merge client items with server items
      const mergedMap = new Map<string, CartItemClient>();

      for (const existing of cart.items) {
        const key = `${String(existing.productId)}_${existing.size}_${existing.color}`;
        mergedMap.set(key, {
          productId: String(existing.productId),
          slug: existing.slug,
          name: existing.name,
          image: existing.image,
          size: existing.size,
          color: existing.color,
          colorHex: existing.colorHex,
          unitPrice: existing.unitPrice,
          compareAtPrice: existing.compareAtPrice,
          quantity: existing.quantity,
        });
      }

      for (const incoming of clientItems) {
        const key = `${incoming.productId}_${incoming.size}_${incoming.color}`;
        const prev = mergedMap.get(key);
        if (prev) {
          mergedMap.set(key, {
            ...incoming,
            quantity: Math.max(prev.quantity, incoming.quantity),
          });
        } else {
          mergedMap.set(key, incoming);
        }
      }

      const finalItems = Array.from(mergedMap.values());
      cart.items = finalItems.map((i) => ({
        ...i,
        productId: Types.ObjectId.isValid(i.productId)
          ? new Types.ObjectId(i.productId)
          : i.productId,
      }));
      await cart.save();
    }

    const serialized: CartItemClient[] = cart.items.map((item) => ({
      productId: String(item.productId),
      slug: item.slug,
      name: item.name,
      image: item.image,
      size: item.size,
      color: item.color,
      colorHex: item.colorHex,
      unitPrice: item.unitPrice,
      compareAtPrice: item.compareAtPrice,
      quantity: item.quantity,
    }));

    return apiSuccess({ items: serialized });
  } catch (err) {
    return handleApiException(err);
  }
}
