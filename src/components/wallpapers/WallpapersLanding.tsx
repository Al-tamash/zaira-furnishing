'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { DbSubcategory } from '@/lib/db/types';

interface WallpapersLandingProps {
  subcategories: DbSubcategory[];
}

export function WallpapersLanding({ subcategories }: WallpapersLandingProps) {
  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1C1917] selection:bg-[#9A7B56] selection:text-white">
      {/* ─── 1. BREADCRUMB ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-[12px] text-[#78716C]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <Link href="/categories" className="hover:text-[#1C1917] transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1C1917] font-medium">Wallpapers & Wall Coverings</span>
        </nav>
      </div>

      {/* ─── 2. CATEGORY HEADER ─── */}
      <section className="pt-6 sm:pt-10 pb-8 sm:pb-12 text-center max-w-3xl mx-auto px-4 sm:px-6">
        <span className="text-[11.5px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold block mb-2">
          Wall Coverings
        </span>
        <h1 className="font-serif text-[32px] sm:text-[42px] text-[#1C1917] font-medium tracking-tight mb-3">
          Luxury Wallpapers
        </h1>
        <p className="text-[13px] uppercase tracking-widest font-semibold text-[#8C827A] mb-2">
          Shop by Type
        </p>
        <p className="text-[14px] sm:text-[15px] text-[#78716C] leading-relaxed max-w-xl mx-auto">
          Choose a wallpaper style below to explore hand-woven grasscloth, scenic murals, natural raw silk, and metallic foil accents.
        </p>
      </section>

      {/* ─── 3. SUBCATEGORY IMAGE CARDS ─── */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
            {subcategories.map((type) => (
              <Link
                key={type.id}
                href={`/categories/wallpapers/${type.slug}`}
                className="group flex flex-col bg-white rounded-xl border border-[#EAE4D8] hover:border-[#1C1917] transition-all duration-300 overflow-hidden text-left shadow-2xs hover:shadow-md hover:-translate-y-1 block"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F2EDE2]">
                  <Image
                    src={type.image || '/images/hero/wallpapers.jpg'}
                    alt={type.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                <div className="p-3.5 sm:p-4 bg-white border-t border-[#F2ECE1]">
                  <h2 className="font-serif text-[14.5px] sm:text-[15.5px] font-medium leading-snug line-clamp-1 text-[#1C1917] group-hover:text-[#9A7B56] transition-colors mb-1">
                    {type.name}
                  </h2>
                  <div className="flex items-center justify-between text-[11.5px] text-[#8C827A] group-hover:text-[#1C1917] transition-colors font-medium">
                    <span>Shop Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. BESPOKE SERVICE BANNER ─── */}
      <section className="border-t border-[#EAE4D8] bg-[#F7F4EE] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE4D8] text-[11px] uppercase tracking-wider text-[#9A7B56] font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scale-Calibrated Murals</span>
          </div>
          <h2 className="font-serif text-[24px] sm:text-[30px] text-[#1C1917] font-medium mb-3">
            Custom Wall Dimensions & Professional Hanging
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#78716C] max-w-xl mx-auto leading-relaxed mb-6">
            We crop and calibrate scenic murals to match your exact room architecture, with seamless joins and expert installation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/917947415666?text=Hello%20Zaira%20Furnishing%2C%20I%20would%20like%20to%20consult%20about%20wallpapers%20and%20wall%20murals."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1917] hover:bg-[#9A7B56] text-white text-[12px] uppercase tracking-wider font-semibold transition-all duration-200 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consult on WhatsApp</span>
            </a>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#D8CFBF] text-[12px] uppercase tracking-wider font-semibold transition-all duration-200"
            >
              <span>Our Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
