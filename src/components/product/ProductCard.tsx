"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Check, Star } from "lucide-react";
import { SerializedProduct } from "@/types";
import { formatPrice, getDiscountPercentage } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { useHydrated } from "@/hooks/useHydrated";

export function StarRating({
  rating,
  count,
  showFraction = true,
}: {
  rating: number;
  count?: number;
  showFraction?: boolean;
}) {
  if (!rating || rating <= 0 || (typeof count === "number" && count <= 0)) {
    return null;
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.4;

  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5 stars`}>
      <div className="flex items-center gap-0.5 text-star">
        {Array.from({ length: 5 }).map((_, idx) => {
          const filled = idx < fullStars || (idx === fullStars && hasHalf);
          return (
            <Star
              key={idx}
              aria-hidden="true"
              className={`w-3.5 h-3.5 ${
                filled ? "fill-star text-star" : "text-border fill-border"
              }`}
            />
          );
        })}
      </div>
      {showFraction && (
        <span className="text-xs font-medium text-black">
          {rating.toFixed(1)}/<span className="text-muted">5</span>
        </span>
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: SerializedProduct }) {
  const hydrated = useHydrated();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const wishlistIds = useCartStore((s) => s.wishlistIds);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const addToast = useToastStore((s) => s.addToast);

  const isWishlisted = hydrated && wishlistIds.includes(product._id);
  const discountPercent = getDiscountPercentage(product.basePrice, product.compareAtPrice);
  const primaryImage = product.images[0] || "";
  const secondaryImage = product.images[1] || primaryImage;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const availableVariant =
      product.variants.find((v) => v.stock > 0) || product.variants[0];
    if (!availableVariant) {
      addToast("This item is currently out of stock.", "error");
      return;
    }

    const colorObj = product.colors.find((c) => c.name === availableVariant.color);
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: primaryImage,
      size: availableVariant.size,
      color: availableVariant.color,
      colorHex: colorObj?.hex,
      unitPrice: availableVariant.priceOverride || product.basePrice,
      compareAtPrice: product.compareAtPrice,
      quantity: 1,
    });

    setAdded(true);
    addToast(`Added ${product.name} (${availableVariant.size}) to bag`, "success");
    setTimeout(() => setAdded(false), 1200);
  }

  function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleWishlist(product._id);
    addToast(
      nowSaved ? "Saved to your wishlist" : "Removed from wishlist",
      "info"
    );
  }

  return (
    <div
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square w-full rounded-[20px] bg-surface overflow-hidden mb-3">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={hovered ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 24vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Top-Right Wishlist Heart Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:bg-white transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? "fill-danger text-danger" : "text-black"
            }`}
          />
        </motion.button>

        {/* Bottom-Right Quick Add Pill Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={handleQuickAdd}
          aria-label={`Quick add ${product.name} to cart`}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:bg-black/85 transition-colors cursor-pointer"
        >
          {added ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <ShoppingBag className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      <Link
        href={`/product/${product.slug}`}
        className="font-bold text-sm sm:text-base text-black hover:underline line-clamp-1"
      >
        {product.name}
      </Link>

      <div className="mt-1">
        <StarRating rating={product.ratingAverage} count={product.ratingCount} />
      </div>

      <div className="mt-1.5 flex items-center flex-wrap gap-2">
        <span className="font-bold text-base sm:text-lg text-black">
          {formatPrice(product.basePrice)}
        </span>

        {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
          <>
            <span className="text-sm sm:text-base text-muted-light line-through font-semibold">
              {formatPrice(product.compareAtPrice)}
            </span>
            {discountPercent > 0 && (
              <span className="rounded-full bg-danger-bg text-danger text-[11px] font-semibold px-2.5 py-0.5">
                -{discountPercent}%
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
