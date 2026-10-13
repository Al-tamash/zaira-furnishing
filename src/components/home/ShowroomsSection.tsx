'use client';

import React from 'react';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Sparkles,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_DISPLAY } from '@/lib/whatsapp';

const SHOWROOMS = [
  {
    id: 'puppalguda-flagship',
    name: 'Puppalguda Flagship Atelier',
    locality: 'Shop No. 5, Alkapur Twp, Puppalguda',
    description: 'Our physical experience center featuring live motorized drapery tracks, 500+ fabric swatches, designer wallpapers, and premium sleep systems.',
    image: '/images/hero/living_room.jpg',
    features: ['Curtain & Drapery Atelier', 'Live Motorized Tracks Demo', 'Wallpaper & Fabric Library'],
    hours: 'Mon–Sat: 10:30 AM – 8:30 PM · Sun by Appointment',
    mapsUrl: 'https://maps.google.com/?q=Zaira+Furnishing+Alkapur+Township+Puppalguda+Hyderabad',
  },
  {
    id: 'in-home-consultation',
    name: 'Doorstep Laser Measurement',
    locality: 'All Across Hyderabad',
    description: 'Cannot visit in person? Our master stylists bring 500+ curated fabric swatches, laser measurement tools, and styling catalogs straight to your home.',
    image: '/images/hero/curtains.jpg',
    features: ['Laser Millimeter Accuracy', 'Ambient Room Lighting Checks', 'Banjara, Jubilee, Gachibowli & Beyond'],
    hours: 'Flexible Slots: 10:00 AM – 8:00 PM',
    mapsUrl: 'https://maps.google.com/?q=Zaira+Furnishing+Alkapur+Township+Puppalguda+Hyderabad',
  },
  {
    id: 'nri-concierge',
    name: 'NRI & Turnkey Home Desk',
    locality: 'Global & Virtual Styling',
    description: 'Dedicated concierge for overseas homeowners furnishing villas and luxury apartments in Hyderabad with 4K video walkthroughs and turnkey delivery.',
    image: '/images/hero/bedroom.jpg',
    features: ['4K Video Fabric Walkthroughs', 'Turnkey Site Coordination', 'Transparent WhatsApp Updates'],
    hours: 'Global Timezone Coordination',
    mapsUrl: 'https://maps.google.com/?q=Zaira+Furnishing+Alkapur+Township+Puppalguda+Hyderabad',
  },
];

export function ShowroomsSection() {
  const { openBookingModal } = useStore();

  return (
    <section id="showrooms" className="py-14 sm:py-20 bg-[#FDFBF7] border-t border-[#EAE4D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-12 border-b border-[#EAE4D9] gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] text-[11px] uppercase tracking-widest font-semibold mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Hyderabad Flagship Atelier</span>
            </div>
            <h2 className="font-serif text-[28px] sm:text-[36px] lg:text-[42px] font-normal text-[#1C1714] tracking-tight">
              Experience the Zaira Atelier
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15.5px] text-[#78716C] leading-relaxed max-w-xl">
              Visit our Puppalguda flagship showroom in person or have our technical stylists bring 500+ fabric sample books directly to your doorstep.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openBookingModal('Showroom VIP Consultation')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1714] text-white hover:bg-[#C5A059] hover:text-[#1C1714] text-[13px] font-medium shadow-md transition-all self-start md:self-end cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>Book Private Walkthrough</span>
          </button>
        </div>

        {/* Showrooms Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 pt-10">
          {SHOWROOMS.map((showroom) => (
            <div
              key={showroom.id}
              className="group rounded-3xl bg-white border border-[#EAE4D9] overflow-hidden hover:shadow-atelier-hover hover:border-[#C5A059] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo Preview */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F4EFE6]">
                  <Image
                    src={showroom.image}
                    alt={showroom.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#1C1714]/90 backdrop-blur-xs text-[#FDFBF7] text-[10.5px] uppercase font-bold tracking-wider border border-[#C5A059]/40">
                    {showroom.name}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#C5A059] mb-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{showroom.locality}</span>
                  </div>

                  <p className="text-[12.5px] text-[#57534E] leading-relaxed mt-2.5 mb-4">
                    {showroom.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-3 border-t border-[#EAE4D9] mb-4">
                    {showroom.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11.5px] text-[#1C1714]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-2 text-[11px] text-[#78716C] pt-2 border-t border-[#EAE4D9]">
                    <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C5A059]" />
                    <span>{showroom.hours}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Directions (Action) & Call (Utility) */}
              <div className="p-3.5 bg-[#FDFBF7] border-t border-[#EAE4D9] flex items-center justify-between gap-2.5">
                <a
                  href={showroom.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FAF5EE] border border-[#D5CCBA] text-[#1C1714] hover:bg-[#F3ECE0] text-[11.5px] font-semibold transition-colors shadow-2xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#823423]" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={`tel:${ZAIRA_WHATSAPP_DISPLAY.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-[#D5CCBA] bg-white text-[#57534E] hover:text-[#1C1714] hover:bg-[#FAF7F2] text-[11.5px] font-medium transition-colors shadow-2xs"
                  title="Call Zaira Furnishing"
                >
                  <Phone className="w-3.5 h-3.5 text-[#823423]" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
