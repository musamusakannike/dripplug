"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSlide, HERO_SLIDES } from "@/config/site";

interface HeroCarouselProps {
  slides?: readonly HeroSlide[];
  className?: string;
}

export function HeroCarousel({
  slides = HERO_SLIDES,
  className = "",
}: HeroCarouselProps) {
  const slideCount = slides.length;

  // Extended slides with cloned edges for seamless infinite looping
  // [last slide, slide 0, slide 1, ..., slide N-1, slide 0]
  const extendedSlides = [slides[slideCount - 1], ...slides, slides[0]];

  // Start at index 1 (the first real slide)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeDotIndex =
    slideCount > 0 ? (currentIndex - 1 + slideCount) % slideCount : 0;

  const handleNext = useCallback(() => {
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  const handleDotClick = (targetIndex: number) => {
    setWithTransition(true);
    setCurrentIndex(targetIndex + 1);
  };

  // Seamless jump when reaching either cloned edge
  const handleTransitionEnd = () => {
    if (currentIndex >= extendedSlides.length - 1) {
      // Reached cloned first slide at the end -> jump instantly to real first slide (index 1)
      setWithTransition(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      // Reached cloned last slide at the start -> jump instantly to real last slide (index slideCount)
      setWithTransition(false);
      setCurrentIndex(slideCount);
    }
  };

  // Re-enable transitions on next tick if disabled during snap
  useEffect(() => {
    if (!withTransition) {
      const raf = requestAnimationFrame(() => {
        setWithTransition(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [withTransition]);

  // Autoplay infinite scrolling
  useEffect(() => {
    if (isPaused || slideCount <= 1) return;

    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, 4500);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPaused, slideCount, handleNext]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;

    const swipeThreshold = 40;
    if (touchDeltaXRef.current < -swipeThreshold) {
      handleNext();
    } else if (touchDeltaXRef.current > swipeThreshold) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div
      className={`animate-rise relative mx-auto w-full max-w-md motion-reduce:animate-none lg:col-span-5 lg:max-w-none ${className}`}
      style={{ animationDelay: "200ms" }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Campus fashion hero carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Offset black depth background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-[36px] bg-black sm:translate-x-4 sm:translate-y-4"
      />

      {/* Main carousel frame */}
      <div
        className="relative h-[400px] w-full overflow-hidden rounded-[36px] bg-white sm:h-[480px] lg:h-[540px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track containing extended slides */}
        <div
          className="flex h-full w-full"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: withTransition
              ? "transform 550ms cubic-bezier(0.16, 1, 0.3, 1)"
              : "none",
          }}
        >
          {extendedSlides.map((slide, index) => {
            const isPriority = index === 1; // Slide 0 (index 1) is shown first
            return (
              <div
                key={`${slide.image}-${index}`}
                className="relative h-full w-full shrink-0 basis-full select-none"
              >
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={isPriority}
                  fetchPriority={isPriority ? "high" : "auto"}
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover object-top"
                  draggable={false}
                />

                {/* Bottom subtle gradient */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Optional category tag */}
                {slide.tag && (
                  <div className="absolute left-5 top-5 z-10">
                    <span className="inline-flex items-center rounded-full bg-black/75 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-sm">
                      {slide.tag}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous hero image"
          className="group absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-black shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-black hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-black sm:left-4 sm:h-11 sm:w-11"
        >
          <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next hero image"
          className="group absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-black shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-black hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-black sm:right-4 sm:h-11 sm:w-11"
        >
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Carousel indicator dots */}
        <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-1.5 sm:bottom-5">
          {slides.map((_, dotIdx) => {
            const isActive = dotIdx === activeDotIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => handleDotClick(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-7 bg-white shadow-sm"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
