"use client";

import React from "react";
import Link from "next/link";
import { RefreshCcw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-danger">
        Unexpected Error
      </p>
      <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mt-2">
        SOMETHING WENT WRONG
      </h1>
      <p className="text-sm text-muted mt-3 max-w-md mx-auto">
        {error.message || "We hit a temporary snag loading this page. Your cart is safe."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-12 px-6 rounded-full bg-black text-white font-semibold text-sm inline-flex items-center gap-2 hover:bg-black/90 transition-colors cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="h-12 px-6 rounded-full border border-border font-semibold text-sm inline-flex items-center gap-2 hover:bg-surface transition-colors"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
