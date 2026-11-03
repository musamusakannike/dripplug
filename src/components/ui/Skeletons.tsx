import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      <div className="aspect-square w-full rounded-[20px] bg-surface" />
      <div className="h-4 w-3/4 rounded-full bg-surface mt-1" />
      <div className="h-3.5 w-1/3 rounded-full bg-surface" />
      <div className="h-5 w-1/2 rounded-full bg-surface" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 w-48 bg-surface rounded-full mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex gap-4">
          <div className="hidden sm:flex flex-col gap-3 w-24">
            <div className="aspect-square rounded-[16px] bg-surface" />
            <div className="aspect-square rounded-[16px] bg-surface" />
            <div className="aspect-square rounded-[16px] bg-surface" />
          </div>
          <div className="flex-1 aspect-square rounded-[20px] bg-surface" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-4/5 bg-surface rounded-2xl" />
          <div className="h-5 w-32 bg-surface rounded-full" />
          <div className="h-8 w-44 bg-surface rounded-full" />
          <div className="h-16 w-full bg-surface rounded-2xl" />
          <div className="h-12 w-full bg-surface rounded-full" />
        </div>
      </div>
    </div>
  );
}
