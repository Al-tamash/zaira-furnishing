'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Sparkles,
  CheckCircle2,
  Ruler,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_DISPLAY, ZAIRA_WHATSAPP_URL } from '@/lib/whatsapp';

interface HeroSlide {
  id: number;
  image: string;
  imageAlt: string;
  badge: {
    icon: typeof Ruler;
    text: string;
  };
  titleLeading: string;
  titleAccent: string;
  description: string;
  perks: string[];
  primaryCta: {
    label: string;
    action: 'booking' | 'link';
    target: string;
  };
  secondaryCta: {
    label: string;
    action: 'whatsapp' | 'link' | 'booking';
    target: string;
  };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 0,
    image: '/images/hero/doorstep_curtains_room.jpg',
    imageAlt: 'Zaira Furnishing Doorstep In-Home Measurement and Curtain Styling',
    badge: {
      icon: Ruler,
      text: 'Doorstep Service · Hyderabad Wide',
    },
    titleLeading: 'Bespoke Window Styling & Curtains,',
    titleAccent: 'Measured at Your Home',
    description:
      'We bring 500+ luxury fabric sample books directly to your home. Enjoy laser-accurate measurements and personal styling advice from Puppalguda and Gachibowli to Jubilee Hills and Kokapet.',
    perks: [
      'Free Laser Measurement',
      '500+ Fabric Swatches at Home',
      'Direct Hyderabad Workshop Craft',
    ],
    primaryCta: {
      label: 'Book Free Home Visit',
      action: 'booking',
      target: 'Free Doorstep In-Home Measurement',
    },
    secondaryCta: {
      label: 'Chat on WhatsApp',
      action: 'whatsapp',
      target: ZAIRA_WHATSAPP_URL,
    },
  },
  {
    id: 1,
    image: '/images/hero/slide1_botanical_bg.jpg',
    imageAlt: 'Custom Made Curtains, Motorized Blinds and Luxury Fabrics',
    badge: {
      icon: Sparkles,
      text: 'Handcrafted Living · Made in Hyderabad',
    },
    titleLeading: 'Custom Curtains, Motorized Blinds',
    titleAccent: '& Designer Upholstery',
    description:
      'From precision ripple-fold drapery and motorized Somfy tracks to custom sofa upholstery and designer wallcoverings, tailored to fit your home architecture perfectly.',
    perks: [
      'Ripple Fold & Somfy Tracks',
      'Custom Sofa & Cushion Fabrics',
      'Artisan Precision Stitching',
    ],
    primaryCta: {
      label: 'Explore Curtains',
      action: 'link',
      target: '/categories/curtains',
    },
    secondaryCta: {
      label: 'Chat on WhatsApp',
      action: 'whatsapp',
      target: ZAIRA_WHATSAPP_URL,
    },
  },
  {
    id: 2,
    image: '/images/hero/nri_living_room.jpg',
    imageAlt: 'Zaira Furnishing Puppalguda Flagship Showroom and NRI Video Styling',
    badge: {
      icon: MapPin,
      text: 'Flagship Showroom · Puppalguda, Hyderabad',
    },
    titleLeading: 'Visit Our Puppalguda Showroom',
    titleAccent: 'or Consult Online',
    description:
      'Experience full-scale curtain displays and motorized tracks near Financial District. Video consultations and insured door delivery available for NRI and outstation homes.',
    perks: [
      '500+ Full Fabric Books in Store',
      'Near Financial District & Wipro Circle',
      'Video Styling for Global & NRI Homes',
    ],
    primaryCta: {
      label: 'Plan Showroom Visit',
      action: 'booking',
      target: 'Showroom Visit',
    },
    secondaryCta: {
      label: 'Schedule Video Styling',
      action: 'booking',
      target: 'NRI Remote Home Styling',
    },
  },
];

export function EcommerceHeroBanner() {
  const { openBookingModal } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto slide rotation every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
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

  const active = HERO_SLIDES[currentSlide];
  const BadgeIcon = active.badge.icon;

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-[#181310] select-none"
    >
      <div className="relative w-full min-h-[520px] sm:min-h-[580px] md:min-h-[620px] lg:min-h-[660px] xl:min-h-[700px] flex items-center">

        {/* ─── Background Photography & Cinematic Lighting Overlay ─── */}
        <div className="absolute inset-0 z-0">
          <Image
            key={active.image}
            src={active.image}
            alt={active.imageAlt}
            fill
            priority
            className="object-cover object-center transition-all duration-700 brightness-[0.95]"
          />
          {/* Multi-layered cinematic gradient: dark left for typography readability, open right to view room interior */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181310] via-[#181310]/75 to-[#181310]/30 md:bg-gradient-to-r md:from-[#181310]/95 md:via-[#181310]/75 md:to-transparent" />
        </div>

        {/* ─── Editorial Hero Content Overlay ─── */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-12 sm:py-16 md:py-20">
          <div className="max-w-2xl space-y-4 sm:space-y-5 animate-in fade-in duration-500">

            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181310]/80 border border-[#D4AF37]/50 text-[#F5E6CC] text-[10.5px] sm:text-[11.5px] font-semibold tracking-wide backdrop-blur-md shadow-xs">
              <BadgeIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{active.badge.text}</span>
            </div>

            {/* Headline */}
            <h1 className="text-[26px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-serif font-normal text-[#FAF7F2] leading-[1.15] tracking-tight">
              {active.titleLeading}{' '}
              <span className="text-[#D4AF37] font-medium">{active.titleAccent}</span>
            </h1>

            {/* Description */}
            <p className="text-[13px] sm:text-[15px] text-[#E8E1D5]/90 font-light leading-relaxed max-w-xl">
              {active.description}
            </p>

            {/* Value Points */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1">
              {active.perks.map((perk, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-[11px] sm:text-[12.5px] font-medium text-white/90 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              {active.primaryCta.action === 'booking' ? (
                <button
                  type="button"
                  onClick={() => openBookingModal(active.primaryCta.target)}
                  className="px-6 py-3.5 rounded-full bg-[#D4AF37] hover:bg-[#E5C378] text-[#181310] font-bold text-[12px] sm:text-[12.5px] tracking-wide transition-all shadow-lg active:scale-95 text-center cursor-pointer"
                >
                  {active.primaryCta.label}
                </button>
              ) : (
                <Link
                  href={active.primaryCta.target}
                  className="px-6 py-3.5 rounded-full bg-[#D4AF37] hover:bg-[#E5C378] text-[#181310] font-bold text-[12px] sm:text-[12.5px] tracking-wide transition-all shadow-lg active:scale-95 text-center cursor-pointer"
                >
                  {active.primaryCta.label}
                </Link>
              )}

              {active.secondaryCta.action === 'whatsapp' ? (
                <a
                  href={active.secondaryCta.target}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#181310]/70 hover:bg-[#181310] border border-[#D4AF37]/60 text-white font-semibold text-[12px] sm:text-[12.5px] tracking-wide transition-all backdrop-blur-md active:scale-95 text-center cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.97.53 1.77.813 2.796.814 3.18 0 5.767-2.587 5.768-5.766.001-3.181-2.586-5.767-5.768-5.767zm3.385 8.188c-.14.394-.713.729-1.002.766-.279.035-.635.055-1.834-.442-1.444-.598-2.378-2.062-2.45-2.158-.071-.096-.583-.775-.583-1.479 0-.704.368-1.05.5-1.193.132-.143.288-.179.384-.179.096 0 .192.001.276.005.09.004.21.034.32.298.114.275.39 1.05.424 1.127.034.077.057.167.006.269-.051.102-.077.165-.153.254-.076.089-.16.198-.229.266-.077.076-.157.159-.068.312.09.153.399.658.857 1.066.589.524 1.085.687 1.239.764.153.077.243.064.333-.039.09-.102.385-.448.487-.602.102-.154.204-.128.344-.077.14.051.888.419 1.041.496.153.076.255.115.293.179.038.064.038.371-.102.765z" />
                  </svg>
                  <span>{active.secondaryCta.label}</span>
                </a>
              ) : active.secondaryCta.action === 'booking' ? (
                <button
                  type="button"
                  onClick={() => openBookingModal(active.secondaryCta.target)}
                  className="px-5 py-3.5 rounded-full bg-[#181310]/70 hover:bg-[#181310] border border-[#D4AF37]/60 text-white font-semibold text-[12px] sm:text-[12.5px] tracking-wide transition-all backdrop-blur-md active:scale-95 text-center cursor-pointer"
                >
                  {active.secondaryCta.label}
                </button>
              ) : (
                <Link
                  href={active.secondaryCta.target}
                  className="px-5 py-3.5 rounded-full bg-[#181310]/70 hover:bg-[#181310] border border-[#D4AF37]/60 text-white font-semibold text-[12px] sm:text-[12.5px] tracking-wide transition-all backdrop-blur-md active:scale-95 text-center cursor-pointer"
                >
                  {active.secondaryCta.label}
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* ─── Carousel Controls (Floating Frosted Chevrons) ─── */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="hidden sm:flex absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#181310]/50 hover:bg-[#181310]/80 border border-white/20 text-white/90 hover:text-white backdrop-blur-md items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="hidden sm:flex absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#181310]/50 hover:bg-[#181310]/80 border border-white/20 text-white/90 hover:text-white backdrop-blur-md items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* ─── Carousel Slide Indicators ─── */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-[#181310]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? 'w-7 sm:w-9 bg-[#D4AF37]'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
