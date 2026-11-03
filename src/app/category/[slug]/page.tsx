import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { APP_NAME, APP_URL, CAMPUS_SHORT_NAME } from "@/config/site";
import { getCategories, getFilteredCatalog } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/product/CatalogBrowser";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug.toLowerCase());
  if (!cat) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${cat.name} for ${CAMPUS_SHORT_NAME} Students`,
    description:
      cat.description ||
      `Buy ${cat.name} online at ${APP_NAME} with fast delivery to UNILORIN Old Park, New Park, and Hostels.`,
    alternates: {
      canonical: `/category/${cat.slug}`,
    },
    openGraph: {
      title: `${cat.name} | ${APP_NAME}`,
      description:
        cat.description ||
        `Shop ${cat.name} with campus delivery at ${APP_NAME}.`,
      url: `${APP_URL}/category/${cat.slug}`,
      images: [{ url: cat.image }],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const categories = await getCategories();
  const currentCategory = categories.find((c) => c.slug === slug.toLowerCase());
  if (!currentCategory) {
    notFound();
  }

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

  const catalog = await getFilteredCatalog({
    category: currentCategory.slug,
    sort: sortParam,
    page,
    size,
    color,
    minPrice,
    maxPrice,
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: APP_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${APP_URL}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: currentCategory.name,
        item: `${APP_URL}/category/${currentCategory.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="max-w-7xl mx-auto p-8"><ProductGridSkeleton /></div>}>
        <CatalogBrowser
          title={currentCategory.name}
          basePath={`/category/${currentCategory.slug}`}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: currentCategory.name },
          ]}
          categories={categories}
          products={catalog.products}
          total={catalog.total}
          page={catalog.page}
          totalPages={catalog.totalPages}
          activeCategorySlug={currentCategory.slug}
        />
      </Suspense>
    </>
  );
}
