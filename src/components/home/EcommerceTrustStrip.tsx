'use client';

import React from 'react';
import {
  Ruler,
  Scissors,
  ShieldCheck,
  Hammer,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

const PILLARS = [
  {
    icon: Ruler,
    title: 'Free In-Home Measurement',
    desc: 'Laser mm-accurate dimensions & drop clearance checks at your doorstep.',
  },
  {
    icon: Sparkles,
    title: '500+ Swatches at Home',
    desc: 'Assess rich fabrics, wallpapers & wood finishes live in your natural room light.',
  },
  {
    icon: Scissors,
    title: 'Master Atelier Tailoring',
    desc: 'Handcrafted French pleats, double-lined interlinings & weighted drapery hems.',
  },
  {
    icon: Hammer,
    title: 'Dust-Free Installation',
    desc: 'Certified technical crews using vacuum-suction drill equipment keep floors clean.',
  },
  {
    icon: ShieldCheck,
    title: '5-Year Mechanism Warranty',
    desc: 'Comprehensive coverage on Somfy motorized tracks & lifetime hardware tuning.',
  },
];

export function EcommerceTrustStrip() {
  const { openBookingModal } = useStore();

  return (
    <section className="py-10 bg-[#FAF7F2] border-y border-[#EAE4D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-left">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className={`flex items-start gap-3.5 p-4 sm:p-0 bg-white sm:bg-transparent rounded-2xl sm:rounded-none border sm:border-none border-[#EAE4D8] shadow-2xs sm:shadow-none ${
                  idx === 4 ? 'sm:col-span-2 md:col-span-1' : ''
                }`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FAF7F2] sm:bg-white border border-[#EAE4D8] shadow-xs flex items-center justify-center text-[#2C221E] shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#9A7B56]" />
                </div>
                <div>
                  <h4 className="font-serif text-[13.5px] sm:text-[14px] font-semibold text-[#1C1917] leading-snug">
                    {p.title}
                  </h4>
                  <p className="text-[11px] sm:text-[11.5px] text-[#78716C] mt-0.5 sm:mt-1 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
