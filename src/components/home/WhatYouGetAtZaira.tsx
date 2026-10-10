'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/context/StoreContext';

interface ValuePillar {
  id: string;
  title: string;
  subtitle: string;
  modalService: string;
  icon: React.ReactNode;
}

export function WhatYouGetAtZaira() {
  const { openBookingModal } = useStore();

  const PILLARS: ValuePillar[] = [
    {
      id: 'quality',
      title: 'Quality Products',
      subtitle: '5,000+ tested fabrics & imported velvets',
      modalService: 'Quality Products Inquiry',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
          {/* Medal Ribbon */}
          <path d="M22 36 L16 54 L26 48 L32 54 L30 38" fill="#F4ECE1" stroke="#823423" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M42 36 L48 54 L38 48 L32 54 L34 38" fill="#F4ECE1" stroke="#823423" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Ribbon Ends Accent */}
          <path d="M16 54 L26 48 L22 36 Z" fill="#823423" />
          <path d="M48 54 L38 48 L42 36 Z" fill="#823423" />
          {/* Medal Outer Circle */}
          <circle cx="32" cy="26" r="18" fill="#FDFBF7" stroke="#823423" strokeWidth="2.2" />
          {/* Medal Inner Ring */}
          <circle cx="32" cy="26" r="13" fill="#F5EFE6" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Crown / Star Symbol */}
          <path d="M25 29 L28 20 L32 24 L36 20 L39 29 Z" fill="#823423" />
        </svg>
      ),
    },
    {
      id: 'advisory',
      title: 'Design Advisory',
      subtitle: 'Senior interior stylists at your service',
      modalService: 'Design & Home Styling Consultation',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
          {/* Paper / Blueprint */}
          <rect x="14" y="10" width="28" height="38" rx="3" fill="#FAF6EE" stroke="#823423" strokeWidth="2.2" />
          {/* Blueprint Lines */}
          <path d="M14 16 L42 16" stroke="#823423" strokeWidth="1.5" />
          <path d="M20 23 L36 23" stroke="#823423" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M20 30 L32 30" stroke="#823423" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M20 37 L34 37" stroke="#823423" strokeWidth="1.8" strokeLinecap="round" />
          {/* Armchair Silhouette on Blueprint */}
          <rect x="22" y="24" width="12" height="10" rx="2" fill="#F4ECE1" stroke="#C5A059" strokeWidth="1.5" />
          {/* Stylist Drawing Pencil */}
          <g transform="rotate(-35 38 34)">
            <rect x="34" y="18" width="8" height="24" rx="2" fill="#823423" stroke="#823423" strokeWidth="1.5" />
            <polygon points="34,42 42,42 38,50" fill="#D4AF37" stroke="#823423" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="36,46 40,46 38,50" fill="#823423" />
          </g>
        </svg>
      ),
    },
    {
      id: 'measuring',
      title: 'Measuring Service',
      subtitle: 'Free millimeter-accurate laser survey',
      modalService: 'Free Doorstep In-Home Measurement',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
          {/* Crossed Ruler 1 (Wood Ruler) */}
          <g transform="rotate(45 32 32)">
            <rect x="27" y="10" width="10" height="44" rx="2" fill="#FAF5EE" stroke="#823423" strokeWidth="2.2" />
            {/* Tick Marks */}
            <line x1="27" y1="16" x2="31" y2="16" stroke="#823423" strokeWidth="1.5" />
            <line x1="27" y1="22" x2="33" y2="22" stroke="#823423" strokeWidth="1.5" />
            <line x1="27" y1="28" x2="31" y2="28" stroke="#823423" strokeWidth="1.5" />
            <line x1="27" y1="34" x2="33" y2="34" stroke="#823423" strokeWidth="1.5" />
            <line x1="27" y1="40" x2="31" y2="40" stroke="#823423" strokeWidth="1.5" />
            <line x1="27" y1="46" x2="33" y2="46" stroke="#823423" strokeWidth="1.5" />
          </g>
          {/* Crossed Pencil 2 */}
          <g transform="rotate(-45 32 32)">
            <rect x="28" y="12" width="8" height="36" rx="1.5" fill="#823423" stroke="#823423" strokeWidth="2" />
            <polygon points="28,48 36,48 32,56" fill="#D4AF37" stroke="#823423" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="30,52 34,52 32,56" fill="#823423" />
            <rect x="28" y="12" width="8" height="6" fill="#C5A059" />
          </g>
        </svg>
      ),
    },
    {
      id: 'installation',
      title: 'Installation Service',
      subtitle: 'Vacuum dust-free drilling & steaming',
      modalService: 'Professional Installation',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
          {/* Screwdriver */}
          <g transform="rotate(-45 32 32)">
            <rect x="30" y="10" width="4" height="24" fill="#EAE4D8" stroke="#823423" strokeWidth="1.8" />
            <rect x="28" y="34" width="8" height="18" rx="2" fill="#823423" stroke="#823423" strokeWidth="2" />
            <line x1="28" y1="40" x2="36" y2="40" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="28" y1="46" x2="36" y2="46" stroke="#D4AF37" strokeWidth="1.5" />
            <polygon points="29,10 35,10 32,6" fill="#823423" />
          </g>
          {/* Wrench */}
          <g transform="rotate(45 32 32)">
            <rect x="30" y="14" width="4" height="34" fill="#FAF5EE" stroke="#823423" strokeWidth="1.8" />
            {/* Wrench Head */}
            <path
              d="M26 14 C26 9 38 9 38 14 C36 17 34 17 34 17 L30 17 C30 17 28 17 26 14 Z"
              fill="#F4ECE1"
              stroke="#823423"
              strokeWidth="1.8"
            />
            {/* Wrench Jaw Cutout */}
            <rect x="30" y="8" width="4" height="6" fill="#FAF8F5" stroke="#823423" strokeWidth="1.5" />
            {/* Wrench Bottom Ring */}
            <circle cx="32" cy="48" r="4.5" fill="#F4ECE1" stroke="#823423" strokeWidth="1.8" />
            <circle cx="32" cy="48" r="2" fill="#FAF8F5" />
          </g>
        </svg>
      ),
    },
    {
      id: 'assistance',
      title: 'Customer Assistance',
      subtitle: 'Dedicated post-handover care & warranty',
      modalService: 'Customer Support & Assistance',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
          {/* Headband */}
          <path
            d="M18 34 C18 18 46 18 46 34"
            fill="none"
            stroke="#823423"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Left Earpad */}
          <rect x="14" y="32" width="7" height="14" rx="3.5" fill="#F4ECE1" stroke="#823423" strokeWidth="1.8" />
          {/* Right Earpad */}
          <rect x="43" y="32" width="7" height="14" rx="3.5" fill="#F4ECE1" stroke="#823423" strokeWidth="1.8" />
          {/* Microphone Arm */}
          <path
            d="M45 42 Q42 50 34 50"
            fill="none"
            stroke="#823423"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Microphone Mic Tip */}
          <circle cx="33" cy="50" r="3" fill="#C5A059" stroke="#823423" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF8F5] py-12 sm:py-16 lg:py-20 border-b border-[#EAE4D9]">

      {/* ─── Ambient High-Key Backdrop ─── */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <Image
          src="/images/hero/curtains.jpg"
          alt="Zaira Furnishing Interior Backdrop"
          fill
          sizes="100vw"
          className="object-cover object-center filter blur-[1px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Headline & Accent Underline (5-Step Process) ─── */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#823423]/10 text-[#823423] text-[10px] sm:text-[10.5px] uppercase tracking-widest font-bold mb-2">
            <span>Our 5-Step Process &bull; The Zaira Journey</span>
          </div>
          <h2 className="font-serif text-[24px] sm:text-[36px] lg:text-[42px] font-bold text-[#823423] tracking-tight leading-tight">
            How Zaira Works
          </h2>
          <p className="text-[12.5px] sm:text-[14.5px] text-[#78716C] mt-1.5 max-w-xl mx-auto leading-relaxed">
            From doorstep fabric swatches &amp; laser measurement to master custom tailoring and dust-free installation.
          </p>
          <div className="w-20 sm:w-36 h-0.5 bg-[#823423]/60 mx-auto mt-2.5 rounded-full" />
        </div>

        {/* ─── 5 Value Pillars Track: Horizontal Snap-Scroll on Mobile, 5-Cols on Desktop ─── */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {PILLARS.map((pillar, idx) => (
            <div
              key={pillar.id}
              onClick={() => openBookingModal(pillar.modalService)}
              className="group cursor-pointer flex flex-col justify-between text-center p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xs border border-[#EAE4D9] hover:border-[#823423]/60 transition-all duration-300 hover:-translate-y-1 shadow-[0_2px_12px_rgba(28,23,20,0.03)] hover:shadow-md w-[68vw] sm:w-auto shrink-0 sm:shrink snap-start h-full"
            >
              <div className="flex flex-col items-center w-full">
                {/* Step Number Tag */}
                <div className="w-full flex justify-center mb-2.5">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-[#823423] px-2.5 py-0.5 rounded-full bg-[#823423]/10">
                    Step 0{idx + 1}
                  </span>
                </div>

                {/* Illustrated Icon Frame with Smooth Hover Animation */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  {pillar.icon}
                </div>

                {/* Title in Bold Serif Typography */}
                <h3 className="font-serif text-[15px] sm:text-[17px] lg:text-[18px] font-bold text-[#1C1714] group-hover:text-[#823423] transition-colors leading-tight">
                  {pillar.title}
                </h3>

                {/* Subtitle / Value Proposition */}
                <p className="text-[11.5px] sm:text-[12px] text-[#78716C] group-hover:text-[#57534E] mt-1.5 leading-snug font-sans">
                  {pillar.subtitle}
                </p>
              </div>

              {/* Subtle Atelier Tap Cue */}
              <div className="mt-3.5 pt-2 border-t border-[#F2ECE1] w-full flex items-center justify-center gap-1 text-[10.5px] sm:text-[11px] font-semibold text-[#823423] group-hover:text-[#1C1714] transition-colors">
                <span>Inquire</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Cue Dots */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
          ))}
        </div>

      </div>
    </section>
  );
}
