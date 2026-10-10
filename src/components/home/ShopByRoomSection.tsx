'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

const ROOM_ITEMS = [
  {
    id: 'living-room',
    title: 'Living Room',
    subtitle: 'Ripple Fold Curtains, Bouclé Sofas & Artisan Rugs',
    href: '/categories/curtains',
    image: '/images/hero/living_room.jpg',
    tag: 'Signature Space',
  },
  {
    id: 'master-bedroom',
    title: 'Master Bedroom',
    subtitle: 'Blackout Drapes, Spine-Care Mattresses & Bed Linen',
    href: '/categories/mattresses-sleep-systems',
    image: '/images/hero/bedroom.jpg',
    tag: 'Rest & Wellness',
  },
  {
    id: 'dining-room',
    title: 'Dining & Formal Lounge',
    subtitle: 'Daylight Sheers, European Oak Parquet & Upholstery',
    href: '/categories/curtains/sheer',
    image: '/images/hero/curtains.jpg',
    tag: 'Hospitality',
  },
  {
    id: 'balcony-patio',
    title: 'Balcony & Outdoor Patio',
    subtitle: 'Monsoon PVC Blinds & Weatherproof WPC Decking',
    href: '/categories/blinds/balcony-pvc',
    image: '/images/hero/flooring.jpg',
    tag: 'All-Weather',
  },
];

export function ShopByRoomSection() {
  return (
    <section className="py-12 sm:py-18 bg-white border-b border-[#EAE4D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-[#F0EBE1] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE4D8] text-[#9A7B56] text-[10.5px] uppercase tracking-widest font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ROOM INSPIRATION</span>
            </div>
            <h2 className="font-serif text-[26px] sm:text-[34px] font-semibold text-[#1C1917] tracking-tight">
              Furnish by Room & Space
            </h2>
            <p className="text-[13px] sm:text-[14.5px] text-[#78716C] mt-1">
              Explore bespoke combinations curated specifically for each living zone.
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#2C221E] hover:text-[#9A7B56] transition-colors group shrink-0"
          >
            <span>Explore All Spaces</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROOM_ITEMS.map((room) => (
            <Link
              key={room.id}
              href={room.href}
              className="group relative flex flex-col rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#EAE4D8] hover:border-[#D4AF37] hover:shadow-xl transition-all duration-500"
            >
              {/* Image Container with Zoom */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EFE9DD]">
                <Image
                  src={room.image}
                  alt={room.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Tag */}
                <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-[#2C221E]/90 backdrop-blur-xs text-white text-[9.5px] uppercase font-bold tracking-wider">
                  {room.tag}
                </div>

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Room Info Overlaid at Bottom */}
                <div className="absolute inset-x-4 bottom-4 text-white z-10">
                  <h3 className="font-serif text-[20px] font-semibold text-white leading-tight mb-1 group-hover:text-[#D4AF37] transition-colors">
                    {room.title}
                  </h3>
                  <p className="text-[12px] text-[#EAE4D8] line-clamp-2 font-light leading-snug mb-2">
                    {room.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                    <span>Shop this Room</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
