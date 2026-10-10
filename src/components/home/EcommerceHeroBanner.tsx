'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Plane,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_DISPLAY } from '@/lib/whatsapp';

export function EcommerceHeroBanner() {
  const { openBookingModal } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto slide rotation every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-[#1C1714] select-none"
    >
      <div className="relative w-full max-w-[1600px] mx-auto min-h-[540px] sm:min-h-[600px] md:min-h-[660px] lg:min-h-[700px] xl:min-h-[750px] flex items-center shadow-inner">

        {/* ════════════════════════════════════════════════════════════════════════════
            SLIDE 2: BESPOKE LUXURY LIVING & ZAIRA ATELIER COLLECTIONS
        ════════════════════════════════════════════════════════════════════════════ */}
        {currentSlide === 1 && (
          <div className="relative w-full h-full min-h-[540px] sm:min-h-[600px] md:min-h-[660px] lg:min-h-[700px] xl:min-h-[750px] flex flex-col justify-end sm:justify-between py-6 sm:py-12 lg:py-16 px-3 sm:px-8 overflow-hidden animate-in fade-in duration-500">

            {/* High-Resolution Luxury Champagne & Gold Leaf Botanical Background */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero/slide1_botanical_bg.jpg"
                alt="Zaira Furnishing Atelier Hyderabad"
                fill
                priority
                className="object-cover object-center brightness-[0.92]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714] via-[#1C1714]/50 to-transparent sm:bg-gradient-to-r sm:from-[#1C1714]/85 sm:via-[#1C1714]/60 sm:to-[#1C1714]/75 backdrop-blur-[0.5px]" />
            </div>

            {/* Desktop Layout (hidden on mobile, rich centerpiece on desktop) */}
            <div className="hidden sm:flex max-w-7xl mx-auto w-full flex-1 flex-col items-center justify-center relative z-10">

              {/* Top Location Headline: Zaira Design Atelier */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#C5A059]/40 text-[#EAE4D9] text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Flagship Design Atelier &bull; Hyderabad</span>
                </div>
                <h1 className="text-[28px] sm:text-[42px] lg:text-[54px] font-serif font-normal text-[#FDFBF7] tracking-tight leading-[1.08]">
                  Experience Bespoke Luxury Living
                </h1>
                <p className="text-[12px] sm:text-[14px] font-medium text-[#C5A059] tracking-[0.22em] uppercase mt-1">
                  Custom Curtains &bull; Motorized Blinds &bull; Italian Fabrics &bull; Nilaya Wallcoverings
                </p>
              </div>

              {/* Main Content Row: Luxury Emblem + Department Ribbon */}
              <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 my-1 sm:my-2">

                {/* Left: Luxury Arched Atelier Centerpiece */}
                <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                  <div className="relative p-6 sm:p-8 rounded-3xl sm:rounded-[48px] border-2 border-[#C5A059]/80 bg-[#1C1714]/90 backdrop-blur-md shadow-2xl max-w-[310px] sm:max-w-[370px] w-full flex flex-col items-center text-center ring-4 ring-[#C5A059]/20">

                    {/* Arched Top Badge */}
                    <div className="px-3.5 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/50 text-[#C5A059] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-xs">
                      Flagship Design Atelier
                    </div>

                    {/* Iconic Gold Logo Plaque */}
                    <div className="w-full bg-gradient-to-r from-[#B38E46] via-[#C5A059] to-[#D4AF37] rounded-xl py-2.5 sm:py-3 px-4 mb-2 flex items-center justify-center gap-3 shadow-md border border-[#C5A059]">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 text-[#1C1714] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
                          <path d="M14 2 L24 9 L14 16 L4 9 Z" fill="#1C1714" />
                          <path d="M4 9 L14 16 L14 26 L4 19 Z" fill="#2C221E" />
                          <path d="M24 9 L14 16 L14 26 L24 19 Z" fill="#3E3029" />
                        </svg>
                      </div>
                      <div className="text-left leading-none">
                        <span className="font-serif font-black text-[16px] sm:text-[20px] text-[#1C1714] tracking-wider uppercase leading-none block">
                          ZAIRA
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.24em] text-[#1C1714]/80 leading-none block mt-0.5">
                          FURNISHINGS
                        </span>
                      </div>
                    </div>

                    <span className="text-[8px] sm:text-[9.5px] uppercase tracking-[0.26em] text-[#C5A059] font-bold mb-1 leading-none">
                      CURATING REFINED SPACES
                    </span>

                    <span className="text-[11.5px] sm:text-[12px] font-semibold text-white/90 leading-tight">
                      Financial District &amp; Puppalguda
                    </span>
                    <span className="text-[12px] sm:text-[13px] font-serif text-[#C5A059] leading-tight mt-0.5 font-medium">
                      Hyderabad Flagship Atelier
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] text-[#A8A29E] font-medium mt-0.5">
                      Near Wipro Circle &bull; Outer Ring Road
                    </span>

                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C5A059] to-transparent my-2 sm:my-3" />

                    <p className="text-[11.5px] sm:text-[13px] text-[#EAE4D9]/80 font-serif italic leading-relaxed">
                      Bespoke Window Styling, Designer Fabrics &amp; Fine Living Textiles
                    </p>
                  </div>
                </div>

                {/* Right: Signature Atelier Department Ribbon */}
                <div className="flex w-full max-w-2xl flex-col justify-center space-y-3 sm:space-y-4">
                  <div className="relative rounded-3xl bg-[#1C1714]/80 backdrop-blur-md text-white py-6 px-6 sm:px-8 shadow-2xl overflow-hidden border border-[#C5A059]/40">
                    <p className="text-[13px] sm:text-[14px] text-[#C5A059] font-serif italic mb-3 relative z-10 text-center sm:text-left">
                      Explore Zaira&apos;s Signature Living Collections...
                    </p>

                    <div className="relative z-10 space-y-2.5 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-[12px] sm:text-[13.5px] font-semibold tracking-wider uppercase text-white/90">
                        <Link href="/categories/curtains" className="hover:text-[#C5A059] transition-colors">CURTAINS</Link>
                        <span className="text-[#C5A059]/60 font-light">&bull;</span>
                        <Link href="/categories/blinds" className="hover:text-[#C5A059] transition-colors">BLINDS</Link>
                        <span className="text-[#C5A059]/60 font-light">&bull;</span>
                        <Link href="/categories/sofa-fabrics" className="hover:text-[#C5A059] transition-colors">SOFA FABRICS</Link>
                        <span className="text-[#C5A059]/60 font-light">&bull;</span>
                        <Link href="/categories/wallpapers" className="hover:text-[#C5A059] transition-colors">WALLPAPERS</Link>
                      </div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-[12px] sm:text-[13.5px] font-semibold tracking-wider uppercase text-white/90">
                        <Link href="/categories/mattresses-sleep-systems" className="hover:text-[#C5A059] transition-colors">MATTRESSES</Link>
                        <span className="text-[#C5A059]/60 font-light">&bull;</span>
                        <Link href="/categories/wooden-flooring-sports-floor" className="hover:text-[#C5A059] transition-colors">HARDWOOD FLOORING</Link>
                        <span className="text-[#C5A059]/60 font-light">&bull;</span>
                        <Link href="/categories/carpets" className="hover:text-[#C5A059] transition-colors">CARPETS &amp; RUGS</Link>
                      </div>
                    </div>
                  </div>

                  {/* Tagline & CTAs */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <span className="font-serif italic text-[18px] sm:text-[21px] text-[#FDFBF7] font-normal text-center sm:text-left">
                      Crafting Hyderabad&apos;s Most Refined Homes ✨
                    </span>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/categories"
                        className="px-6 py-3 rounded-full bg-[#C5A059] hover:bg-[#B38E46] text-[#1C1714] font-bold text-[12px] uppercase tracking-wider shadow-lg transition-all cursor-pointer hover:scale-105"
                      >
                        Explore Catalog
                      </Link>
                      <button
                        type="button"
                        onClick={() => openBookingModal('Showroom Visit')}
                        className="px-6 py-3 rounded-full border border-[#C5A059] text-[#FDFBF7] hover:bg-[#C5A059] hover:text-[#1C1714] font-semibold text-[12px] uppercase tracking-wider transition-all cursor-pointer bg-white/5 backdrop-blur-sm"
                      >
                        Visit Atelier
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Mobile Editorial Floating Overlay (Clean, Cinematic, No cramped ring box) */}
            <div className="sm:hidden relative z-10 w-full px-4 pt-6 pb-14 flex flex-col justify-end">
              {/* Minimal Luxury Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1714]/80 backdrop-blur-md border border-[#D4AF37]/50 text-[#F5E6CC] text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5 w-fit shadow-md">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Flagship Design Atelier &bull; Hyderabad</span>
              </div>

              {/* Title & Subtitle floating over botanical background */}
              <p className="font-serif italic text-[15px] text-[#D4AF37] font-normal leading-tight mb-1 drop-shadow-sm">
                Curating Refined Spaces
              </p>
              <h1 className="text-[26px] font-serif font-normal text-white leading-[1.12] tracking-tight mb-1.5 drop-shadow-md">
                Experience Bespoke Luxury
              </h1>
              <p className="text-[12px] text-[#EAE4D9]/90 font-light leading-snug mb-3.5 max-w-xs drop-shadow-xs">
                Custom Curtains &bull; Motorized Blinds &bull; Italian Fabrics &bull; Nilaya Wallcoverings
              </p>

              {/* Location Badge */}
              <div className="flex items-center gap-2 text-[11px] text-[#EAE4D9] font-medium mb-3.5">
                <span className="text-[#D4AF37] font-serif italic">Puppalguda &bull; Financial District</span>
              </div>

              {/* Dual Action Buttons */}
              <div className="flex items-center gap-2.5 w-full">
                <Link
                  href="/categories"
                  className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E46] text-[#1C1714] font-bold text-[11.5px] uppercase tracking-wider text-center shadow-lg active:scale-95 transition-all"
                >
                  Explore Catalog
                </Link>
                <button
                  type="button"
                  onClick={() => openBookingModal('Showroom Visit')}
                  className="py-3 px-4 rounded-full bg-[#1C1714]/70 backdrop-blur-md border border-[#D4AF37]/60 text-white font-semibold text-[11.5px] uppercase tracking-wider text-center active:scale-95 transition-all"
                >
                  Visit Atelier
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════
            SLIDE 3: BESPOKE WINDOW STYLING FOR GLOBAL & NRI HOMES
        ════════════════════════════════════════════════════════════════════════════ */}
        {currentSlide === 2 && (
          <div className="relative w-full h-full min-h-[540px] sm:min-h-[600px] md:min-h-[660px] lg:min-h-[700px] xl:min-h-[750px] flex flex-col justify-end sm:justify-center animate-in fade-in duration-500 overflow-hidden">
            {/* Bright, Sunlit Room Background with Curtains */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero/nri_living_room.jpg"
                alt="Bespoke Window Styling for Global Homeowners"
                fill
                priority
                className="object-cover object-center"
              />
              {/* Soft Warm Daylight Gradient Overlay: On mobile, dark espresso vignette for readable typography; on desktop, warm daylight */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714] via-[#1C1714]/45 to-transparent sm:bg-gradient-to-r sm:from-white/95 sm:via-white/70 sm:to-transparent" />
            </div>

            {/* Desktop Card (hidden on mobile, rich white card on desktop) */}
            <div className="hidden sm:block relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full py-10">
              <div className="max-w-lg bg-[#FDFBF7]/95 backdrop-blur-md rounded-3xl p-6 sm:p-9 shadow-2xl border border-[#C5A059]/40 space-y-4">

                {/* Headline: Bespoke Window Styling for Global & NRI Homes */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/15 text-[#C5A059] text-[10.5px] font-bold uppercase tracking-widest mb-2 border border-[#C5A059]/30">
                    <Plane className="w-3.5 h-3.5" />
                    <span>Worldwide Concierge Service</span>
                  </div>
                  <h2 className="text-[25px] sm:text-[32px] font-serif font-normal text-[#1C1714] leading-[1.18] tracking-tight">
                    Bespoke <span className="text-[#C5A059] font-medium">Window Styling</span>
                    <br />
                    for <span className="text-[#1C1714] font-medium">Global &amp; NRI Homes</span>
                  </h2>
                </div>

                {/* Fine Gold Line 1 */}
                <div className="border-t border-[#C5A059]/30 pt-3" />

                {/* 3 Pillars */}
                <div className="space-y-3.5">

                  {/* Pillar 1: Direct Atelier Pricing */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 font-bold">
                      <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-serif font-bold text-[16px] sm:text-[18px] text-[#1C1714] tracking-tight">
                        Direct Atelier <span className="text-[#C5A059] font-serif">Pricing</span>
                      </span>
                      <p className="text-[11.5px] text-[#78716C]">
                        Save up to 60% compared to USA, UK, Canada &amp; UAE bespoke retail
                      </p>
                    </div>
                  </div>

                  {/* Fine Gold Line 2 */}
                  <div className="border-t border-[#C5A059]/20" />

                  {/* Pillar 2: Insured Worldwide Shipping */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 font-bold">
                      <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-serif font-bold text-[16px] sm:text-[18px] text-[#1C1714] tracking-tight">
                        Insured Global <span className="text-[#C5A059] font-serif">Express</span>
                      </span>
                      <p className="text-[11.5px] text-[#78716C]">
                        Full-value insured door delivery across India or worldwide air freight
                      </p>
                    </div>
                  </div>

                  {/* Fine Gold Line 3 */}
                  <div className="border-t border-[#C5A059]/20" />

                  {/* Pillar 3: 1,000+ Curated Drapery Fabrics */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 font-bold">
                      <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-serif font-bold text-[16px] sm:text-[18px] text-[#1C1714] tracking-tight">
                        1,000+ Curated <span className="text-[#C5A059] font-serif">Drapery Fabrics</span>
                      </span>
                      <p className="text-[11.5px] text-[#78716C]">
                        Ripple fold, motorized Somfy tracks, French pleats &amp; sheer voiles
                      </p>
                    </div>
                  </div>

                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => openBookingModal('NRI Remote Home Styling')}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1C1714] hover:bg-[#C5A059] text-white hover:text-[#1C1714] font-bold text-[12px] uppercase tracking-wider shadow-md transition-all cursor-pointer text-center active:scale-95"
                  >
                    Schedule Video Styling
                  </button>
                  <Link
                    href="/categories/curtains"
                    className="w-full sm:w-auto px-5 py-3 rounded-full border border-[#C5A059] hover:bg-[#C5A059]/10 text-[#1C1714] font-semibold text-[12px] uppercase tracking-wider transition-colors text-center active:scale-95"
                  >
                    Explore Curtains
                  </Link>
                </div>

              </div>
            </div>

            {/* Mobile Editorial Floating Overlay (Clean, Cinematic, No giant card) */}
            <div className="sm:hidden relative z-10 w-full px-4 pt-6 pb-14 flex flex-col justify-end">
              {/* Minimal Luxury Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1714]/80 backdrop-blur-md border border-[#D4AF37]/50 text-[#F5E6CC] text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5 w-fit shadow-md">
                <Plane className="w-3 h-3 text-[#D4AF37]" />
                <span>Worldwide Concierge &bull; Global &amp; NRI</span>
              </div>

              {/* Title & Subtitle floating over sunlit suite */}
              <p className="font-serif italic text-[15px] text-[#D4AF37] font-normal leading-tight mb-1 drop-shadow-sm">
                Global Homeowners Concierge
              </p>
              <h2 className="text-[26px] font-serif font-normal text-white leading-[1.12] tracking-tight mb-1.5 drop-shadow-md">
                Bespoke Window Styling
              </h2>
              <p className="text-[12px] text-[#EAE4D9]/90 font-light leading-snug mb-3.5 max-w-xs drop-shadow-xs">
                Direct atelier pricing (save up to 60%) with insured worldwide air express delivery.
              </p>

              {/* 3 Micro Perks */}
              <div className="flex items-center gap-2.5 text-[10.5px] text-[#EAE4D9] font-medium mb-3.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Direct Pricing</span>
                </span>
                <span className="text-[#D4AF37]/60">&bull;</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Insured Express</span>
                </span>
                <span className="text-[#D4AF37]/60">&bull;</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>1,000+ Fabrics</span>
                </span>
              </div>

              {/* Dual Action Buttons */}
              <div className="flex items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => openBookingModal('NRI Remote Home Styling')}
                  className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E46] text-[#1C1714] font-bold text-[11.5px] uppercase tracking-wider text-center shadow-lg active:scale-95 transition-all"
                >
                  Video Styling
                </button>
                <Link
                  href="/categories/curtains"
                  className="py-3 px-4 rounded-full bg-[#1C1714]/70 backdrop-blur-md border border-[#D4AF37]/60 text-white font-semibold text-[11.5px] uppercase tracking-wider text-center active:scale-95 transition-all"
                >
                  Explore Curtains
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════
            SLIDE 1: ZAIRA ATELIER AT YOUR DOORSTEP (DEFAULT INITIAL SLIDE)
        ════════════════════════════════════════════════════════════════════════════ */}
        {currentSlide === 0 && (
          <div className="relative w-full h-full min-h-[540px] sm:min-h-[600px] md:min-h-[660px] lg:min-h-[700px] xl:min-h-[750px] flex flex-col justify-end sm:justify-between animate-in fade-in duration-500 overflow-hidden">
            {/* Background: Bright, Sunlit Room with Warm Peach Wall, Lamp & Floral Curtains */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero/doorstep_curtains_room.jpg"
                alt="Zaira In-Home Curtain Styling & Measurement"
                fill
                priority
                className="object-cover object-center"
              />
              {/* Soft Gradient Overlay: Clean sunlit view on top, smooth dark espresso blend on bottom for typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714] via-[#1C1714]/45 to-transparent sm:bg-gradient-to-r sm:from-black/60 sm:via-black/20 sm:to-transparent" />
            </div>

            {/* Desktop Card (hidden on mobile, full rich card on desktop) */}
            <div className="hidden sm:flex relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full py-8 lg:py-12 flex-1 flex-col justify-center">
              <div className="max-w-xl bg-[#1C1714]/85 backdrop-blur-md rounded-3xl p-6 sm:p-9 shadow-2xl border border-[#C5A059]/40 space-y-3.5 sm:space-y-5">

                {/* Atelier Doorstep Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E5D7BF] shadow-xs">
                  <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-[#1C1714]">ZAIRA ATELIER</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#C5A059] text-[#1C1714] font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
                    Doorstep
                  </span>
                  <span className="text-[10.5px] sm:text-[11.5px] font-serif italic text-[#8A6D3B] font-semibold">White-Glove Service</span>
                </div>

                {/* Main Headline & Subtitles */}
                <div className="space-y-1">
                  <p className="font-serif italic text-[16px] sm:text-[22px] text-[#C5A059] font-normal">
                    Experience Zaira at Home
                  </p>
                  <h2 className="text-[24px] sm:text-[34px] md:text-[38px] font-serif font-normal text-[#FDFBF7] leading-[1.12] tracking-tight">
                    Bespoke Window Styling
                  </h2>
                  <p className="text-[12.5px] sm:text-[15px] text-[#EAE4D9]/85 font-light leading-relaxed">
                    With In-Home Fabric Curation &amp; Laser Measurements across Hyderabad
                  </p>
                </div>

                {/* 3 Quick Value Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-[12.5px] font-medium text-white/90 pt-1 border-t border-[#C5A059]/20">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Free Laser Measurement</span>
                  </div>
                  <span className="text-[#C5A059]/50">&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>500+ Swatches</span>
                  </div>
                  <span className="text-[#C5A059]/50">&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Artisan Fitters</span>
                  </div>
                </div>

                {/* Dedicated Desktop Atelier Van Placement */}
                <div className="flex relative rounded-2xl bg-gradient-to-r from-[#2A231E] via-[#231C18] to-[#1C1714] p-4 border border-[#C5A059]/35 shadow-inner items-center gap-4">
                  {/* Sleek Gold & White Atelier Van SVG */}
                  <div className="w-28 sm:w-36 shrink-0">
                    <svg
                      viewBox="0 0 340 150"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-auto drop-shadow-md"
                    >
                      <path
                        d="M 15 115 L 15 28 Q 15 15 30 15 L 210 15 Q 225 15 240 40 L 280 80 Q 290 88 310 95 Q 325 100 325 115 L 325 118 Q 325 122 320 122 L 295 122 Q 295 102 275 102 Q 255 102 255 122 L 115 122 Q 115 102 95 102 Q 75 102 75 122 L 20 122 Q 15 122 15 115 Z"
                        stroke="#C5A059"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                        fill="rgba(197, 160, 89, 0.15)"
                      />
                      <path
                        d="M 215 25 L 268 75 L 215 75 Z"
                        stroke="#FDFBF7"
                        strokeWidth="2.5"
                        fill="rgba(253, 251, 247, 0.18)"
                      />
                      <path d="M 210 75 L 210 122" stroke="#C5A059" strokeWidth="2" strokeDasharray="3 3" />
                      <path d="M 315 98 Q 328 102 328 112" stroke="#FFD700" strokeWidth="4" />
                      <circle cx="95" cy="122" r="16" stroke="#C5A059" strokeWidth="3" fill="#1C1714" />
                      <circle cx="95" cy="122" r="6" fill="#FDFBF7" />
                      <circle cx="275" cy="122" r="16" stroke="#C5A059" strokeWidth="3" fill="#1C1714" />
                      <circle cx="275" cy="122" r="6" fill="#FDFBF7" />
                      <line x1="5" y1="138" x2="335" y2="138" stroke="#C5A059" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
                    </svg>
                  </div>

                  {/* Vehicle Description Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] uppercase tracking-[0.22em] font-bold text-[#C5A059] block mb-1">
                      MOBILE DESIGN ATELIER VAN
                    </span>
                    <p className="text-[12px] sm:text-[13px] text-[#FDFBF7] font-medium leading-snug">
                      Our custom swatch van brings 500+ luxury fabrics directly to your home across Hyderabad.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Mobile Editorial Floating Overlay (Clean, Cinematic, No heavy card box) */}
            <div className="sm:hidden relative z-10 w-full px-4 pt-6 pb-14 flex flex-col justify-end">
              {/* Minimal Luxury Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1714]/80 backdrop-blur-md border border-[#D4AF37]/50 text-[#F5E6CC] text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5 w-fit shadow-md">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Doorstep Curation &bull; Hyderabad</span>
              </div>

              {/* Title & Subtitle directly floating over photo vignette */}
              <p className="font-serif italic text-[15px] text-[#D4AF37] font-normal leading-tight mb-1 drop-shadow-sm">
                Experience Zaira at Home
              </p>
              <h1 className="text-[26px] font-serif font-normal text-white leading-[1.12] tracking-tight mb-1.5 drop-shadow-md">
                Bespoke Window Styling
              </h1>
              <p className="text-[12px] text-[#EAE4D9]/90 font-light leading-snug mb-3.5 max-w-xs drop-shadow-xs">
                Free laser measurement &amp; 500+ fabric swatches brought directly to your home.
              </p>

              {/* 3 Micro Perks */}
              <div className="flex items-center gap-2.5 text-[10.5px] text-[#EAE4D9] font-medium mb-3.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Free Laser Check</span>
                </span>
                <span className="text-[#D4AF37]/60">&bull;</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>500+ Swatches</span>
                </span>
                <span className="text-[#D4AF37]/60">&bull;</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Artisan Fit</span>
                </span>
              </div>

              {/* Dual Action Buttons */}
              <div className="flex items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => openBookingModal('Free In-Home Measurement')}
                  className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E46] text-[#1C1714] font-bold text-[11.5px] uppercase tracking-wider text-center shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Free Visit</span>
                </button>
                <Link
                  href="/categories/curtains"
                  className="py-3 px-4 rounded-full bg-[#1C1714]/70 backdrop-blur-md border border-[#D4AF37]/60 text-white font-semibold text-[11.5px] uppercase tracking-wider text-center active:scale-95 transition-all"
                >
                  Explore Drapes
                </Link>
              </div>
            </div>

            {/* Bottom Full-Width Atelier Bar (Desktop Only) */}
            <div className="hidden sm:block relative z-10 w-full bg-[#1C1714] text-white py-3 sm:py-4 px-4 shadow-xl border-t border-[#C5A059]/40">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3">
                  <span className="text-[15px] sm:text-[21px] font-serif font-medium tracking-tight text-[#FDFBF7]">
                    Book In-Home Consultation
                  </span>
                  <a
                    href="tel:07947415666"
                    className="inline-flex items-center gap-1.5 sm:gap-2 text-[15px] sm:text-[22px] font-bold text-[#C5A059] hover:text-[#EAE4D9] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    <span>07947415666</span>
                  </a>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-4">
                  <span className="text-[11px] text-[#A8A29E] font-medium tracking-wider">
                    White-Glove Hyderabad Service
                  </span>
                  <button
                    type="button"
                    onClick={() => openBookingModal('Free In-Home Measurement')}
                    className="px-6 py-2 rounded-full bg-[#C5A059] text-[#1C1714] hover:bg-[#B38E46] font-bold text-[12px] uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    Book Free In-Home Visit
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── Carousel Controls (Desktop Floating Chevrons) ─── */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="hidden sm:flex absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 p-2 text-white/90 hover:text-white transition-all cursor-pointer hover:scale-125 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        >
          <ChevronLeft className="w-8 h-8 sm:w-11 sm:h-11 stroke-[2.2]" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="hidden sm:flex absolute right-2 sm:right-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 p-2 text-white/90 hover:text-white transition-all cursor-pointer hover:scale-125 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        >
          <ChevronRight className="w-8 h-8 sm:w-11 sm:h-11 stroke-[2.2]" />
        </button>

        {/* ─── Carousel Indicator Dots ─── */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#1C1714]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? 'w-6 sm:w-8 bg-[#C5A059]' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
