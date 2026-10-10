'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Ruler, Cpu, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

export function PromoBannerGrid() {
  const { openBookingModal } = useStore();

  return (
    <section className="py-12 sm:py-16 bg-[#FDFBF7] border-t border-[#EAE4D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Banner 1: Smart Motorization */}
          <div className="group relative rounded-3xl overflow-hidden bg-white border border-[#EAE4D9] p-7 sm:p-8 flex flex-col justify-between min-h-[320px] shadow-atelier hover:shadow-atelier-hover transition-all">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E7] border border-[#E8D5A0] text-[#B38E46] text-[10.5px] uppercase font-bold tracking-widest">
                <Cpu className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Smart Automation</span>
              </span>
              <h3 className="font-serif text-[22px] sm:text-[24px] font-bold text-[#1C1714] leading-tight">
                Whisper-Quiet Motorized Drapery
              </h3>
              <p className="text-[13px] text-[#7C7167] leading-relaxed">
                Somfy &amp; Tuya smart integration. Alexa &amp; Google Home voice control with a 5-year warranty on all motors.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/categories/blinds/motorized-smart"
                className="inline-flex items-center gap-2 text-[12px] uppercase font-bold tracking-wider text-[#1C1714] hover:text-[#C5A059] transition-colors group"
              >
                <span>Explore Motorization</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Banner 2: In-Home Measurement (Center Feature Card with Gold Border) */}
          <div className="group relative rounded-3xl overflow-hidden bg-white border-2 border-[#C5A059] p-7 sm:p-8 flex flex-col justify-between min-h-[320px] shadow-atelier hover:shadow-atelier-hover transition-all">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E7] border border-[#E8D5A0] text-[#B38E46] text-[10.5px] uppercase font-bold tracking-widest">
                <Ruler className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Complimentary Service</span>
              </span>
              <h3 className="font-serif text-[22px] sm:text-[24px] font-bold text-[#1C1714] leading-tight">
                Free In-Home Laser Measurement
              </h3>
              <p className="text-[13px] text-[#7C7167] leading-relaxed">
                Our decor stylists bring 500+ fabric books, wallpapers, and laser meters directly to your doorstep in Hyderabad.
              </p>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => openBookingModal('Free In-Home Measurement')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1714] hover:bg-[#C5A059] text-white text-[12px] uppercase font-bold tracking-wider shadow-md transition-all cursor-pointer"
              >
                <span>Book Free Visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Banner 3: Sofa Fabrics & Upholstery */}
          <div className="group relative rounded-3xl overflow-hidden bg-white border border-[#EAE4D9] p-7 sm:p-8 flex flex-col justify-between min-h-[320px] shadow-atelier hover:shadow-atelier-hover transition-all">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E7] border border-[#E8D5A0] text-[#B38E46] text-[10.5px] uppercase font-bold tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Textile Library</span>
              </span>
              <h3 className="font-serif text-[22px] sm:text-[24px] font-bold text-[#1C1714] leading-tight">
                Italian Bouclé &amp; Velvet Fabrics
              </h3>
              <p className="text-[13px] text-[#7C7167] leading-relaxed">
                Tested for 50,000+ Martindale rubs. Liquid-repellent, pet-friendly performance textiles in 400+ hues.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/categories/sofa-fabrics"
                className="inline-flex items-center gap-2 text-[12px] uppercase font-bold tracking-wider text-[#1C1714] hover:text-[#C5A059] transition-colors group"
              >
                <span>Explore Sofa Fabrics</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
