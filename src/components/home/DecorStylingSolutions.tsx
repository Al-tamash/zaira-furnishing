'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Phone,
  Mail,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_DISPLAY } from '@/lib/whatsapp';

interface CarouselCard {
  id: string;
  name: string;
  category: string;
  image: string;
  alt: string;
  service: string;
}

const CAROUSEL_CARDS: CarouselCard[] = [
  {
    id: 'living-styling',
    name: 'Curtains & Drapery Curation',
    category: 'Window Curtains & Sheers',
    image: '/images/services/decor_home_styling.jpg',
    alt: 'Curated Living Room Couture & Drapes - Zaira Furnishing',
    service: 'Home Styling Consultation',
  },
  {
    id: 'master-suite',
    name: 'Full-Home Furnishing',
    category: 'Master Suites & Turnkey Makeover',
    image: '/images/services/decor_nri_homes.jpg',
    alt: 'Master Bedroom Suite & Turnkey Makeover - Zaira Furnishing',
    service: 'End-to-End Home Makeover',
  },
  {
    id: 'sofa-lounge',
    name: 'Sofa Fabrics & Upholstery',
    category: 'Couch Fabrics & Custom Reupholstery',
    image: '/images/services/decor_end_to_end.jpg',
    alt: 'Turnkey Luxury Sofa Upholstery - Zaira Furnishing',
    service: 'Sofa & Fabric Consultation',
  },
  {
    id: 'architect-studio',
    name: 'Architect & Trade Studio',
    category: '5,000+ Swatch Library & Trade Privileges',
    image: '/images/services/decor_interior_designer.jpg',
    alt: 'Architect & Interior Designer Studio - Zaira Furnishing',
    service: 'Architect & Interior Designer Collaboration',
  },
  {
    id: 'commercial-hospitality',
    name: 'Wallpapers & Architectural Murals',
    category: 'Nilaya 3D Textures & Feature Walls',
    image: '/images/services/decor_corporate.jpg',
    alt: 'Wallpapers & Murals Decor - Zaira Furnishing',
    service: 'Wallpaper Curation Consultation',
  },
  {
    id: 'doorstep-measurement',
    name: 'Atelier at Your Doorstep',
    category: 'Free Laser Measurement & 500+ Swatches',
    image: '/images/services/decor_doorstep_service.jpg',
    alt: 'Complimentary In-Home Laser Measurement - Zaira Furnishing',
    service: 'Free Doorstep In-Home Measurement',
  },
];

export function DecorStylingSolutions() {
  const { openBookingModal } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? CAROUSEL_CARDS.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_CARDS.length);
  }, []);

  // 3 visible cards computed circularly
  const leftCard = CAROUSEL_CARDS[currentIndex % CAROUSEL_CARDS.length];
  const centerCard = CAROUSEL_CARDS[(currentIndex + 1) % CAROUSEL_CARDS.length];
  const rightCard = CAROUSEL_CARDS[(currentIndex + 2) % CAROUSEL_CARDS.length];

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF8F5] py-16 sm:py-20 lg:py-24 border-b border-[#EAE4D9]">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Layered Editorial Headline (Refined Font Size) ─── */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="relative inline-block text-center select-none">
            {/* 1. "designing" in bold high-contrast serif */}
            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[56px] font-bold text-[#1C1714] tracking-tight leading-[0.9] lowercase">
              designing
            </h2>

            {/* 2. "that make your" in cursive script flowing across */}
            <div className="font-['Alex_Brush',cursive] text-[24px] sm:text-[34px] lg:text-[42px] text-[#7A7570] -mt-2 sm:-mt-3 mb-0.5 tracking-normal drop-shadow-xs">
              that make your
            </div>

            {/* 3. "home feel truly yours." in refined serif */}
            <div className="font-serif text-[20px] sm:text-[30px] lg:text-[38px] font-semibold text-[#1C1714] tracking-tight leading-tight -mt-0.5 sm:-mt-1">
              home feel truly yours.
            </div>
          </div>
        </div>

        {/* ─── Carousel Wrapper with Desktop 3-Card & Mobile Single-Card Layout ─── */}
        <div className="relative max-w-5xl mx-auto">

          {/* Left Carousel Arrow Button (Desktop) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous interior inspiration"
            className="hidden md:flex absolute -left-3 sm:-left-6 lg:-left-12 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 hover:bg-[#1C1714] text-[#1C1714] hover:text-[#C5A059] border border-[#EAE4D9] shadow-xl hover:shadow-2xl items-center justify-center transition-all duration-300 backdrop-blur-md cursor-pointer hover:scale-108 active:scale-95 group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* ─── MOBILE VIEW: Single Sculpted Architectural Card with Touch Controls ─── */}
          <div className="block md:hidden px-2">
            <div
              key={`mobile-${centerCard.id}`}
              onClick={() => openBookingModal(centerCard.service)}
              className="group cursor-pointer relative aspect-[9/13.5] rounded-t-[90px] rounded-b-[24px] overflow-hidden bg-[#EFE9DD] shadow-2xl transition-all duration-500 max-w-sm mx-auto border border-[#EAE4D9]"
            >
              <Image
                src={centerCard.image}
                alt={centerCard.alt}
                fill
                sizes="(max-width: 768px) 90vw, 380px"
                priority
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
              />

              {/* Mobile Card Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-5 text-white">
                {/* Top Badge: Current Slide Number */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] border border-white/20">
                    Space {((currentIndex + 1) % CAROUSEL_CARDS.length) + 1} of {CAROUSEL_CARDS.length}
                  </span>
                  <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                    Tap to Consult
                  </span>
                </div>

                {/* Bottom Details */}
                <div>
                  <span className="text-[10.5px] uppercase font-bold tracking-widest text-[#C5A059] block mb-1">
                    {centerCard.category}
                  </span>
                  <h3 className="font-serif text-[21px] font-bold text-white leading-tight mb-2.5">
                    {centerCard.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white border border-white/30">
                    <span>Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Controls */}
            <div className="flex items-center justify-between max-w-sm mx-auto mt-4 px-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous space"
                className="w-10 h-10 rounded-full bg-white border border-[#EAE4D9] text-[#1C1714] shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {CAROUSEL_CARDS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Slide to space ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-6 bg-[#1C1714]' : 'w-2 bg-[#DED6C7]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next space"
                className="w-10 h-10 rounded-full bg-white border border-[#EAE4D9] text-[#1C1714] shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ─── DESKTOP VIEW: 3 Architectural Photo Cards ─── */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 items-center px-1 sm:px-2">

            {/* Left Card: Vertical Capsule Pill */}
            <div
              key={`left-${leftCard.id}`}
              onClick={() => openBookingModal(leftCard.service)}
              className="group cursor-pointer relative aspect-[9/14] sm:aspect-[9/15] rounded-[120px] sm:rounded-[160px] overflow-hidden bg-[#EFE9DD] shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            >
              <Image
                src={leftCard.image}
                alt={leftCard.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Always-Visible Luxury Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 sm:p-7 text-white">
                <div>
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-bold tracking-widest text-[#C5A059] block mb-1">
                    {leftCard.category}
                  </span>
                  <h3 className="font-serif text-[19px] sm:text-[21px] font-bold text-white leading-tight mb-2">
                    {leftCard.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FAF4E7] group-hover:text-[#C5A059] transition-colors">
                    <span>Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Card: Classical Architectural Arch (Elevated) */}
            <div
              key={`center-${centerCard.id}`}
              onClick={() => openBookingModal(centerCard.service)}
              className="group cursor-pointer relative aspect-[9/14.5] sm:aspect-[9/16] rounded-t-[140px] sm:rounded-t-[180px] rounded-b-[24px] sm:rounded-b-[28px] overflow-hidden bg-[#EFE9DD] shadow-2xl transition-all duration-500 hover:scale-[1.02] md:-translate-y-2"
            >
              <Image
                src={centerCard.image}
                alt={centerCard.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Always-Visible Luxury Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 sm:p-7 text-white">
                <div>
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-bold tracking-widest text-[#C5A059] block mb-1">
                    {centerCard.category}
                  </span>
                  <h3 className="font-serif text-[20px] sm:text-[22px] font-bold text-white leading-tight mb-2">
                    {centerCard.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FAF4E7] group-hover:text-[#C5A059] transition-colors">
                    <span>Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Vertical Capsule Pill */}
            <div
              key={`right-${rightCard.id}`}
              onClick={() => openBookingModal(rightCard.service)}
              className="group cursor-pointer relative aspect-[9/14] sm:aspect-[9/15] rounded-[120px] sm:rounded-[160px] overflow-hidden bg-[#EFE9DD] shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            >
              <Image
                src={rightCard.image}
                alt={rightCard.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Always-Visible Luxury Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 sm:p-7 text-white">
                <div>
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-bold tracking-widest text-[#C5A059] block mb-1">
                    {rightCard.category}
                  </span>
                  <h3 className="font-serif text-[19px] sm:text-[21px] font-bold text-white leading-tight mb-2">
                    {rightCard.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FAF4E7] group-hover:text-[#C5A059] transition-colors">
                    <span>Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Carousel Arrow Button (Desktop) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next interior inspiration"
            className="hidden md:flex absolute -right-3 sm:-right-6 lg:-right-12 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 hover:bg-[#1C1714] text-[#1C1714] hover:text-[#C5A059] border border-[#EAE4D9] shadow-xl hover:shadow-2xl items-center justify-center transition-all duration-300 backdrop-blur-md cursor-pointer hover:scale-108 active:scale-95 group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Desktop Slide Indicators */}
          <div className="hidden md:flex items-center justify-center gap-2 mt-6">
            {CAROUSEL_CARDS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide to space ${idx + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 sm:w-8 bg-[#1C1714]'
                    : 'w-2 bg-[#DED6C7] hover:bg-[#C5A059]'
                }`}
              />
            ))}
          </div>

        </div>

        {/* ─── Tagline Below the Cards ─── */}
        <div className="text-center mt-8 sm:mt-10 max-w-xl mx-auto">
          <p className="font-sans text-[16px] sm:text-[19px] lg:text-[21px] text-[#2C241E] font-medium tracking-tight leading-relaxed">
            Enjoy modern, functional, and elegant spaces created around your lifestyle.
          </p>
        </div>

        {/* ─── Bottom Brand & Consultation Banner ─── */}
        <div className="mt-12 sm:mt-16 rounded-[28px] sm:rounded-[36px] bg-white border border-[#EAE4D9] p-6 sm:p-8 shadow-atelier flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">

          {/* Left Brand Identity */}
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#1C1714] text-[#C5A059] flex items-center justify-center font-serif text-2xl font-black border border-[#C5A059]/40 shadow-xs">
              Z
            </div>
            <div>
              <div className="font-serif text-[22px] sm:text-[24px] font-black tracking-wider text-[#1C1714] leading-tight">
                ZAIRA
              </div>
              <div className="text-[10px] sm:text-[10.5px] uppercase tracking-widest font-bold text-[#7C7167]">
                Furnishing &amp; Atelier · Hyderabad
              </div>
            </div>
          </div>

          {/* Right Consultation Button & Contacts */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openBookingModal('Design & Home Styling Consultation')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-full bg-[#1C1714] hover:bg-[#C5A059] text-white hover:text-[#1C1714] text-[11px] sm:text-[12px] font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>BOOK YOUR DESIGN CONSULTATION TODAY!</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 text-[12.5px] font-semibold text-[#1C1714]">
              <a
                href={`tel:${ZAIRA_WHATSAPP_DISPLAY}`}
                className="inline-flex items-center gap-1.5 hover:text-[#C5A059] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#1C1714] text-white flex items-center justify-center text-[10px]">
                  <Phone className="w-2.5 h-2.5" />
                </div>
                <span>+91 {ZAIRA_WHATSAPP_DISPLAY}</span>
              </a>

              <span className="text-[#EAE4D9]">|</span>

              <a
                href="mailto:concierge@zairafurnishing.com"
                className="inline-flex items-center gap-1.5 hover:text-[#C5A059] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#1C1714] text-white flex items-center justify-center text-[10px]">
                  <Mail className="w-2.5 h-2.5" />
                </div>
                <span>concierge@zairafurnishing.com</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
