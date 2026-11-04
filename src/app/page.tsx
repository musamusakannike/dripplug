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
import { Marquee } from "@/components/ui/Marquee";

export const revalidate = 60;

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
      <h2 className="font-heading text-3xl uppercase leading-none tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <Link
        href={href}
        className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        View all
        <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const { newArrivals, topSelling, totalProductsInStock, verifiedReviews } =
    await getHomePageData();

  return (
    <div>
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:pb-20">
          {/* Copy */}
          <div className="lg:col-span-7 lg:pr-6">
            <h1
              className="animate-rise mt-5 font-heading text-[2.75rem] uppercase leading-[0.98] tracking-tight text-black motion-reduce:animate-none sm:text-6xl lg:text-[76px]"
              style={{ animationDelay: "90ms" }}
            >
              {HERO_CONFIG.headline}
            </h1>

            <p
              className="animate-rise mt-5 max-w-lg text-base leading-relaxed text-muted motion-reduce:animate-none sm:text-lg"
              style={{ animationDelay: "180ms" }}
            >
              {HERO_CONFIG.subtext}
            </p>

            <div
              className="animate-rise mt-8 flex flex-col gap-3 motion-reduce:animate-none sm:flex-row sm:items-center"
              style={{ animationDelay: "270ms" }}
            >
              <Link
                href={HERO_CONFIG.ctaHref}
                className="group inline-flex h-14 min-w-[220px] items-center justify-center gap-2 rounded-full bg-black px-10 text-sm font-semibold text-white transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {HERO_CONFIG.ctaText}
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#categories"
                className="inline-flex h-14 items-center justify-center rounded-full px-6 text-sm font-semibold text-black underline-offset-4 hover:underline"
              >
                Browse categories
              </Link>
            </div>
          </div>

          {/* Image composition */}
          <div
            className="animate-rise relative mx-auto w-full max-w-md motion-reduce:animate-none lg:col-span-5 lg:max-w-none"
            style={{ animationDelay: "200ms" }}
          >
            {/* offset block for depth */}
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-[36px] bg-black sm:translate-x-4 sm:translate-y-4"
            />
            <div className="relative h-[400px] w-full overflow-hidden rounded-[36px] bg-white sm:h-[480px] lg:h-[540px]">
              <Image
                src={HERO_CONFIG.image}
                alt={HERO_CONFIG.imageAlt}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
            </div>

            {/* Floating facts (real, configurable values only) */}
            <div className="absolute -left-2 bottom-8 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:-left-6">
              <p className="font-heading text-2xl leading-none text-black">
                {HERO_CONFIG.typicalDeliveryStat}
              </p>
              <p className="mt-1 text-xs text-muted">
                {HERO_CONFIG.typicalDeliveryLabel}
              </p>
            </div>
            <div className="absolute -right-1 top-8 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:-right-5">
              <p className="font-heading text-2xl leading-none text-black">
                {DELIVERY_POINTS.length}
              </p>
              <p className="mt-1 text-xs text-muted">Campus drop-off points</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <div className="bg-black py-5 text-white">
        <Marquee items={TRUST_STRIP_ITEMS} duration={32} />
      </div>

      {/* 3. NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl border-b border-border px-4 pb-14 pt-16 sm:px-6 lg:px-8">
        <SectionHeader title="New arrivals" href="/shop?sort=newest" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. TOP SELLING */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader title="Top selling" href="/shop?sort=popular" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {topSelling.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BROWSE BY CATEGORY */}
      <section
        id="categories"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-[32px] bg-surface px-5 py-10 sm:px-10 md:px-14 md:py-14">
          <h2 className="mb-8 font-heading text-3xl uppercase leading-none tracking-tight md:mb-10 md:text-5xl">
            Browse by category
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-12">
            {HOME_CATEGORY_TILES.map((tile) => (
              <Link
                key={tile.slug}
                href={`/category/${tile.slug}`}
                className={`group relative flex h-56 flex-col justify-between overflow-hidden rounded-[24px] bg-white p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:h-72 ${
                  tile.colSpan === "wide" ? "md:col-span-7" : "md:col-span-5"
                }`}
              >
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent" />

                <div className="relative z-10 max-w-[240px]">
                  <h3 className="text-2xl font-bold text-black sm:text-3xl">
                    {tile.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">{tile.description}</p>
                </div>

                <span className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:translate-x-1">
                  <ArrowIcon className="h-5 w-5" />
                  <span className="sr-only">Shop {tile.name}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REVIEWS */}
      <ReviewsCarousel reviews={verifiedReviews} />
    </div>
  );
}