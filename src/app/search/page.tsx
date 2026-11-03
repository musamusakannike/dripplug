import React, { Suspense } from "react";
import type { Metadata } from "next";
import { APP_NAME } from "@/config/site";
import { getCategories, getFilteredCatalog } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/product/CatalogBrowser";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "Search Products",
  description: `Search campus clothing at ${APP_NAME}.`,
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q ? String(sp.q).trim() : "";
  const sortParam = String(sp.sort || "popular") as
    | "popular"
    | "newest"
    | "price_asc"
    | "price_desc";
  const page = Number(sp.page) || 1;
  const size = sp.size ? String(sp.size) : undefined;
  const color = sp.color ? String(sp.color) : undefined;
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  const [categories, catalog] = await Promise.all([
    getCategories(),
    getFilteredCatalog({
      q,
      sort: sortParam,
      page,
      size,
      color,
      minPrice,
      maxPrice,
    }),
  ]);

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8"><ProductGridSkeleton /></div>}>
      <CatalogBrowser
        title={q ? `RESULTS FOR "${q.toUpperCase()}"` : "SEARCH ALL PRODUCTS"}
        basePath="/search"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: q ? `Search: ${q}` : "Search" },
        ]}
        categories={categories}
        products={catalog.products}
        total={catalog.total}
        page={catalog.page}
        totalPages={catalog.totalPages}
      />
    </Suspense>
  );
}
