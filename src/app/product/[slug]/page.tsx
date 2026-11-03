import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { APP_NAME, APP_URL, CURRENCY } from "@/config/site";
import { getProductBySlug } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      url: `${APP_URL}/product/${product.slug}`,
      images: product.images.map((url) => ({ url, alt: product.name })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${APP_NAME}`,
      description,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { product, related, reviews } = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.variants[0]?.sku || product.slug,
    brand: {
      "@type": "Brand",
      name: APP_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${APP_URL}/product/${product.slug}`,
      priceCurrency: CURRENCY,
      price: product.basePrice,
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  if (product.ratingCount > 0 && product.ratingAverage > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingAverage,
      reviewCount: product.ratingCount,
    };
  }

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
        name: product.categorySlug,
        item: `${APP_URL}/category/${product.categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${APP_URL}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient
        product={product}
        related={related}
        initialReviews={reviews}
      />
    </>
  );
}
