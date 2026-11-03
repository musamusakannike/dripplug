import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">
        404 — Page Not Found
      </p>
      <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight mt-3">
        THIS FIT SOLD OUT OR MOVED
      </h1>
      <p className="text-sm text-muted mt-3 max-w-md mx-auto">
        We couldn&apos;t find the page you were looking for. Head back to the campus
        store to browse fresh jerseys, tees, and baggy denim.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="h-12 px-6 rounded-full border border-border font-semibold text-sm inline-flex items-center gap-2 hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="h-12 px-6 rounded-full bg-black text-white font-semibold text-sm inline-flex items-center gap-2 hover:bg-black/90 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
