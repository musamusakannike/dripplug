"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import {
  AVAILABLE_COLORS,
  AVAILABLE_SIZES,
  PAGINATION_LIMIT,
} from "@/config/site";
import { formatPrice } from "@/lib/format";
import { SerializedCategory, SerializedProduct } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

interface CatalogBrowserProps {
  title: string;
  basePath: string;
  breadcrumbs: { label: string; href?: string }[];
  categories: SerializedCategory[];
  products: SerializedProduct[];
  total: number;
  page: number;
  totalPages: number;
  activeCategorySlug?: string;
}

export function CatalogBrowser({
  title,
  basePath,
  breadcrumbs,
  categories,
  products,
  total,
  page,
  totalPages,
  activeCategorySlug,
}: CatalogBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(true);
  const [colorsOpen, setColorsOpen] = useState(true);
  const [sizesOpen, setSizesOpen] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string>(
    searchParams.get("size") || ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    searchParams.get("color") || ""
  );
  const [minPrice, setMinPrice] = useState<number>(
    Number(searchParams.get("minPrice")) || 0
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    Number(searchParams.get("maxPrice")) || 35000
  );

  const currentSort = searchParams.get("sort") || "popular";
  const qParam = searchParams.get("q") || "";
  const onSaleParam = searchParams.get("onSale") === "true";

  const hasActiveFilters = Boolean(
    selectedSize ||
    selectedColor ||
    minPrice > 0 ||
    maxPrice < 35000 ||
    searchParams.get("size") ||
    searchParams.get("color") ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice")
  );

  const POPULAR_SEARCH_KEYWORDS = [
    "jerseys",
    "round necks",
    "t-shirts",
    "baggy jeans",
    "joggers",
    "hoodies",
    "caps",
    "unilorin",
    "kaka",
  ];

  const suggestedTerm = qParam
    ? POPULAR_SEARCH_KEYWORDS.find((term) => {
        const q = qParam.toLowerCase().trim();
        return (
          (q.length >= 3 && term.startsWith(q.slice(0, 3))) ||
          (q.length >= 4 && term.includes(q.slice(0, 4)))
        );
      })
    : null;

  function buildUrl(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(overrides)) {
      if (val === undefined || val === "" || val === 0) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function handleApplyFilters() {
    const targetUrl = buildUrl({
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 35000 ? maxPrice : undefined,
      page: 1,
    });
    setMobileFilterOpen(false);
    router.push(targetUrl);
  }

  function handleClearFilters() {
    setSelectedSize("");
    setSelectedColor("");
    setMinPrice(0);
    setMaxPrice(35000);
    setMobileFilterOpen(false);
    router.push(qParam ? `${basePath}?q=${encodeURIComponent(qParam)}` : basePath);
  }

  function handleSortChange(newSort: string) {
    router.push(buildUrl({ sort: newSort, page: 1 }));
  }

  const startIdx = total === 0 ? 0 : (page - 1) * PAGINATION_LIMIT + 1;
  const endIdx = Math.min(total, page * PAGINATION_LIMIT);

  const filterPanelContent = (
    <div className="space-y-6">
      {/* Subcategories List */}
      <div className="space-y-2.5 pb-6 border-b border-border">
        <Link
          href="/shop"
          className={`flex items-center justify-between text-sm py-1 transition-colors ${
            !activeCategorySlug
              ? "font-bold text-black"
              : "text-muted hover:text-black"
          }`}
        >
          <span>All Campus Clothing</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
        {categories.map((cat) => {
          const isCurrent = activeCategorySlug === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`flex items-center justify-between text-sm py-1 transition-colors ${
                isCurrent ? "font-bold text-black" : "text-muted hover:text-black"
              }`}
            >
              <span>{cat.name}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          );
        })}
      </div>

      {/* Collapsible Price Range Dual Slider */}
      <div className="pb-6 border-b border-border">
        <button
          type="button"
          onClick={() => setPriceOpen((p) => !p)}
          aria-expanded={priceOpen}
          className="w-full flex items-center justify-between font-bold text-base text-black cursor-pointer"
        >
          <span>Price</span>
          {priceOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {priceOpen && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-black">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
            <div className="space-y-2">
              <label htmlFor="min-price-range" className="block text-[11px] text-muted">
                Min Price
              </label>
              <input
                id="min-price-range"
                type="range"
                min={0}
                max={30000}
                step={1000}
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(Math.min(Number(e.target.value), maxPrice - 1000))
                }
                className="w-full accent-black cursor-pointer"
              />
              <label htmlFor="max-price-range" className="block text-[11px] text-muted">
                Max Price
              </label>
              <input
                id="max-price-range"
                type="range"
                min={5000}
                max={35000}
                step={1000}
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(Math.max(Number(e.target.value), minPrice + 1000))
                }
                className="w-full accent-black cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Circular Color Swatches */}
      <div className="pb-6 border-b border-border">
        <button
          type="button"
          onClick={() => setColorsOpen((p) => !p)}
          aria-expanded={colorsOpen}
          className="w-full flex items-center justify-between font-bold text-base text-black cursor-pointer"
        >
          <span>Colors</span>
          {colorsOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {colorsOpen && (
          <div className="mt-4 flex flex-wrap gap-2.5">
            {AVAILABLE_COLORS.map((c) => {
              const isSelected =
                selectedColor.toLowerCase() === c.name.toLowerCase();
              const isLight =
                c.hex.toUpperCase() === "#FFFFFF" ||
                c.hex.toUpperCase() === "#D6C7B2";
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() =>
                    setSelectedColor(isSelected ? "" : c.name)
                  }
                  aria-label={`Filter by color ${c.name}`}
                  aria-pressed={isSelected}
                  style={{ backgroundColor: c.hex }}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-transform cursor-pointer ${
                    isSelected ? "scale-110 ring-2 ring-black ring-offset-2" : "border-border"
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
        )}
      </div>

      {/* Collapsible Pill Size Chips */}
      <div className="pb-6 border-b border-border">
        <button
          type="button"
          onClick={() => setSizesOpen((p) => !p)}
          aria-expanded={sizesOpen}
          className="w-full flex items-center justify-between font-bold text-base text-black cursor-pointer"
        >
          <span>Size</span>
          {sizesOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {sizesOpen && (
          <div className="mt-4 flex flex-wrap gap-2">
            {AVAILABLE_SIZES.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(isSelected ? "" : sz)}
                  aria-pressed={isSelected}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-black text-white font-semibold"
                      : "bg-surface text-muted hover:text-black"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleApplyFilters}
          className="w-full h-12 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/90 transition-colors cursor-pointer"
        >
          Apply Filter
        </button>
        {(selectedSize ||
          selectedColor ||
          minPrice > 0 ||
          maxPrice < 35000 ||
          onSaleParam) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full h-10 rounded-full border border-border text-xs font-semibold text-muted hover:text-black transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-muted mb-6"
      >
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5" />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-black transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-black font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Left Rounded Filter Sidebar */}
        <aside
          aria-label="Product filters"
          className="hidden lg:block lg:col-span-3 rounded-[20px] border border-border p-6"
        >
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-border">
            <h2 className="font-bold text-lg text-black">Filters</h2>
            <SlidersHorizontal className="w-5 h-5 text-muted" />
          </div>
          {filterPanelContent}
        </aside>

        {/* Right Product Grid Area */}
        <div className="lg:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight">
              {title}
            </h1>

            <div className="flex items-center gap-3 ml-auto">
              <p className="text-xs sm:text-sm text-muted">
                Showing {startIdx}&ndash;{endIdx} of {total} Products
              </p>

              <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm">
                <label htmlFor="sort-select" className="text-muted">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="font-semibold text-black bg-transparent pr-2 py-1 cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                aria-label="Open product filters"
                className="lg:hidden w-9 h-9 rounded-full bg-surface flex items-center justify-center hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[24px] border border-border p-12 text-center my-6">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-muted" />
              </div>
              <h2 className="font-heading text-xl uppercase">
                No matching fits found
              </h2>
              {hasActiveFilters ? (
                <>
                  <p className="text-xs sm:text-sm text-muted mt-1 max-w-sm mx-auto">
                    Try clearing some filters or adjusting your price range to see more campus styles.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-6 px-6 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/90 transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </>
              ) : (
                <>
                  {suggestedTerm && (
                    <p className="text-xs sm:text-sm text-muted mt-2">
                      Did you mean:{" "}
                      <Link
                        href={`/search?q=${encodeURIComponent(suggestedTerm)}`}
                        className="text-black font-semibold underline underline-offset-4"
                      >
                        &ldquo;{suggestedTerm}&rdquo;
                      </Link>
                      ?
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-sm mx-auto">
                    {qParam
                      ? `We couldn't find items matching "${qParam}". Browse our catalog or try searching for jerseys, tees, or baggy jeans.`
                      : "No products available in this selection yet."}
                  </p>
                  <Link
                    href="/shop"
                    className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/90 transition-colors"
                  >
                    Browse All Fits
                  </Link>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>

              {/* Numbered Pagination with Previous and Next Buttons */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-2"
                >
                  <Link
                    href={buildUrl({ page: Math.max(1, page - 1) })}
                    aria-disabled={page <= 1}
                    className={`h-10 px-4 rounded-xl border border-border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                      page <= 1
                        ? "opacity-40 pointer-events-none"
                        : "hover:bg-surface"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Link>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      const isCurrent = pNum === page;
                      return (
                        <Link
                          key={pNum}
                          href={buildUrl({ page: pNum })}
                          aria-current={isCurrent ? "page" : undefined}
                          className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center transition-colors ${
                            isCurrent
                              ? "bg-surface text-black font-bold"
                              : "text-muted hover:bg-surface/60 hover:text-black"
                          }`}
                        >
                          {pNum}
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href={buildUrl({ page: Math.min(totalPages, page + 1) })}
                    aria-disabled={page >= totalPages}
                    className={`h-10 px-4 rounded-xl border border-border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                      page >= totalPages
                        ? "opacity-40 pointer-events-none"
                        : "hover:bg-surface"
                    }`}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet Filters */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-[28px] max-h-[88vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h2 className="font-bold text-lg">Filters &amp; Sort</h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-2 rounded-full hover:bg-surface cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 pb-6 border-b border-border">
              <label htmlFor="mobile-sort" className="block font-bold text-sm mb-2">
                Sort By
              </label>
              <select
                id="mobile-sort"
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full h-11 rounded-full bg-surface px-4 text-sm font-semibold"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {filterPanelContent}
          </div>
        </div>
      )}
    </div>
  );
}
