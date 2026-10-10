'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Ruler,
  Award,
  ArrowRight,
  Hammer,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

const PROMISES = [
  {
    icon: CheckCircle,
    badge: 'Standard 01',
    title: '146-Point Quality Audit',
    description: 'Every curtain panel, blind track, and upholstered piece undergoes 146 strict checks—from thread count tensile strength to weighted hem drops.',
  },
  {
    icon: ShieldCheck,
    badge: 'Standard 02',
    title: "India's Best 5-Year Full Warranty",
    description: 'Complete replacement warranty on Somfy & Tuya motorized systems, plus lifetime track alignment guarantee on all architectural hardware.',
  },
  {
    icon: Clock,
    badge: 'Standard 03',
    title: '45-Day Guaranteed Turnkey Handover',
    description: 'From initial laser site measurement to final hung drapery and floor installation—delivered on time or we refund your stitching fee.',
  },
  {
    icon: Hammer,
    badge: 'Standard 04',
    title: 'Dust-Free White Glove Installation',
    description: 'Our certified technicians use specialized vacuum-suction drill equipment, leaving your luxury floors and walls pristine and spot-free.',
  },
];

export function QualityPromiseBanner() {
  const { openBookingModal } = useStore();

  return (
    <section className="py-14 sm:py-18 bg-[#2C221E] text-white border-t border-[#3D302A] relative overflow-hidden">
      {/* Background Subtle Monogram Accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-[500px] h-[500px] fill-white">
          <polygon points="50,5 95,30 95,75 50,95 5,75 5,30" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-[#3D302A] gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-[10.5px] uppercase tracking-widest font-semibold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>The Zaira Benchmark of Luxury</span>
            </div>
            <h2 className="font-serif text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-tight text-white leading-tight">
              146 Quality Checks & India’s Leading Home Warranty
            </h2>
            <p className="mt-2.5 text-[14px] sm:text-[15.5px] text-[#C4B9A1] font-light leading-relaxed">
              We eliminate guesswork with laser millimeter precision, master tailoring, and dust-free technical installation across Hyderabad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openBookingModal('Free In-Home Measurement')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#D4AF37] hover:bg-[#C29D2B] text-[#1C1917] font-semibold text-[13px] shadow-md transition-all cursor-pointer"
            >
              <Ruler className="w-4 h-4" />
              <span>Book Laser Measurement</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 sm:pt-12">
          {PROMISES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                      {item.badge}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-[17px] sm:text-[18px] font-semibold text-white mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[12.5px] text-[#C4B9A1] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-[#D4AF37] font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>100% Certified Standard</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
