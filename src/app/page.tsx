import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DELIVERY_POINTS,
  HERO_CONFIG,
  HOME_CATEGORY_TILES,
  TRUST_STRIP_ITEMS,
} from "@/config/site";
import { getHomePageData } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewsCarousel } from "@/components/product/ReviewsCarousel";

export const revalidate = 60;

export default async function HomePage() {
  const { newArrivals, topSelling, totalProductsInStock, verifiedReviews } =
    await getHomePageData();

  return (
    <div>
      {/* 1. Light-Grey Hero Section (Matches Shop.co reference layout, NO Sparkles icons) */}
      <section className="bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14 pb-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Copy & Real Stats */}
          <div className="lg:col-span-7 pb-8 lg:pb-14">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[58px] uppercase leading-[1.02] tracking-tight text-black">
              {HERO_CONFIG.headline}
            </h1>
            <p className="text-sm sm:text-base text-muted mt-4 max-w-xl leading-relaxed">
              {HERO_CONFIG.subtext}
            </p>

            <div className="mt-7">
              <Link
                href={HERO_CONFIG.ctaHref}
                className="w-full sm:w-auto min-w-[200px] h-13 px-10 rounded-full bg-black text-white font-semibold text-sm inline-flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                {HERO_CONFIG.ctaText}
              </Link>
            </div>

            {/* 3 Real / Configurable Stat Blocks (Never fake customer numbers) */}
            <div className="mt-9 pt-6 border-t border-border/80 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
              <div>
                <p className="font-bold text-2xl sm:text-3xl text-black">
                  {totalProductsInStock}+
                </p>
                <p className="text-[11px] sm:text-xs text-muted mt-0.5">
                  Verified Fits in Stock
                </p>
              </div>
              <div className="border-l border-border pl-4 sm:pl-8">
                <p className="font-bold text-2xl sm:text-3xl text-black">
                  {DELIVERY_POINTS.length}
                </p>
                <p className="text-[11px] sm:text-xs text-muted mt-0.5">
                  Campus Drop-Off Points
                </p>
              </div>
              <div className="border-l border-border pl-4 sm:pl-8">
                <p className="font-bold text-2xl sm:text-3xl text-black">
                  {HERO_CONFIG.typicalDeliveryStat}
                </p>
                <p className="text-[11px] sm:text-xs text-muted mt-0.5">
                  {HERO_CONFIG.typicalDeliveryLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:col-span-5 relative h-[360px] sm:h-[440px] lg:h-[520px] w-full rounded-t-[28px] overflow-hidden">
            <Image
              src={HERO_CONFIG.image}
              alt={HERO_CONFIG.imageAlt}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* 2. Black Full-Width Trust & Category Strip */}
      <div className="bg-black text-white py-5 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 sm:gap-10 min-w-max">
          {TRUST_STRIP_ITEMS.map((item) => (
            <span
              key={item}
              className="font-heading text-xs sm:text-sm md:text-base uppercase tracking-wider text-white/95"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 3. NEW ARRIVALS Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 border-b border-border">
        <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight text-center mb-8 md:mb-10">
          NEW ARRIVALS
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-9 text-center">
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center justify-center w-full sm:w-52 h-12 rounded-full border border-border text-sm font-semibold text-black hover:bg-surface transition-colors"
          >
            View All
          </Link>
        </div>
      </section>

      {/* 4. TOP SELLING Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight text-center mb-8 md:mb-10">
          TOP SELLING
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {topSelling.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-9 text-center">
          <Link
            href="/shop?sort=popular"
            className="inline-flex items-center justify-center w-full sm:w-52 h-12 rounded-full border border-border text-sm font-semibold text-black hover:bg-surface transition-colors"
          >
            View All
          </Link>
        </div>
      </section>

      {/* 5. BROWSE BY CATEGORY Bento Block (Matches Shop.co "BROWSE BY DRESS STYLE") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-[28px] bg-surface px-5 py-10 sm:px-10 md:px-14 md:py-14">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-center mb-8 md:mb-10">
            BROWSE BY CATEGORY
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            {HOME_CATEGORY_TILES.map((tile) => (
              <Link
                key={tile.slug}
                href={`/category/${tile.slug}`}
                className={`group relative h-52 sm:h-64 rounded-[20px] bg-white overflow-hidden p-6 flex flex-col justify-between shadow-2xs ${
                  tile.colSpan === "wide" ? "md:col-span-7" : "md:col-span-5"
                }`}
              >
                <Image
                  src={tile.image}
                  alt={tile.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/65 to-transparent" />

                <div className="relative z-10 max-w-[220px]">
                  <h3 className="font-bold text-xl sm:text-2xl text-black">
                    {tile.name}
                  </h3>
                  <p className="text-xs text-muted mt-1">{tile.description}</p>
                </div>

                <span className="relative z-10 inline-flex items-center text-xs font-bold uppercase tracking-wider text-black group-hover:underline">
                  Shop {tile.name} &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHAT STUDENTS SAY Verified Reviews Carousel */}
      <ReviewsCarousel reviews={verifiedReviews} />
    </div>
  );
}
