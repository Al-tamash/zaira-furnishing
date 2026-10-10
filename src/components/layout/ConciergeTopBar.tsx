'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Sparkles,
  Phone,
  MessageSquare,
  Globe,
  Clock,
  Ruler,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_DISPLAY, ZAIRA_WHATSAPP_URL } from '@/lib/whatsapp';

export function ConciergeTopBar() {
  const { openBookingModal, openStoreModal } = useStore();

  return (
    <div className="hidden sm:block bg-[#1E1714] text-white border-b border-[#3D302A] text-[11px] sm:text-[11.5px] py-1.5 px-3 sm:px-6 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Hyderabad Showroom & Directions */}
        <div className="flex items-center gap-2 text-[#E2D9CF] min-w-0">
          <button
            type="button"
            onClick={openStoreModal}
            className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
            title="Click to view Showroom Address & Timings"
          >
            <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span className="font-semibold text-white tracking-wide shrink-0">
              Showroom:
            </span>
            <span className="text-[#E8E3D8] underline underline-offset-2 decoration-[#D4AF37]/50 hover:text-[#D4AF37] truncate text-[10.5px] sm:text-[11.5px]">
              Puppalguda · Alkapur Twp, Hyderabad (Directions)
            </span>
          </button>
        </div>

        {/* Center: Value Highlight */}
        <div className="hidden lg:flex items-center gap-2 text-[#D4AF37]">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span className="text-[#FAF7F2] font-medium tracking-wide">
            500+ Fabric Sample Books Brought Directly To Your Home
          </span>
        </div>

        {/* Right: Direct Concierge Touchpoints */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a
            href={`tel:${ZAIRA_WHATSAPP_DISPLAY}`}
            className="hidden md:inline-flex items-center gap-1.5 text-[#E2D9CF] hover:text-[#D4AF37] transition-colors font-medium"
            title="Call Atelier Concierge"
          >
            <Phone className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[#E8E3D8]">{ZAIRA_WHATSAPP_DISPLAY}</span>
          </a>

          <a
            href={ZAIRA_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#25D366] hover:text-white transition-colors font-medium"
            title="Chat with Atelier Stylist on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-current" />
            <span className="text-[#FAF7F2] font-semibold">
              WhatsApp Concierge
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
