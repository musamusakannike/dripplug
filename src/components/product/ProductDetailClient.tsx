"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Check,
  Minus,
  Plus,
  Ruler,
  Truck,
  CheckCircle2,
  X,
  Star,
} from "lucide-react";
import {
  DELIVERY_POINTS,
  SIZE_GUIDE_ROWS,
} from "@/config/site";
import {
  formatDate,
  formatPrice,
  getDiscountPercentage,
} from "@/lib/format";
import { SerializedProduct, SerializedReview } from "@/types";
import { StarRating, ProductCard } from "@/components/product/ProductCard";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";

interface ProductDetailClientProps {
  product: SerializedProduct;
  related: SerializedProduct[];
  initialReviews: SerializedReview[];
}

export function ProductDetailClient({
  product,
  related,
  initialReviews,
}: ProductDetailClientProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || "Black"
  );

  // Pick initial in-stock size for selected color
  const initialSize =
    product.variants.find(
      (v) => v.color === (product.colors[0]?.name || "Black") && v.stock > 0
    )?.size ||
    product.variants[0]?.size ||
    "L";

  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [quantity, setQuantity] = useState(1);
  const [addedState, setAddedState] = useState(false);

  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faqs">(
    "reviews"
  );
  const [reviews, setReviews] = useState<SerializedReview[]>(initialReviews);
  const [reviewSort, setReviewSort] = useState<"latest" | "highest">("latest");
  const [visibleReviewCount, setVisibleReviewCount] = useState(6);

  const [canReview, setCanReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const sizeGuideRef = useRef<HTMLDialogElement>(null);
  const reviewDialogRef = useRef<HTMLDialogElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  // Check if current logged-in user bought this product and can write a review
  useEffect(() => {
    async function checkEligibility() {
      try {
        const res = await fetch(
          `/api/reviews?productId=${encodeURIComponent(product._id)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.ok) {
            setCanReview(Boolean(json.data.canReview));
          }
        }
      } catch {
        // Ignore
      }
    }
    checkEligibility();
  }, [product._id]);

  // Unique sizes available for this product
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  const currentVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  const unitPrice = currentVariant?.priceOverride || product.basePrice;
  const discountPercent = getDiscountPercentage(unitPrice, product.compareAtPrice);
  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;

  function handleColorSelect(colorName: string) {
    setSelectedColor(colorName);
    const matchingVariant = product.variants.find(
      (v) => v.color === colorName && v.size === selectedSize && v.stock > 0
    );
    if (!matchingVariant) {
      const fallback = product.variants.find(
        (v) => v.color === colorName && v.stock > 0
      );
      if (fallback) {
        setSelectedSize(fallback.size);
      }
    }
  }

  function handleAddToCart() {
    if (isOutOfStock) {
      addToast("Selected size/color is out of stock.", "error");
      return;
    }

    const colorObj = product.colors.find((c) => c.name === selectedColor);
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] || "",
      size: selectedSize,
      color: selectedColor,
      colorHex: colorObj?.hex,
      unitPrice,
      compareAtPrice: product.compareAtPrice,
      quantity,
    });

    setAddedState(true);
    addToast(
      `Added ${quantity}x ${product.name} (${selectedSize}, ${selectedColor}) to cart`,
      "success"
    );
    setTimeout(() => setAddedState(false), 1400);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: newRating,
          comment: newComment,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        addToast(json.error || "Could not submit review.", "error");
      } else {
        setReviews([json.data.review, ...reviews]);
        setCanReview(false);
        setNewComment("");
        reviewDialogRef.current?.close();
        addToast("Thank you! Your verified review has been published.", "success");
      }
    } catch {
      addToast("Network error submitting review.", "error");
    } finally {
      setSubmittingReview(false);
    }
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === "highest") return b.rating - a.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-28 md:pb-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-muted mb-6"
      >
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-black">
          Shop
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-black capitalize"
        >
          {product.categorySlug.replace("-", " ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left: Vertical Thumbnail Column + Main Image Tile */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:w-28 shrink-0">
            {product.images.map((imgUrl, idx) => {
              const isSelected = idx === selectedImageIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  aria-label={`View image ${idx + 1} of ${product.name}`}
                  className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-[16px] bg-surface overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    isSelected ? "border-black" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>

          {/* Large Main Image on Grey Rounded Tile */}
          <div className="relative flex-1 aspect-square rounded-[20px] bg-surface overflow-hidden">
            <Image
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.name}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
            {product.images.length > 1 && (
              <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === selectedImageIdx ? "bg-black w-4" : "bg-black/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Title, Rating, Price, Color Swatches, Size Chips, Quantity + Add to Cart */}
        <div className="lg:col-span-6 flex flex-col">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-black leading-[1.08]">
            {product.name}
          </h1>

          <div className="mt-3">
            <StarRating
              rating={product.ratingAverage}
              count={product.ratingCount}
            />
          </div>

          {/* Price Row */}
          <div className="mt-4 flex items-center gap-3">
            <span className="font-bold text-2xl sm:text-3xl text-black">
              {formatPrice(unitPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > unitPrice && (
              <>
                <span className="text-xl sm:text-2xl text-muted-light line-through font-semibold">
                  {formatPrice(product.compareAtPrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="rounded-full bg-danger-bg text-danger text-xs sm:text-sm font-semibold px-3 py-1">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted mt-4 leading-relaxed pb-5 border-b border-border">
            {product.description}
          </p>

          {/* Select Colors */}
          <div className="py-5 border-b border-border">
            <p className="text-xs sm:text-sm text-muted mb-3">
              Select Colors:{" "}
              <span className="text-black font-semibold">{selectedColor}</span>
            </p>
            <div className="flex items-center flex-wrap gap-3">
              {product.colors.map((c) => {
                const isSelected = c.name === selectedColor;
                const isLight =
                  c.hex.toUpperCase() === "#FFFFFF" ||
                  c.hex.toUpperCase() === "#D6C7B2";
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleColorSelect(c.name)}
                    aria-label={`Select color ${c.name}`}
                    aria-pressed={isSelected}
                    style={{ backgroundColor: c.hex }}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-transform cursor-pointer ${
                      isSelected
                        ? "scale-110 ring-2 ring-black ring-offset-2"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 ${
                          isLight ? "text-black" : "text-white"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Choose Size + Size Guide Button */}
          <div className="py-5 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs sm:text-sm text-muted">Choose Size</p>
              <button
                type="button"
                onClick={() => sizeGuideRef.current?.showModal()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-black underline underline-offset-4 hover:text-muted cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                Size Guide
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              {uniqueSizes.map((sz) => {
                const variantForSize = product.variants.find(
                  (v) => v.color === selectedColor && v.size === sz
                );
                const stock = variantForSize?.stock || 0;
                const disabled = stock <= 0;
                const isSelected = selectedSize === sz;

                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSize(sz)}
                    aria-pressed={isSelected}
                    className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      disabled
                        ? "bg-surface/60 text-muted-light line-through cursor-not-allowed"
                        : isSelected
                        ? "bg-black text-white font-semibold cursor-pointer"
                        : "bg-surface text-muted hover:text-black cursor-pointer"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper Pill + Wide Black Add to Cart Pill */}
          <div className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-13 rounded-full bg-surface px-4 flex items-center gap-5 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-1 text-black hover:opacity-70 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-sm min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => {
                      const maxStock = currentVariant?.stock || 8;
                      const cap = Math.min(8, maxStock);
                      return Math.min(cap, q + 1);
                    })
                  }
                  aria-label="Increase quantity"
                  className="p-1 text-black hover:opacity-70 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 h-13 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-black/90 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {addedState ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Cart
                  </>
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  "Add to Cart"
                )}
              </motion.button>
            </div>
            {quantity >= Math.min(8, currentVariant?.stock || 8) && (
              <p className="text-[11px] text-muted mt-2 pl-2">
                Maximum {Math.min(8, currentVariant?.stock || 8)} per order reached
              </p>
            )}
          </div>

          {/* Campus Delivery Points Info Card */}
          <div className="mt-6 rounded-[20px] bg-surface p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black">
              <Truck className="w-4 h-4" />
              <span>UNILORIN Campus Delivery Options</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {DELIVERY_POINTS.map((pt) => (
                <div
                  key={pt.id}
                  className="rounded-xl bg-white p-2.5 border border-border/70"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{pt.name}</span>
                    <span>{pt.fee === 0 ? "FREE" : formatPrice(pt.fee)}</span>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    {pt.estimatedTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Product Details | Rating & Reviews | FAQs */}
      <div className="mt-14">
        <div
          role="tablist"
          aria-label="Product information tabs"
          className="grid grid-cols-3 border-b border-border"
        >
          {(
            [
              { id: "details", label: "Product Details" },
              { id: "reviews", label: "Rating & Reviews" },
              { id: "faqs", label: "FAQs" },
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-xs sm:text-base font-medium border-b-2 transition-colors cursor-pointer ${
                  isSelected
                    ? "border-black text-black font-semibold"
                    : "border-transparent text-muted hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Product Details */}
        {activeTab === "details" && (
          <div className="py-8 max-w-3xl space-y-4">
            <h2 className="font-bold text-lg sm:text-xl">
              Specifications &amp; Material Care
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              {product.description}
            </p>
            <ul className="space-y-2.5 pt-2">
              {product.details.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab 2: Ratings & Reviews (Matches Screenshot 3) */}
        {activeTab === "reviews" && (
          <div className="py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-baseline gap-2">
                <h2 className="font-bold text-lg sm:text-xl text-black">
                  All Reviews
                </h2>
                <span className="text-xs sm:text-sm text-muted">
                  ({reviews.length})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="review-sort" className="visually-hidden">
                  Sort reviews
                </label>
                <select
                  id="review-sort"
                  value={reviewSort}
                  onChange={(e) =>
                    setReviewSort(e.target.value as "latest" | "highest")
                  }
                  className="h-11 rounded-full bg-surface px-4 text-xs sm:text-sm font-semibold text-black cursor-pointer"
                >
                  <option value="latest">Latest</option>
                  <option value="highest">Highest Rated</option>
                </select>

                {canReview && (
                  <button
                    type="button"
                    onClick={() => reviewDialogRef.current?.showModal()}
                    className="h-11 px-5 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:bg-black/90 transition-colors cursor-pointer"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            </div>

            {sortedReviews.length === 0 ? (
              <div className="rounded-[20px] border border-border p-8 text-center">
                <p className="font-semibold text-sm">
                  No verified reviews for this item yet.
                </p>
                <p className="text-xs text-muted mt-1">
                  Students who purchase this item can leave a verified review after checkout.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {sortedReviews.slice(0, visibleReviewCount).map((rev) => (
                    <article
                      key={rev._id}
                      className="rounded-[20px] border border-border p-6 flex flex-col justify-between"
                    >
                      <div>
                        <StarRating rating={rev.rating} showFraction={false} />
                        <div className="flex items-center gap-1.5 mt-3">
                          <h3 className="font-bold text-base text-black">
                            {rev.userName}
                          </h3>
                          <CheckCircle2
                            aria-label="Verified buyer"
                            className="w-4 h-4 fill-success text-white shrink-0"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-muted mt-2.5 leading-relaxed">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      </div>
                      <p className="text-xs text-muted font-medium mt-4">
                        Posted on {formatDate(rev.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>

                {visibleReviewCount < sortedReviews.length && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleReviewCount((c) => c + 4)}
                      className="h-12 px-8 rounded-full border border-border text-xs sm:text-sm font-semibold hover:bg-surface transition-colors cursor-pointer"
                    >
                      Load More Reviews
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 3: FAQs */}
        {activeTab === "faqs" && (
          <div className="py-8 max-w-3xl space-y-4">
            {product.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-[20px] border border-border p-5"
              >
                <h3 className="font-bold text-sm sm:text-base text-black">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1.5 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YOU MIGHT ALSO LIKE 4-card row */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-center mb-8">
            YOU MIGHT ALSO LIKE
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Add to Cart Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-border px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-muted">
            {selectedSize} &bull; {selectedColor}
          </p>
          <p className="font-bold text-base text-black">
            {formatPrice(unitPrice)}
          </p>
        </div>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="flex-1 max-w-[220px] h-11 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          {addedState ? "Added!" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {/* Native <dialog> Size Guide Modal */}
      <dialog
        ref={sizeGuideRef}
        aria-labelledby="size-guide-title"
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-[24px] bg-white p-6 shadow-2xl border border-border text-black"
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 id="size-guide-title" className="font-heading text-lg uppercase">
            CAMPUS SIZE GUIDE
          </h2>
          <button
            type="button"
            onClick={() => sizeGuideRef.current?.close()}
            aria-label="Close size guide"
            className="p-1.5 rounded-full hover:bg-surface cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <caption className="visually-hidden">
              Standard unisex garment measurements in inches
            </caption>
            <thead>
              <tr className="border-b border-border text-muted">
                <th scope="col" className="py-2.5 pr-4 font-semibold">
                  Size
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold">
                  Chest
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold">
                  Length
                </th>
                <th scope="col" className="py-2.5 pl-4 font-semibold">
                  Waist (Jeans/Joggers)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SIZE_GUIDE_ROWS.map((row) => (
                <tr key={row.size}>
                  <th scope="row" className="py-2.5 pr-4 font-bold">
                    {row.size}
                  </th>
                  <td className="py-2.5 px-4">{row.chest}</td>
                  <td className="py-2.5 px-4">{row.length}</td>
                  <td className="py-2.5 pl-4">{row.waist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>

      {/* Native <dialog> Write a Review Modal */}
      <dialog
        ref={reviewDialogRef}
        aria-labelledby="write-review-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[24px] bg-white p-6 shadow-2xl border border-border text-black"
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 id="write-review-title" className="font-heading text-lg uppercase">
            WRITE A VERIFIED REVIEW
          </h2>
          <button
            type="button"
            onClick={() => reviewDialogRef.current?.close()}
            aria-label="Close review modal"
            className="p-1.5 rounded-full hover:bg-surface cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2">
              Your Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setNewRating(starVal)}
                  aria-label={`Rate ${starVal} stars`}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      starVal <= newRating
                        ? "fill-star text-star"
                        : "text-border fill-border"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="block text-xs font-semibold mb-1.5"
            >
              How was the fit, fabric quality, and delivery?
            </label>
            <textarea
              id="review-comment"
              required
              minLength={10}
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your honest experience..."
              className="w-full rounded-2xl bg-surface p-3.5 text-sm text-black"
            />
          </div>

          <button
            type="submit"
            disabled={submittingReview}
            className="w-full h-12 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/90 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submittingReview ? "Publishing..." : "Publish Verified Review"}
          </button>
        </form>
      </dialog>
    </div>
  );
}
