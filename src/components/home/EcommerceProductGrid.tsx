'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Ruler,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { OFFICIAL_CATALOG } from '@/lib/data/officialCatalog';

const CATEGORY_CAROUSEL_ITEMS = [
  {
    slug: 'curtains-drapes',
    href: '/categories/curtains',
    title: 'Window Curtains',
    subtitle: 'Sheer, blackout & motorized curtains',
    image: '/images/hero/doorstep_curtains_room.jpg',
  },
  {
    slug: 'window-blinds-shades',
    href: '/categories/blinds',
    title: 'Window Blinds',
    subtitle: 'Roller, wooden & zebra blinds',
    image: '/images/hero/nri_living_room.jpg',
  },
  {
    slug: 'sofa-fabrics-upholstery',
    href: '/categories/sofa-fabrics',
    title: 'Sofa Fabrics & Upholstery',
    subtitle: 'Velvet, linen & heavy-duty couch cloth',
    image: '/images/about/about-sofa-lounge.jpg',
  },
  {
    slug: 'wallpapers-wall-coverings',
    href: '/categories/wallpapers',
    title: 'Wallpapers & Murals',
    subtitle: 'Designer prints & 3D textured walls',
    image: '/images/hero/slide1_botanical_bg.jpg',
  },
  {
    slug: 'mattresses-sleep-systems',
    href: '/categories/mattresses-sleep-systems',
    title: 'Mattresses & Sleep',
    subtitle: 'Orthopedic & pocket spring mattresses',
    image: '/images/categories/mattress.jpg',
  },
  {
    slug: 'carpets-rugs',
    href: '/categories/carpets',
    title: 'Carpets & Living Rugs',
    subtitle: 'Hand-tufted & plush wool area rugs',
    image: '/images/hero/rugs.jpg',
  },
  {
    slug: 'wooden-flooring-sports-floor',
    href: '/categories/wooden-flooring-sports-floor',
    title: 'Wooden Flooring',
    subtitle: 'Laminate, hardwood & vinyl planks',
    image: '/images/hero/flooring.jpg',
  },
  {
    slug: 'bed-linen-bath',
    href: '/categories/bed-linen-bath',
    title: 'Bed Linen & Bath',
    subtitle: 'Pure cotton bedsheets & duvet covers',
    image: '/images/categories/bed-linen.jpg',
  },
  {
    slug: 'cushions-pillows',
    href: '/categories/cushions-pillows',
    title: 'Cushions & Pillows',
    subtitle: 'Decorative cushions & soft fillers',
    image: '/images/categories/cushions.jpg',
  },
];

interface EcommerceProductGridProps {
  products?: unknown;
}

export function EcommerceProductGrid({}: EcommerceProductGridProps) {
  const { openBookingModal } = useStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCategoryCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 360;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section id="official-catalog" className="py-16 sm:py-20 lg:py-24 bg-[#FAF8F5] border-b border-[#EDE8DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#EDE8DE] gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10.5px] uppercase tracking-[0.25em] font-bold text-[#9A7B56] block">
              Curated Collections
            </span>
            <h2 className="font-serif text-[32px] sm:text-[40px] font-medium text-[#1C1917] tracking-tight leading-tight">
              Explore Our Product Categories
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#78716C] leading-relaxed">
              Discover premium curtains, window blinds, upholstery fabrics, wallpapers, and wooden flooring. We bring 500+ fabric books directly to your home across Hyderabad.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/categories"
              className="px-5 py-2.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer bg-white text-[#1C1917] border border-[#EDE8DE] hover:bg-[#1C1714] hover:text-white hover:border-[#2C221E] shadow-2xs"
            >
              View All Categories &rarr;
            </Link>

            <button
              type="button"
              onClick={() => scrollCategoryCarousel('left')}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full bg-white border border-[#EDE8DE] flex items-center justify-center text-[#1C1917] hover:bg-[#1C1714] hover:text-white hover:border-[#2C221E] transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollCategoryCarousel('right')}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full bg-white border border-[#EDE8DE] flex items-center justify-center text-[#1C1917] hover:bg-[#1C1714] hover:text-white hover:border-[#2C221E] transition-all shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Clean Luxury Category Carousel (100% Hidden Scrollbar across all Browsers) ─── */}
        <div className="relative mb-12">
          <div
            ref={carouselRef}
            className="flex items-stretch gap-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth pb-4 pt-1"
          >
            {CATEGORY_CAROUSEL_ITEMS.map((item) => {
              const catData = OFFICIAL_CATALOG.find((c) => c.slug === item.slug);
              const count = catData?.products.length || 0;

              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="w-[290px] sm:w-[330px] md:w-[350px] shrink-0 rounded-2xl bg-white border border-[#EDE8DE] overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group select-none hover:border-[#2C221E]/40"
                >
                  {/* Clean Edge-to-Edge Luxury Photography */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 290px, 350px"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Clean Refined Content Below Photo */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                    <div>
                      <h3 className="font-serif text-[20px] font-medium text-[#1C1917] group-hover:text-[#9A7B56] transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[13px] text-[#78716C] mt-1 leading-normal font-normal">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EDE8DE] text-[11px] font-mono font-medium text-[#78716C]">
                        {count} {count === 1 ? 'Product' : 'Products'}
                      </span>

                      <span className="text-[12.5px] font-semibold text-[#2C221E] group-hover:text-[#9A7B56] transition-colors inline-flex items-center gap-1">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── Bottom Consultation Banner ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#EDE8DE] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block">
              Atelier In-Home Service
            </span>
            <h4 className="font-serif text-[20px] font-medium text-[#1C1917]">
              Want to see 500+ fabric samples directly at your home?
            </h4>
            <p className="text-[13px] text-[#78716C]">
              Our expert stylists bring curated swatches, wooden finishes, and window measuring tools to your doorstep across Hyderabad.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => openBookingModal('In-Home Catalog Consultation')}
              className="px-5 py-3 sm:py-2.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white font-semibold text-[12.5px] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs text-center"
            >
              <Ruler className="w-3.5 h-3.5 text-[#D5CDBF]" />
              <span>Book Free Home Visit</span>
            </button>
            <a
              href="tel:07947415666"
              className="px-4 py-3 sm:py-2.5 rounded-full border border-[#EDE8DE] hover:border-[#2C221E] text-[#1C1917] font-semibold text-[12.5px] transition-all inline-flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-3.5 h-3.5 text-[#9A7B56]" />
              <span>Call Showroom</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}



