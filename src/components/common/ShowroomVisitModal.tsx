'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Sparkles,
  MessageCircle,
  Ruler,
  Building2,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import {
  ZAIRA_SHOWROOM_ADDRESS,
  ZAIRA_SHOWROOM_TIMINGS,
  ZAIRA_SHOWROOM_PHONE,
  ZAIRA_SHOWROOM_MAPS_URL,
  ZAIRA_WHATSAPP_NUMBER,
} from '@/lib/whatsapp';

export function ShowroomVisitModal() {
  const { isStoreModalOpen, setIsStoreModalOpen, openBookingModal } = useStore();

  if (!isStoreModalOpen) return null;

  const handleBookHomeVisit = () => {
    setIsStoreModalOpen(false);
    openBookingModal('Free In-Home Measurement');
  };

  const showroomWhatsAppUrl = `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hello Zaira Furnishing, I am planning to visit your Puppalguda showroom. Please share current visiting details and location directions.'
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => setIsStoreModalOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#EAE4D8] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Top Banner */}
        <div className="bg-[#1C1714] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={() => setIsStoreModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-[#A8A29E] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10.5px] font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Puppalguda, Hyderabad Showroom</span>
          </div>

          <h3 className="font-serif text-[22px] sm:text-[24px] font-medium text-white tracking-tight">
            Visit Zaira Furnishing
          </h3>
          <p className="text-[12.5px] text-[#D5CCBA] mt-1 leading-relaxed">
            Touch 500+ luxury fabrics, experience motorized drapery, and consult directly with our senior styling team.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Address & Hours Cards */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EAE4D8] shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#FAF3E6] text-[#823423] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                  Showroom Address
                </p>
                <p className="text-[13.5px] font-semibold text-[#1C1714] mt-0.5">
                  {ZAIRA_SHOWROOM_ADDRESS}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-[#EAE4D8] shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#FAF3E6] text-[#823423] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#78716C]">
                    Timings
                  </p>
                  <p className="text-[12px] font-semibold text-[#1C1714] mt-0.5 leading-tight">
                    {ZAIRA_SHOWROOM_TIMINGS}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-[#EAE4D8] shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#FAF3E6] text-[#823423] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#78716C]">
                    Concierge Line
                  </p>
                  <a
                    href={`tel:${ZAIRA_SHOWROOM_PHONE}`}
                    className="text-[12px] font-semibold text-[#823423] hover:underline mt-0.5 block leading-tight"
                  >
                    {ZAIRA_SHOWROOM_PHONE}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Showroom Experience Highlights */}
          <div className="p-3.5 rounded-2xl bg-[#F4EFEA] border border-[#E2D8CC] text-[12px] space-y-1.5 text-[#57534E]">
            <p className="font-bold text-[#1C1714] text-[12px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              In-Store Experience:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                Live Somfy Motor Demo
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                100% Blackout Test Pods
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                500+ Curated Swatch Books
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                Take-Home Fabric Samples
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <a
              href={ZAIRA_SHOWROOM_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl font-bold text-[12px] uppercase tracking-wider bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#D4AF37]" />
              <span>Get Directions on Google Maps</span>
            </a>

            <Link
              href="/contact#tour"
              onClick={() => setIsStoreModalOpen(false)}
              className="w-full h-10 rounded-xl font-semibold text-[11.5px] uppercase tracking-wider bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E7E2D8] text-[#1C1714] transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#9A7B56]" />
              <span>Explore 360° Showroom Tour</span>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={showroomWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 rounded-xl font-semibold text-[11px] uppercase tracking-wider bg-white border border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/5 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
                <span>WhatsApp Store</span>
              </a>

              <button
                type="button"
                onClick={handleBookHomeVisit}
                className="h-10 rounded-xl font-semibold text-[11px] uppercase tracking-wider bg-[#FAF3E6] border border-[#D4AF37]/50 text-[#823423] hover:bg-[#F3E7CF] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-[#823423]" />
                <span>Book Home Visit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
