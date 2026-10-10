'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DiscoveryCategory } from '@/lib/db/catalog';

export type { CategoryDiscoveryItem, DiscoveryCategory } from '@/lib/db/catalog';

interface BrowseByCategoriesProps {
  id?: string;
  className?: string;
  showExploreAllLink?: boolean;
  categories?: DiscoveryCategory[];
}

export function BrowseByCategories({
  id = 'browse-categories',
  className = '',
  showExploreAllLink = true,
  categories = [],
}: BrowseByCategoriesProps) {
  const [activeSlug, setActiveSlug] = useState(() => categories[0]?.slug || 'curtains-drapes');
  const carouselRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);
  const [currentDotIndex, setCurrentDotIndex] = useState(0);

  // Synchronize activeSlug if categories update
  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.slug === activeSlug)) {
      setActiveSlug(categories[0].slug);
    }
  }, [categories, activeSlug]);

  const activeCategory =
    categories.find((c) => c.slug === activeSlug) || categories[0];

  const isMultiItem = (activeCategory?.items?.length || 0) > 1;

  // Check cards carousel scroll bounds
  const checkCarouselScrollState = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = scrollLeft / maxScroll;
      setCurrentDotIndex(progress > 0.4 ? 1 : 0);
    } else {
      setCurrentDotIndex(0);
    }
  }, []);

  // Check category tabs scroll bounds
  const checkTabsScrollState = useCallback(() => {
    if (!tabsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setCanScrollTabsLeft(scrollLeft > 10);
    setCanScrollTabsRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkTabsScrollState();
    // Re-check tabs scroll on window resize
    const handleResize = () => {
      checkTabsScrollState();
      checkCarouselScrollState();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkTabsScrollState, checkCarouselScrollState]);

  useEffect(() => {
    // When category changes, reset carousel scroll position
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
    }
    // Update scroll state for the newly active category
    const timer = setTimeout(() => {
      checkCarouselScrollState();
    }, 50);
    setCurrentDotIndex(0);
    return () => clearTimeout(timer);
  }, [activeSlug, checkCarouselScrollState]);

  const handlePrev = () => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToDot = (dotIndex: number) => {
    if (!carouselRef.current) return;
    const { scrollWidth, clientWidth } = carouselRef.current;
    const targetLeft = dotIndex === 0 ? 0 : scrollWidth - clientWidth;
    carouselRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setCurrentDotIndex(dotIndex);
  };

  const handleTabClick = (slug: string, tabElement: HTMLButtonElement) => {
    setActiveSlug(slug);
    if (tabsRef.current && tabElement) {
      const containerRect = tabsRef.current.getBoundingClientRect();
      const tabRect = tabElement.getBoundingClientRect();
      const offset = tabRect.left - containerRect.left - 24;
      tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleScrollTabsLeft = () => {
    if (!tabsRef.current) return;
    tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const handleScrollTabsRight = () => {
    if (!tabsRef.current) return;
    tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  if (!categories || categories.length === 0 || !activeCategory) {
    return null;
  }

  return (
    <section
      id={id}
      className={`py-12 sm:py-16 lg:py-20 bg-white overflow-hidden ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── 1. HEADING & EDITORIAL "VIEW ALL CATEGORIES →" LINK ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4 pb-4 border-b border-[#F0EBE1]">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE2D5] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
              <span className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.22em] text-[#9A7B56] font-semibold">
                CURATED DISCIPLINES
              </span>
            </div>
            <h2 className="font-serif text-[26px] sm:text-[32px] lg:text-[38px] font-medium text-[#1C1917] tracking-tight">
              Browse By Categories
            </h2>
            <p className="mt-1.5 text-[13px] sm:text-[14px] text-[#78716C] font-light leading-relaxed">
              Explore 14 signature interior furnishing disciplines, from bespoke drapery to artisan rugs.
            </p>
          </div>

          {showExploreAllLink && (
            <Link
              href="/categories"
              className="text-[12.5px] sm:text-[13.5px] font-medium text-[#1C1917] hover:text-[#9A7B56] transition-colors inline-flex items-center gap-1.5 group shrink-0 pb-1 border-b border-[#1C1917]/25 hover:border-[#9A7B56] self-start sm:self-end"
            >
              <span>View All Categories</span>
              <span className="text-[#9A7B56] group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </Link>
          )}
        </div>

        {/* ─── 2. ALL 14 CATEGORIES HORIZONTAL NAVIGATION ─── */}
        <div className="relative mb-8 sm:mb-10 border-b border-[#F0EBE1] pb-2">
          {/* Subtle Left Scroll Button for Tabs on Desktop */}
          {canScrollTabsLeft && (
            <button
              type="button"
              onClick={handleScrollTabsLeft}
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-[#EDE8DE] shadow-xs items-center justify-center text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Horizontally Scrollable Categories Tab Row (Right-aligned on desktop) */}
          <div
            ref={tabsRef}
            onScroll={checkTabsScrollState}
            className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 justify-start lg:justify-end"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => {
              const isActive = cat.slug === activeSlug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => handleTabClick(cat.slug, e.currentTarget)}
                  className={`relative pb-3 text-[14px] sm:text-[15.5px] whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 font-medium ${
                    isActive
                      ? 'text-[#1C1917] font-semibold'
                      : 'text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  <span>{cat.tabLabel}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#C2410C] to-[#9A7B56] rounded-full shadow-[0_1px_4px_rgba(194,65,12,0.25)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Subtle Right Scroll Button for Tabs on Desktop */}
          {canScrollTabsRight && (
            <button
              type="button"
              onClick={handleScrollTabsRight}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-[#EDE8DE] shadow-xs items-center justify-center text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ─── 3. CARDS DISPLAY (DYNAMICALLY UPDATES WITH SELECTED CATEGORY) ─── */}
        <div className="relative group/carousel">
          
          {/* Left Arrow (<) - Enabled when multiple cards and scrolled */}
          {isMultiItem && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={!canScrollLeft}
              className={`hidden sm:flex absolute -left-3 sm:-left-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full items-center justify-center transition-all bg-white/95 backdrop-blur-md border border-[#EAE2D5] shadow-[0_8px_20px_rgba(28,25,23,0.08)] text-[#1C1917] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] hover:scale-105 cursor-pointer ${
                !canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              aria-label="Previous items"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
          )}

          {/* Right Arrow (>) - Enabled when multiple cards can scroll right */}
          {isMultiItem && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canScrollRight}
              className={`hidden sm:flex absolute -right-3 sm:-right-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full items-center justify-center transition-all bg-white/95 backdrop-blur-md border border-[#EAE2D5] shadow-[0_8px_20px_rgba(28,25,23,0.08)] text-[#1C1917] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] hover:scale-105 cursor-pointer ${
                !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              aria-label="Next items"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
          )}

          {/* Cards Track (4 cards visible on desktop, ~1.2-1.5 on mobile) */}
          <div
            ref={carouselRef}
            onScroll={checkCarouselScrollState}
            className="flex gap-4 sm:gap-6 overflow-x-auto pt-1 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeCategory.items.map((item, idx) => (
              <div
                key={item.id}
                className="snap-start shrink-0 w-[72vw] sm:w-[46vw] md:w-[31vw] lg:w-[calc(25%-18px)]"
              >
                <Link
                  href={item.href}
                  className="group flex flex-col block text-left"
                >
                  {/* Large Image with Rounded Corners & Subtle Hover Zoom */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#F4EFE6] border border-[#EAE3D6] hover:border-[#C5A880]/60 transition-all duration-500 shadow-[0_4px_16px_rgba(28,25,23,0.03)] group-hover:shadow-[0_16px_36px_rgba(28,25,23,0.08)] group-hover:-translate-y-1">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 31vw, 25vw"
                      priority={idx < 4}
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Ambient Vignette Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Subtle "Explore" prompt on hover */}
                    <div className="hidden sm:flex absolute inset-x-3 bottom-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/95 backdrop-blur-md text-[#1C1917] text-[10.5px] uppercase tracking-[0.14em] font-semibold shadow-xs">
                      <span>Explore Collection</span>
                      <span className="text-[#9A7B56]">→</span>
                    </div>
                  </div>

                  {/* Clean Typography Below Image: Only Subcategory / Product Name */}
                  <div className="pt-3.5 text-left">
                    <h3 className="font-serif font-medium text-[14.5px] sm:text-[16px] text-[#1C1917] group-hover:text-[#9A7B56] transition-colors leading-snug line-clamp-1">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* ─── 4. PAGINATION DOTS WHEN CARDS OVERFLOW ─── */}
          {isMultiItem && activeCategory.items.length > 4 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => scrollToDot(0)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentDotIndex === 0
                    ? 'w-6 bg-[#1C1917]'
                    : 'w-2 bg-[#D8CFBF] hover:bg-[#A8A29E]'
                }`}
                aria-label="First slide"
              />
              <button
                type="button"
                onClick={() => scrollToDot(1)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentDotIndex === 1
                    ? 'w-6 bg-[#1C1917]'
                    : 'w-2 bg-[#D8CFBF] hover:bg-[#A8A29E]'
                }`}
                aria-label="Second slide"
              />
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
