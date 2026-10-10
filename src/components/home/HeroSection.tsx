'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Calendar,
  Ruler,
  Sparkles,
  ShieldCheck,
  Star,
  Award,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { DbCmsContent } from '@/lib/db/types';

interface HeroSectionProps {
  cmsContent?: DbCmsContent | null;
}

const HERO_SLIDES = [
  {
    id: 'grand-living',
    tab: 'Living Room Atelier',
    eyebrow: 'HYDERABAD FLAGSHIP ATELIER & GLOBAL CONCIERGE',
    title: 'Where Millimeter Precision Meets Quiet Luxury',
    subtitle:
      'Curated curtains & drapes, architectural motorized blinds, Italian bouclé sofa fabrics, and artisanal hand-tufted rugs tailored to perfection.',
    image: '/images/hero/living_room.jpg',
    badge: '146 Quality Checks Certified',
    stat: '10,000+ Homes Furnished',
  },
  {
    id: 'motorized-drapery',
    tab: 'Smart Motorization',
    eyebrow: 'SOMFY & SMART ECOSYSTEM AUTOMATION',
    title: 'Whisper-Quiet Motorized Drapery & Window Blinds',
    subtitle:
      'Effortless light control with automated ceiling-recessed tracks. Schedule sunrise openings and evening privacy with voice or app commands.',
    image: '/images/hero/curtains.jpg',
    badge: '5-Year Mechanism Warranty',
    stat: '<35dB Ultra Silent',
  },
  {
    id: 'master-suite',
    tab: 'Master Sleep Suite',
    eyebrow: 'RESTFUL SANCTUARY & NATURAL LATEX',
    title: '100% Thermal Blackout & Ergonomic Sleep Systems',
    subtitle:
      'Pitch-dark sleep sanctuaries with acoustic-lined blackout curtains, 1000TC Egyptian cotton sateen sheets, and zero-motion pocket spring mattresses.',
    image: '/images/hero/bedroom.jpg',
    badge: 'Orthopedic Spine Care',
    stat: '100% Light Exclusion',
  },
];

export function HeroSection({ cmsContent }: HeroSectionProps) {
  const { openBookingModal } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const current = HERO_SLIDES[activeSlide];

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] text-[#1C1917] pt-2 sm:pt-4 pb-12 sm:pb-16 lg:pb-20">
      
      {/* Background Subtle Gradient & Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-24 right-0 w-[65vw] h-[120%] bg-[#EFE7DC] opacity-80"
          style={{
            borderBottomLeftRadius: '260px',
            borderTopLeftRadius: '160px',
            transform: 'rotate(-2deg)',
          }}
        />
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-[#2C221E]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Mood Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 sm:mb-6 no-scrollbar">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`px-4 py-1.5 rounded-full text-[11.5px] font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeSlide === idx
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'bg-white/80 border border-[#EAE4D8] text-[#57534E] hover:text-[#1C1917] hover:bg-white'
              }`}
            >
              {slide.tab}
            </button>
          ))}
        </div>

        {/* ─── Hero Main Split Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & High-Converting CTAs (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left py-2">
            
            {/* Trust Pill / Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C221E]/10 border border-[#2C221E]/20 text-[#2C221E] text-[9.5px] sm:text-[10.5px] uppercase tracking-widest font-semibold max-w-full">
                <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                <span className="truncate">{current.eyebrow}</span>
              </span>
              <span className="hidden sm:inline-block h-[1px] w-10 bg-[#C4B9A1]" />
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-[28px] xs:text-[34px] sm:text-[46px] lg:text-[52px] xl:text-[56px] text-[#2C221E] font-semibold leading-[1.15] tracking-tight mb-4 break-words">
              {current.title}
            </h1>

            {/* Subtitle */}
            <p className="text-[14.5px] sm:text-[16px] text-[#57534E] font-normal leading-relaxed max-w-xl mb-6 sm:mb-8">
              {current.subtitle}
            </p>

            {/* Trust Metrics Pill Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-7 pb-6 border-b border-[#EAE4D8]">
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="text-[12px] font-bold text-[#1C1917] ml-1">4.9/5</span>
                <span className="text-[11px] text-[#78716C]">(1,480+ Reviews)</span>
              </div>
              <span className="text-[#C4B9A1] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2C221E]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>146 Quality Checks</span>
              </div>
              <span className="text-[#C4B9A1] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-[12px] text-[#57534E]">
                <Clock className="w-3.5 h-3.5 text-[#9A7B56]" />
                <span>Free Measurement in 24 Hrs</span>
              </div>
            </div>

            {/* High-Converting Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openBookingModal('Free In-Home Measurement')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-[13.5px] font-semibold text-white bg-[#1C1714] hover:bg-[#2C221E] rounded-full transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer group text-center"
              >
                <Ruler className="w-4 h-4 text-[#D4AF37]" />
                <span>Book Free In-Home Visit</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <Link
                href="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-[13px] font-semibold text-[#2C221E] bg-white hover:bg-[#FAF7F2] border border-[#C4B9A1] rounded-full transition-all duration-300 shadow-2xs text-center"
              >
                <span>Explore Catalog</span>
                <ChevronRight className="w-4 h-4 text-[#9A7B56]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Editorial Image Display (6 cols) */}
          <div className="lg:col-span-6 relative mt-2 sm:mt-4 lg:mt-0">
            <div className="relative w-full max-w-lg sm:max-w-2xl mx-auto lg:max-w-none pb-8 sm:pb-12">
              
              {/* Main Large Visual Card */}
              <div className="relative aspect-[16/11] sm:aspect-[16/10.5] w-full rounded-[28px] sm:rounded-[38px] overflow-hidden shadow-[0_20px_50px_rgba(28,25,23,0.15)] border-4 border-white bg-[#EDE5DB]">
                <Image
                  src={current.image}
                  alt={current.title}
                  fill
                  priority
                  className="object-cover object-center transition-all duration-700"
                />

                {/* Ambient Subtle Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Bottom Card */}
                <div className="absolute inset-x-4 sm:inset-x-6 bottom-4 sm:bottom-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9A7B56] block">
                      Featured Discipline
                    </span>
                    <span className="font-serif text-[15px] font-semibold text-[#1C1917] block">
                      {current.badge}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] block">
                      Client Trust
                    </span>
                    <span className="text-[13px] font-bold text-[#2C221E] block">
                      {current.stat}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overlapping Floating Inset Card Left */}
              <div className="hidden sm:block absolute -bottom-4 -left-4 w-36 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-xl z-20 bg-white">
                <Image
                  src="/images/hero/curtains.jpg"
                  alt="Curtain detail"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Overlapping Floating Inset Card Right */}
              <div className="hidden sm:block absolute -bottom-4 -right-4 w-36 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-xl z-20 bg-white">
                <Image
                  src="/images/hero/bedroom.jpg"
                  alt="Bedroom detail"
                  fill
                  className="object-cover"
                />
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
