'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/lib/data/types';
import { FeaturedProductCard } from './FeaturedProductCard';

interface FeaturedCollectionProps {
  products?: Product[];
  title?: string;
  subtitle?: string;
}

export function FeaturedCollection({
  products = [],
  title = 'Featured Furnishings',
  subtitle = 'Explore selected furnishings from Zaira.',
}: FeaturedCollectionProps) {
  const [activeDot, setActiveDot] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const featuredProducts = products;

  const checkScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const index = Math.round((scrollLeft / maxScroll) * (featuredProducts.length - 1));
      setActiveDot(Math.min(Math.max(index, 0), featuredProducts.length - 1));
    } else {
      setActiveDot(0);
    }
  }, [featuredProducts.length]);

  useEffect(() => {
    checkScrollState();
    const handleResize = () => checkScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollState]);

  const handlePrev = () => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: -amount, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const scrollToDot = (index: number) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const targetLeft = (index / (featuredProducts.length - 1)) * maxScroll;
    scrollRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setActiveDot(index);
  };

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF7F2] border-t border-[#EAE4D8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── 1. Header with Title & Navigation Controls ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E6] border border-[#D4AF37]/40 text-[#823423] text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Trending In Hyderabad</span>
            </div>
            <h2 className="font-serif text-[24px] sm:text-[36px] lg:text-[40px] text-[#1C1917] font-medium tracking-tight mb-1.5 leading-[1.18]">
              {title}
            </h2>
            <p className="text-[13px] sm:text-[14.5px] text-[#78716C] leading-relaxed max-w-lg">
              {subtitle}
            </p>
            {/* Mobile-Only Explore All Link */}
            <Link
              href="/categories"
              className="sm:hidden inline-flex items-center gap-1.5 text-[11.5px] font-bold tracking-wider uppercase text-[#823423] hover:text-[#1C1917] transition-colors mt-2.5"
            >
              <span>Explore All Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <Link
              href="/categories"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wider uppercase text-[#1C1917] hover:text-[#9A7B56] transition-colors"
            >
              <span>Explore Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canScrollLeft}
                aria-label="Previous products"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all bg-white border border-[#EAE2D5] shadow-xs cursor-pointer ${
                  canScrollLeft
                    ? 'text-[#1C1917] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917]'
                    : 'text-[#A8A29E] opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canScrollRight}
                aria-label="Next products"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all bg-white border border-[#EAE2D5] shadow-xs cursor-pointer ${
                  canScrollRight
                    ? 'text-[#1C1917] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917]'
                    : 'text-[#A8A29E] opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── 2. Product Cards Carousel Track ─── */}
        <div
          ref={scrollRef}
          onScroll={checkScrollState}
          className="flex gap-4 sm:gap-6 overflow-x-auto pt-1 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredProducts.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* ─── 3. Subtle Pagination Dots ─── */}
        {featuredProducts.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 sm:mt-10">
            {featuredProducts.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToDot(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeDot === idx ? 'w-6 bg-[#1C1917]' : 'w-1.5 bg-[#D8CFBF] hover:bg-[#A8A29E]'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
