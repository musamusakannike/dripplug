import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HERO_CONFIG,
  HOME_CATEGORY_TILES,
  TRUST_STRIP_ITEMS,
} from "@/config/site";
import { getHomePageData } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewsCarousel } from "@/components/product/ReviewsCarousel";
import { Marquee } from "@/components/ui/Marquee";
import { HeroCarousel } from "@/components/home/HeroCarousel";

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

          {/* Hero image carousel */}
          <HeroCarousel slides={HERO_CONFIG.slides} />
        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <div className="bg-black py-5 text-white">
        <Marquee items={TRUST_STRIP_ITEMS} duration={80} />
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

          {/* Bento Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
            {/* 1. Tall Hero Tile (Jerseys) */}
            {HOME_CATEGORY_TILES[0] && (
              <Link
                key={HOME_CATEGORY_TILES[0].slug}
                href={`/category/${HOME_CATEGORY_TILES[0].slug}`}
                className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[24px] bg-[#eeecea] p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:min-h-[480px] lg:col-span-5 lg:min-h-full"
              >
                <Image
                  src={HOME_CATEGORY_TILES[0].image}
                  alt={HOME_CATEGORY_TILES[0].name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />

                <div className="sr-only">
                  <h3>{HOME_CATEGORY_TILES[0].name}</h3>
                  <p>{HOME_CATEGORY_TILES[0].description}</p>
                </div>

                <span className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-sm transition-transform group-hover:translate-x-1">
                  <ArrowIcon className="h-5 w-5" />
                  <span className="sr-only">Shop {HOME_CATEGORY_TILES[0].name}</span>
                </span>
              </Link>
            )}

            {/* Right Column Stack */}
            <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-7">
              {/* 2. Wide Banner Tile (Baggy Jeans) */}
              {HOME_CATEGORY_TILES[1] && (
                <Link
                  key={HOME_CATEGORY_TILES[1].slug}
                  href={`/category/${HOME_CATEGORY_TILES[1].slug}`}
                  className="group relative flex h-60 flex-col justify-end overflow-hidden rounded-[24px] bg-[#eeecea] p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:h-72"
                >
                  <Image
                    src={HOME_CATEGORY_TILES[1].image}
                    alt={HOME_CATEGORY_TILES[1].name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                  />

                  <div className="sr-only">
                    <h3>{HOME_CATEGORY_TILES[1].name}</h3>
                    <p>{HOME_CATEGORY_TILES[1].description}</p>
                  </div>

                  <span className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-sm transition-transform group-hover:translate-x-1">
                    <ArrowIcon className="h-5 w-5" />
                    <span className="sr-only">Shop {HOME_CATEGORY_TILES[1].name}</span>
                  </span>
                </Link>
              )}

              {/* 3 & 4. Detail Tiles (Round Necks & Tees, Joggers - with on-card text) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                {HOME_CATEGORY_TILES.slice(2).map((tile) => (
                  <Link
                    key={tile.slug}
                    href={`/category/${tile.slug}`}
                    className="group relative flex h-64 flex-col justify-between overflow-hidden rounded-[24px] bg-[#eeecea] p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:h-72"
                  >
                    <Image
                      src={tile.image}
                      alt={tile.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 30vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                    />

                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-black sm:text-2xl">
                        {tile.name}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
                        {tile.description}
                      </p>
                    </div>

                    <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-sm transition-transform group-hover:translate-x-1">
                      <ArrowIcon className="h-4 w-4" />
                      <span className="sr-only">Shop {tile.name}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REVIEWS */}
      <ReviewsCarousel reviews={verifiedReviews} />
    </div>
  );
}