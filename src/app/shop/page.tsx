import React, { Suspense } from "react";
import type { Metadata } from "next";
import { APP_NAME, CAMPUS_SHORT_NAME } from "@/config/site";
import { getCategories, getFilteredCatalog } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/product/CatalogBrowser";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "Shop All Campus Clothing",
  description: `Shop verified jerseys, round neck tees, graphic t-shirts, baggy jeans, joggers, hoodies, and caps at ${APP_NAME} with fast ${CAMPUS_SHORT_NAME} campus delivery.`,
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sortParam = String(params.sort || "popular") as
    | "popular"
    | "newest"
    | "price_asc"
    | "price_desc";
  const page = Number(params.page) || 1;
  const size = params.size ? String(params.size) : undefined;
  const color = params.color ? String(params.color) : undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const onSale = params.onSale === "true";

  const [categories, catalog] = await Promise.all([
    getCategories(),
    getFilteredCatalog({
      sort: sortParam,
      page,
      size,
      color,
      minPrice,
      maxPrice,
      onSale,
    }),
  ]);

  const title = onSale
    ? "ON SALE"
    : sortParam === "newest"
    ? "NEW ARRIVALS"
    : "ALL CAMPUS DRIP";

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8"><ProductGridSkeleton /></div>}>
      <CatalogBrowser
        title={title}
        basePath="/shop"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        categories={categories}
        products={catalog.products}
        total={catalog.total}
        page={catalog.page}
        totalPages={catalog.totalPages}
      />
    </Suspense>
  );
}
