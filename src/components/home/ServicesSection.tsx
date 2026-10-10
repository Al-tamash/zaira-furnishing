'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ruler,
  Sparkles,
  Scissors,
  Hammer,
  Cpu,
  Globe,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { Service } from '@/lib/data/types';

const VALUE_SERVICES = [
  {
    id: 'free-measurement',
    slug: 'free-in-home-measurement',
    title: 'Free In-Home Measurement & Site Visit',
    category: 'CATEGORY 15: VALUE-ADDED SERVICE',
    shortDesc:
      'Expert technicians visit your home with laser precision tools to record millimeter dimensions, ceiling clearances, and drop heights.',
    image: '/images/services/free-home-measurement.jpg',
    icon: Ruler,
    highlights: ['Laser accurate dimensions', 'Zero obligation assessment', 'On-site technical advice'],
  },
  {
    id: 'fabric-demo',
    slug: 'doorstep-fabric-demo',
    title: 'Doorstep Fabric & Sample Demo',
    category: 'CATEGORY 15: VALUE-ADDED SERVICE',
    shortDesc:
      'Lighting alters colors dramatically. Experience 500+ fabric swatches, wallpapers, and carpets directly in your room’s ambient light.',
    image: '/images/services/fabric-samples-at-home.jpg',
    icon: Sparkles,
    highlights: ['500+ curated swatches', 'Test in your home lighting', 'Senior stylist guidance'],
  },
  {
    id: 'custom-tailoring',
    slug: 'custom-tailoring-and-stitching',
    title: 'Custom Tailoring & Stitching Services',
    category: 'CATEGORY 15: VALUE-ADDED SERVICE',
    shortDesc:
      'In-house master ateliers custom stitch curtains, cushion covers, sofa upholstery, and bed runners with weighted hems and German interlinings.',
    image: '/images/services/custom-stitching.jpg',
    icon: Scissors,
    highlights: ['Master artisan ateliers', 'French & Pinch pleat specialists', 'Weighted drapery hems'],
  },
  {
    id: 'professional-installation',
    slug: 'professional-installation',
    title: 'Professional Dust-Free Installation',
    category: 'CATEGORY 15: VALUE-ADDED SERVICE',
    shortDesc:
      'Trained technicians install curtain rods, motorized tracks, blinds, wallpapers, and wooden flooring using vacuum-suction drill equipment.',
    image: '/images/services/professional-installation.jpg',
    icon: Hammer,
    highlights: ['Dust-free drilling equipment', 'Concealed architectural hardware', 'Post-install steaming'],
  },
  {
    id: 'smart-motorization',
    slug: 'motorization-smart-home',
    title: 'Motorization & Smart Home Setup',
    category: 'CATEGORY 15: VALUE-ADDED SERVICE',
    shortDesc:
      'Complete motorized automation for drapery and shades compatible with Somfy, Alexa, Google Home, Apple HomeKit & smart home apps.',
    image: '/images/services/smart-blinds-setup.jpg',
    icon: Cpu,
    highlights: ['Somfy & smart ecosystem integration', 'Ultra-quiet motors (<35dB)', 'App & voice control scheduling'],
  },
  {
    id: 'nri-styling',
    slug: 'nri-remote-home-styling',
    title: 'NRI Remote Home Styling Service',
    category: 'CATEGORY 15: VALUE-ADDED SERVICE',
    shortDesc:
      'Dedicated remote turnkey furnishing service for NRI clients decorating homes in India with 4K video consultations and milestone updates.',
    image: '/images/services/remote-home-styling.jpg',
    icon: Globe,
    highlights: ['Dedicated relationship manager', 'Live 4K video fabric walkthroughs', 'Turnkey handover before you arrive'],
  },
  {
    id: 'corporate-furnishings',
    slug: 'corporate-institutional-furnishings',
    title: 'Corporate & Institutional Furnishings',
    category: 'CATEGORY 15: VALUE-ADDED SERVICE',
    shortDesc:
      'Bulk commercial furnishing solutions with flame-retardant (FR) drapery and heavy Martindale-rated upholstery for offices, hotels, and hospitals.',
    image: '/images/services/office-commercial-furnishing.jpg',
    icon: Building2,
    highlights: ['FR Certified textiles', 'Heavy commercial Martindale ratings', 'Bulk project execution'],
  },
  {
    id: 'warranty-after-sales',
    slug: 'warranty-after-sales',
    title: 'Warranty & After-Sales Support',
    category: 'CATEGORY 15: VALUE-ADDED SERVICE',
    shortDesc:
      'Comprehensive guarantee on installation, fabric durability, 5-year Somfy motor coverage, and lifetime architectural track alignment.',
    image: '/images/services/warranty-and-support.jpg',
    icon: ShieldCheck,
    highlights: ['Up to 5-year motor warranty', 'Lifetime track alignment guarantee', 'Dedicated maintenance support'],
  },
];

interface ServicesSectionProps {
  services?: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const { openBookingModal } = useStore();
  const [activeService, setActiveService] = useState(VALUE_SERVICES[0]);

  return (
    <section id="services" className="py-14 sm:py-20 lg:py-24 bg-[#FAF7F2] border-t border-[#EAE4D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-12 border-b border-[#EAE4D8] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE4D8] text-[#9A7B56] text-[11px] uppercase tracking-widest font-semibold mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Category 15: End-to-End Atelier Services</span>
            </div>
            <h2 className="font-serif text-[28px] sm:text-[36px] lg:text-[42px] font-medium text-[#1C1917] tracking-tight">
              Value-Added Atelier Services
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15.5px] text-[#78716C] leading-relaxed max-w-2xl">
              From complimentary in-home laser measurement to custom master tailoring and dust-free technical installation, we manage every detail seamlessly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openBookingModal('Free In-Home Measurement')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1714] text-white hover:bg-[#9A7B56] text-[13px] font-medium shadow-xs transition-all self-start md:self-end cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>Book In-Home Consultation</span>
          </button>
        </div>

        {/* ─── 8 Services Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
          {VALUE_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                onClick={() => openBookingModal(srv.title)}
                className="group rounded-3xl bg-white border border-[#EAE4D8] overflow-hidden hover:shadow-xl hover:border-[#C5A880] transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EFE9DD]">
                    <Image
                      src={srv.image}
                      alt={srv.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#2C221E] shadow-sm">
                      <Icon className="w-4 h-4 text-[#9A7B56]" />
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-5">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#9A7B56] block mb-1">
                      {srv.category}
                    </span>
                    <h3 className="font-serif text-[16px] font-semibold text-[#1C1917] mb-2 leading-snug group-hover:text-[#9A7B56] transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-[12px] text-[#57534E] leading-relaxed mb-4">
                      {srv.shortDesc}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-1.5 pt-3 border-t border-[#F2ECE1]">
                      {srv.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#6E6862]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subtle Card Action Affordance */}
                <div className="p-3.5 px-5 bg-[#FAF7F2] border-t border-[#EAE4D8] flex items-center justify-between text-[#823423] group-hover:text-[#1C1714] transition-colors">
                  <span className="text-[11.5px] font-semibold tracking-wide">Inquire Service</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
