'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TopCategory {
  id: string;
  name: string;
  href: string;
  image: string;
}

const TOP_CATEGORIES: TopCategory[] = [
  {
    id: 'bedsheet',
    name: 'Bedsheet',
    href: '/categories/bed-linen-bath',
    image: '/images/categories/bed-linen.jpg',
  },
  {
    id: 'curtain-fabric',
    name: 'Curtain Fabric',
    href: '/categories/curtains',
    image: '/images/hero/curtains.jpg',
  },
  {
    id: 'sofa-fabric',
    name: 'Sofa Fabric',
    href: '/categories/sofa-fabrics',
    image: '/images/hero/sofa_fabrics.jpg',
  },
  {
    id: 'pillows',
    name: 'Pillows',
    href: '/categories/cushions-pillows',
    image: '/images/categories/cushions.jpg',
  },
  {
    id: 'window-blinds',
    name: 'Window Blinds',
    href: '/categories/blinds',
    image: '/images/hero/blinds.jpg',
  },
  {
    id: 'wallpapers',
    name: 'Wallpapers',
    href: '/categories/wallpapers',
    image: '/images/hero/wallpapers.jpg',
  },
  {
    id: 'mattresses',
    name: 'Mattresses',
    href: '/categories/mattresses-sleep-systems',
    image: '/images/categories/mattress.jpg',
  },
  {
    id: 'carpets-rugs',
    name: 'Carpets & Rugs',
    href: '/categories/carpets',
    image: '/images/hero/rugs.jpg',
  },
];

export function CategoryIconGrid() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-[#EAE4D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Clean Centered Title with Underline ─── */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[#C5A059] font-bold block mb-1.5">
            Curated Collections
          </span>
          <h2 className="font-serif text-[24px] sm:text-[34px] lg:text-[40px] font-bold text-[#823423] tracking-tight leading-tight">
            Top Categories Of This Month
          </h2>
          <div className="w-20 sm:w-36 h-0.5 bg-[#823423] mx-auto mt-2.5 rounded-full" />
        </div>

        {/* ─── 4-Column Split Cards Grid (2-Cols Mobile, 4-Cols Desktop) ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {TOP_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex flex-col justify-between p-3 sm:p-5 lg:p-6 bg-gradient-to-b from-white to-[#FDFBF7] border border-[#EAE4D9] hover:border-[#823423]/70 transition-all duration-300 shadow-[0_2px_8px_rgba(28,23,20,0.04)] hover:shadow-lg rounded-2xl h-full relative overflow-hidden"
            >
              {/* Category Name & Subtle Touch Cue */}
              <div className="w-full flex items-center justify-between mb-2.5 sm:mb-3">
                <h3 className="font-serif text-[14px] sm:text-[18px] lg:text-[20px] font-bold text-[#2C221E] group-hover:text-[#823423] transition-colors leading-snug line-clamp-1">
                  {cat.name}
                </h3>
                {/* Gold Touch Arrow Indicator */}
                <span className="w-5 h-5 rounded-full bg-[#FAF5EC] group-hover:bg-[#823423] text-[#823423] group-hover:text-white flex items-center justify-center text-[10px] font-bold transition-all shrink-0 ml-1">
                  →
                </span>
              </div>

              {/* Rectangular Product Image Container */}
              <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] overflow-hidden rounded-xl bg-[#F4EFE6] border border-[#EAE4D9]/80 shadow-2xs">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
                  className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
