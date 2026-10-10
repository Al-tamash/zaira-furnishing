'use client';

import React, { useState, useEffect } from 'react';
import {
  Ruler,
  Sparkles,
  MessageSquare,
  Phone,
  Calendar,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_NUMBER, ZAIRA_WHATSAPP_DISPLAY, ZAIRA_WHATSAPP_URL } from '@/lib/whatsapp';

export function FloatingConciergeBar() {
  const { openBookingModal } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Concierge & Booking Actions"
      className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 animate-in fade-in duration-300 pointer-events-auto"
    >
      {/* Book Measurement Floating Pill */}
      <button
        type="button"
        onClick={() => openBookingModal('Free In-Home Measurement')}
        className="group flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#1C1714] text-white hover:bg-[#9A7B56] border border-[#9A7B56]/40 shadow-[0_8px_24px_rgba(28,23,20,0.35)] transition-all duration-300 hover:scale-105 cursor-pointer"
        aria-label="Book Free In-Home Measurement"
      >
        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#D4AF37] group-hover:rotate-12 transition-transform">
          <Ruler className="w-3.5 h-3.5" />
        </span>
        <div className="flex flex-col text-left">
          <span className="text-[11.5px] sm:text-[12.5px] font-semibold leading-tight tracking-wide">
            Book Free Visit
          </span>
          <span className="text-[9px] text-[#C4B9A1] leading-none hidden xs:inline">
            Laser Measurement & Demos
          </span>
        </div>
      </button>

      {/* WhatsApp Stylist Floating Action */}
      <a
        href={ZAIRA_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Zaira Stylist on WhatsApp"
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#20BA5C] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-110 cursor-pointer"
        title="Chat with Atelier Stylist on WhatsApp"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
      </a>
    </aside>
  );
}
