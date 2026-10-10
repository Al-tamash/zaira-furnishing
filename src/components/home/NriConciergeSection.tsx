'use client';

import React from 'react';
import Image from 'next/image';
import {
  Globe,
  Video,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Plane,
  Clock,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_NUMBER } from '@/lib/whatsapp';

const NRI_BENEFITS = [
  {
    icon: Video,
    title: '4K Live Video Consultations',
    description: 'Walk through our 2,000+ fabric swatch library over scheduled Zoom or WhatsApp video calls tailored to your time zone (US EST/PST, UK, Dubai, Sydney).',
  },
  {
    icon: CheckCircle2,
    title: 'Architect & Site Coordination',
    description: 'Our laser measurement team visits your villa or flat in Hyderabad, coordinates with your interior designer, and checks pelmets, drops, and electrical lines.',
  },
  {
    icon: MessageSquare,
    title: 'Milestone Video Walkthroughs',
    description: 'Receive weekly video logs of your curtains being stitched, hemmed with weighted zinc inserts, and steam-hung on site.',
  },
  {
    icon: Plane,
    title: 'Turnkey Handover Before You Land',
    description: 'Walk into a completely furnished, dust-free home with motorized shades synced, curtains pressed, and beds dressed before your flight touches down.',
  },
];

export function NriConciergeSection() {
  const { openBookingModal } = useStore();

  const nriWhatsappText = encodeURIComponent(
    'Hello Zaira Concierge, I am an NRI homeowner and would like to discuss furnishing my home in Hyderabad. Please schedule a video consultation.'
  );

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-[#FAF7F2] border-t border-[#EAE4D8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Story & CTAs (7 cols) */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9A7B56]/10 border border-[#9A7B56]/20 text-[#9A7B56] text-[11px] uppercase tracking-widest font-semibold mb-3">
              <Globe className="w-3.5 h-3.5 text-[#9A7B56]" />
              <span>Global NRI Home Concierge</span>
            </div>

            <h2 className="font-serif text-[28px] sm:text-[38px] lg:text-[44px] font-medium text-[#1C1917] tracking-tight leading-[1.15]">
              Decorating Your Hyderabad Home from Across the Globe?
            </h2>

            <p className="mt-3.5 text-[14px] sm:text-[16px] text-[#57534E] leading-relaxed max-w-xl">
              Living in the USA, UK, UAE, Australia or Singapore? Zaira offers a seamless turnkey remote furnishing service. From laser measurements to 4K video textile styling and turnkey installation before your flight arrives.
            </p>

            {/* 4 Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {NRI_BENEFITS.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-[#EAE4D8] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8] flex items-center justify-center text-[#2C221E] mb-3">
                        <Icon className="w-4 h-4 text-[#9A7B56]" />
                      </div>
                      <h4 className="font-serif text-[15px] font-semibold text-[#1C1917] mb-1">
                        {b.title}
                      </h4>
                      <p className="text-[12px] text-[#6E6862] leading-relaxed">
                        {b.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dual Actions: 1 Primary + 1 Secondary Hierarchy */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8">
              <button
                type="button"
                onClick={() => openBookingModal('NRI Remote Home Styling')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#1C1714] text-white hover:bg-[#2C221E] text-[13px] font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>Schedule Video Consultation</span>
              </button>

              <a
                href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${nriWhatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#25D366]/70 text-[#1C1714] hover:bg-[#25D366]/10 text-[13px] font-medium transition-all"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                <span>WhatsApp NRI Desk</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#EFE9DD]">
              <Image
                src="/images/hero/living_room.jpg"
                alt="Luxury living room furnished remotely for NRI homeowner"
                fill
                className="object-cover object-center"
              />

              {/* Floating Testimonial Pill */}
              <div className="absolute inset-x-4 bottom-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE4D8] shadow-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[#D4AF37] text-[12px]">★★★★★</span>
                  <span className="text-[11px] font-semibold text-[#2C221E]">
                    Remote Villa Handover
                  </span>
                </div>
                <p className="text-[12px] text-[#57534E] leading-snug italic">
                  “We furnished our entire 4BHK villa at My Home Bhooja while staying in California. The video swatch demos and timely handover were impeccable!”
                </p>
                <span className="block text-[10.5px] font-semibold text-[#1C1917] mt-1.5">
                  — Rajesh & Sravani K., San Jose, CA
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
