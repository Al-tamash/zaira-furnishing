'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

const DEPARTMENTS = [
  { name: 'Curtains & Drapes', href: '/categories/curtains' },
  { name: 'Blinds & Shades', href: '/categories/blinds' },
  { name: 'Sofa Fabrics & Upholstery', href: '/categories/sofa-fabrics' },
  { name: 'Wallpapers & Murals', href: '/categories/wallpapers' },
  { name: 'Mattresses & Sleep', href: '/categories/mattresses-sleep-systems' },
  { name: 'Carpets & Rugs', href: '/categories/carpets' },
  { name: 'Wooden Flooring', href: '/categories/wooden-flooring-sports-floor' },
  { name: 'Bed Linen & Bath', href: '/categories/bed-linen-bath' },
  { name: 'Cushions & Pillows', href: '/categories/cushions-pillows' },
];

export function StunningHomeBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FDFBF7] border-y border-[#EAE4D9]">

      {/* 100% Full-Width Edge-to-Edge Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/stunning_home_banner.jpg"
          alt="Curating What Makes Your Home Beautiful - Zaira Furnishings"
          fill
          priority
          sizes="100vw"
          className="object-cover object-left md:object-center"
        />
        {/* Soft Right-Side Ambient Light Vignette for Ultra-Crisp Typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent 25% via-[#FDFBF7]/60 50% to-[#FDFBF7]/95 hidden md:block pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-3/5 bg-gradient-to-l from-[#FDFBF7]/95 via-[#FDFBF7]/80 to-transparent hidden md:block pointer-events-none" />
        <div className="absolute inset-0 bg-[#FDFBF7]/85 md:hidden pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1550px] mx-auto px-4 sm:px-8 lg:px-12 min-h-[360px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-[680px] xl:min-h-[720px] flex items-center justify-end py-6 sm:py-16 lg:py-20">

        {/* Right-Aligned Text Column with Glassmorphic Frosted Card */}
        <div className="w-full md:w-3/5 lg:w-[54%] xl:w-[50%] ml-auto">
          <div className="bg-white/95 md:bg-white/80 lg:bg-white/75 backdrop-blur-md p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#EAE4D9] shadow-atelier space-y-3 sm:space-y-4 lg:space-y-5">

            {/* Atelier Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#FAF4E7] border border-[#E8D5A0] text-[#B38E46] text-[10px] sm:text-[11px] uppercase tracking-widest font-bold max-w-full">
              <Sparkles className="w-3 h-3 text-[#C5A059] shrink-0" />
              <span className="truncate">Bespoke Interior Craftsmanship</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-serif text-[24px] xs:text-[28px] sm:text-[40px] md:text-[44px] lg:text-[48px] xl:text-[52px] font-bold text-[#1C1714] leading-[1.15] tracking-tight break-words">
              Curating What Makes Your Home Beautiful
            </h2>

            {/* Subtitle */}
            <p className="text-[13.5px] sm:text-[17px] md:text-[18px] text-[#7C7167] leading-relaxed">
              Explore Zaira&apos;s bespoke drapery, upholstery textiles, architectural shading, and master suite essentials.
            </p>

            {/* Department Links with Golden Vertical Separators */}
            <div className="pt-2">
              <nav aria-label="Home Furnishing Departments" className="flex flex-wrap items-center gap-y-2.5 sm:gap-y-3 text-[13.5px] sm:text-[14.5px] lg:text-[15.5px] text-[#1C1714] font-semibold leading-relaxed">
                {DEPARTMENTS.map((dept, index) => (
                  <React.Fragment key={dept.name}>
                    <Link
                      href={dept.href}
                      className="hover:text-[#C5A059] hover:underline underline-offset-4 decoration-[#C5A059] transition-colors whitespace-nowrap"
                    >
                      {dept.name}
                    </Link>
                    {index < DEPARTMENTS.length - 1 && (
                      <span className="text-[#C5A059] font-bold select-none px-2 sm:px-3 text-[13px] lg:text-[15px]">
                        |
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
