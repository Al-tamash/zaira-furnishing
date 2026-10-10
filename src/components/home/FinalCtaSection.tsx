'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { CloudflareImage } from '@/components/ui/CloudflareImage';
import { useStore } from '@/lib/context/StoreContext';

export function FinalCtaSection() {
  const { openBookingModal } = useStore();

  return (
    <section className="relative py-20 sm:py-24 overflow-hidden bg-[#1C1917] text-[#FAF7F2]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 opacity-25">
        <CloudflareImage
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=80"
          alt="Zaira Furnishing Interior Atmosphere"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/70 to-[#1C1917]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-[34px] sm:text-[46px] md:text-[52px] font-medium text-white tracking-tight mb-5 leading-tight">
          Ready to Furnish Your Home?
        </h2>
        <p className="text-[16px] sm:text-[18px] text-[#FAF7F2]/85 font-light leading-relaxed max-w-lg mx-auto mb-9">
          Explore our products or book a free visit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/categories"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-[12px] uppercase tracking-[0.18em] font-medium bg-[#FAF7F2] text-[#1C1917] hover:bg-[#7D5E38] hover:text-white rounded-full transition-all duration-300 shadow-md group"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={() => openBookingModal('Free In-Home Measurement')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-[12px] uppercase tracking-[0.18em] font-medium bg-white/10 text-white border border-white/40 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-xs cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#C4B9A1]" />
            <span>Book a Free Visit</span>
          </button>
        </div>
      </div>
    </section>
  );
}
