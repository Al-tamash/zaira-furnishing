import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Navigation, ArrowRight } from 'lucide-react';
import { DbCmsContent } from '@/lib/db/types';
import { ZAIRA_WHATSAPP_DISPLAY, ZAIRA_WHATSAPP_URL } from '@/lib/whatsapp';

interface ContactVisitSectionProps {
  cmsContent?: DbCmsContent | null;
}

export function ContactVisitSection({ cmsContent }: ContactVisitSectionProps) {
  let contentParsed: any = {};
  if (cmsContent?.content) {
    try {
      contentParsed = JSON.parse(cmsContent.content);
    } catch {
      contentParsed = {};
    }
  }

  const eyebrow = contentParsed.eyebrow || 'VISIT THE SHOWROOM';
  const title = cmsContent?.title || 'Visit the Zaira Showroom';
  const subtitle =
    cmsContent?.subtitle ||
    'See fabrics, furnishings and finishes in person, and discuss your requirements with our team.';
  const address =
    contentParsed.address ||
    'Rd Number 5, Kyetian Goud Nilayam, Alkapur Twp, Puppalguda, Hyderabad, Telangana 500089';
  const rawPhone = contentParsed.phone;
  const phone = rawPhone && !rawPhone.includes('63001') ? rawPhone : ZAIRA_WHATSAPP_DISPLAY;
  const email = contentParsed.email || 'concierge@zairafurnishing.com';
  const hours = contentParsed.hours || 'Mon–Sat 10:30 AM–8:30 PM · Sunday by appointment';
  const showroomImage = cmsContent?.image_url || '/images/hero/living_room.jpg';
  const mapsUrl =
    contentParsed.maps_query ||
    'https://www.google.com/maps/search/?api=1&query=Zaira+Furnishing,+Rd+Number+5,+Kyetian+Goud+Nilayam,+Alkapur+Twp,+Puppalguda,+Hyderabad,+Telangana+500089';

  return (
    <section id="contact" className="py-12 sm:py-18 lg:py-24 bg-[#FDFBF7] border-t border-[#EAE4D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">

          {/* ─── LEFT: Relevant Showroom Image ─── */}
          <div className="lg:col-span-6 w-full">
            <div className="relative aspect-[16/11] sm:aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#F4EFE6] border border-[#EAE4D9] shadow-atelier">
              <Image
                src={showroomImage}
                alt="Zaira Furnishing interior showroom space"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* ─── RIGHT: Showroom Invitation & Compact Details ─── */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            {/* Small Eyebrow */}
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[#C5A059] font-bold block mb-2 sm:mb-2.5">
              {eyebrow}
            </span>

            {/* Main Heading */}
            <h2 className="font-serif text-[24px] sm:text-[34px] lg:text-[40px] text-[#1C1714] font-normal tracking-tight mb-2 sm:mb-3 leading-[1.2]">
              {title}
            </h2>

            {/* Short Supporting Text */}
            <p className="text-[13px] sm:text-[15px] text-[#78716C] leading-relaxed mb-5 sm:mb-7 max-w-lg">
              {subtitle}
            </p>

            {/* Compact Contact Information */}
            <div className="space-y-3.5 sm:space-y-4 mb-6 sm:mb-8 border-y border-[#EAE4D9] py-4 sm:py-6">
              {/* Location */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9.5px] uppercase tracking-[0.16em] text-[#8C827A] font-semibold mb-0.5">
                    Location
                  </span>
                  <address className="not-italic text-[12.5px] sm:text-[13.5px] text-[#1C1714] leading-relaxed">
                    {address}
                  </address>
                </div>
              </div>

              {/* Contact Grid: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-0.5">
                {/* Phone */}
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <Phone className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[9.5px] uppercase tracking-[0.16em] text-[#8C827A] font-semibold mb-0.5">
                      Phone &amp; WhatsApp
                    </span>
                    <a
                      href={ZAIRA_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat with Zaira Furnishing on WhatsApp"
                      className="text-[12.5px] sm:text-[13.5px] font-bold text-[#1C1714] hover:text-[#C5A059] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-1 rounded-xs"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <Mail className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[9.5px] uppercase tracking-[0.16em] text-[#8C827A] font-semibold mb-0.5">
                      Email
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-[12.5px] sm:text-[13.5px] text-[#1C1714] hover:text-[#C5A059] transition-colors break-all"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-2.5 sm:gap-3 pt-0.5">
                <Clock className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9.5px] uppercase tracking-[0.16em] text-[#8C827A] font-semibold mb-0.5">
                    Showroom Hours
                  </span>
                  <p className="text-[12.5px] sm:text-[13.5px] text-[#1C1714] leading-relaxed">
                    {hours}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: Get Directions & Contact Us */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-full bg-[#1C1714] hover:bg-[#C5A059] text-white hover:text-[#1C1714] text-[12px] sm:text-[13px] font-bold uppercase tracking-wider transition-all shadow-md group active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-[#C5A059] group-hover:text-[#1C1714]" />
                <span>Get Directions</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3 sm:py-3.5 rounded-full border border-[#C5A059] hover:bg-[#C5A059]/10 text-[#1C1714] text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider transition-colors group active:scale-95"
              >
                <span>Contact Concierge</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
