'use client';

import React from 'react';
import {
  Navigation,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ZAIRA_SHOWROOM_360_TOUR_EMBED_URL,
  ZAIRA_SHOWROOM_ADDRESS,
  ZAIRA_SHOWROOM_TIMINGS,
  ZAIRA_SHOWROOM_PHONE,
  ZAIRA_SHOWROOM_MAPS_URL,
  ZAIRA_WHATSAPP_NUMBER,
} from '@/lib/whatsapp';

interface ShowroomVirtualTourProps {
  title?: string;
  subtitle?: string;
  className?: string;
  showDetailsBar?: boolean;
}

export function ShowroomVirtualTour({
  title = 'Step Inside Our Puppalguda Flagship Atelier',
  subtitle = 'Explore our Hyderabad experience center in 360 degrees. Browse full drapery drops, motorized curtain automation setups, wallpaper collections, and fabric libraries.',
  className = '',
  showDetailsBar = true,
}: ShowroomVirtualTourProps) {
  const whatsappAppointmentUrl = `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hello Zaira Furnishing, I would like to schedule an in-person visit to your Puppalguda showroom.'
  )}`;

  return (
    <section className={`w-full ${className}`}>
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="max-w-2xl">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#9A7B56] font-semibold block mb-2">
            Flagship Experience Center &bull; Puppalguda
          </span>
          <h2 className="font-serif text-[26px] sm:text-[34px] lg:text-[38px] text-[#1C1714] font-medium tracking-tight leading-[1.2]">
            {title}
          </h2>
          <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-[#57534E] leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Action Buttons Top Right (Desktop) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <a
            href={ZAIRA_SHOWROOM_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-white border border-[#EBE7DF] hover:border-[#1C1714] text-[#1C1714] text-[12.5px] font-medium shadow-2xs transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-[#9A7B56]" />
            <span>Open in Google Maps</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#78716C]" />
          </a>
          <a
            href={whatsappAppointmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12.5px] font-medium shadow-xs transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Schedule Visit</span>
          </a>
        </div>
      </div>

      {/* 360 Embed Container - Clean architectural frame without artificial badges */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#E7E2D8] bg-[#F4EFE6] shadow-sm">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] w-full min-h-[360px] sm:min-h-[480px]">
          <iframe
            src={ZAIRA_SHOWROOM_360_TOUR_EMBED_URL}
            title="Zaira Furnishing Puppalguda Flagship Showroom 360-Degree Virtual Walkthrough"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Bottom Metadata & Direction Bar */}
        {showDetailsBar && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#EAE4D9] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-[12.5px] text-[#57534E]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#9A7B56] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {ZAIRA_SHOWROOM_ADDRESS}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9A7B56] shrink-0" />
                <span>{ZAIRA_SHOWROOM_TIMINGS}</span>
              </div>
            </div>

            {/* Direct CTA Links */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F0EDE6]">
              <a
                href={ZAIRA_SHOWROOM_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E7E2D8] text-[#1C1714] text-[12px] font-medium transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#9A7B56]" />
                <span>Directions</span>
              </a>

              <a
                href={`tel:${ZAIRA_SHOWROOM_PHONE.replace(/\s+/g, '')}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E7E2D8] text-[#1C1714] text-[12px] font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#9A7B56]" />
                <span>Call Showroom</span>
              </a>

              <a
                href={whatsappAppointmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12px] font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Book Visit</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
