"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { SerializedReview } from "@/types";
import { StarRating } from "@/components/product/ProductCard";

export function ReviewsCarousel({ reviews }: { reviews: SerializedReview[] }) {
  const [startIndex, setStartIndex] = useState(0);

  // Per Section 3 requirement: hide the section if there are fewer than 3 reviews
  if (!reviews || reviews.length < 3) {
    return null;
  }

  function handlePrev() {
    setStartIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  }

  function handleNext() {
    setStartIndex((prev) => (prev + 1) % reviews.length);
  }

  const visibleReviews = [
    reviews[startIndex % reviews.length],
    reviews[(startIndex + 1) % reviews.length],
    reviews[(startIndex + 2) % reviews.length],
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-end justify-between gap-4 mb-8">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight">
          WHAT STUDENTS SAY
        </h2>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous student review"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next student review"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {visibleReviews.map((rev, idx) => (
          <article
            key={`${rev._id}_${idx}`}
            className="rounded-[20px] border border-border bg-white p-6 flex flex-col justify-between"
          >
            <div>
              <StarRating rating={rev.rating} showFraction={false} />
              <div className="flex items-center gap-1.5 mt-3">
                <h3 className="font-bold text-base text-black">{rev.userName}</h3>
                <CheckCircle2
                  aria-label="Verified UNILORIN buyer"
                  className="w-4 h-4 fill-success text-white shrink-0"
                />
              </div>
              <p className="text-xs sm:text-sm text-muted mt-2.5 leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
