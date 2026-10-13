import React from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react';
import { DbCmsContent } from '@/lib/db/types';
import {
  ZAIRA_WHATSAPP_DISPLAY,
  ZAIRA_WHATSAPP_URL,
  ZAIRA_SHOWROOM_ADDRESS,
  ZAIRA_SHOWROOM_TIMINGS,
  ZAIRA_SHOWROOM_MAPS_URL,
  ZAIRA_SHOWROOM_360_TOUR_EMBED_URL,
  ZAIRA_WHATSAPP_NUMBER,
} from '@/lib/whatsapp';

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

  const title = cmsContent?.title || 'Visit the Zaira Showroom';
  const subtitle =
    cmsContent?.subtitle ||
    'Touch and feel 500+ curated drapery fabrics in natural light, test live motorized curtain tracks, and inspect custom upholstery finishes in person.';
  const address = contentParsed.address || ZAIRA_SHOWROOM_ADDRESS;
  const hours = contentParsed.hours || ZAIRA_SHOWROOM_TIMINGS;
  const phone = ZAIRA_WHATSAPP_DISPLAY;
  const mapsUrl = contentParsed.maps_query || ZAIRA_SHOWROOM_MAPS_URL;

  const whatsappVisitUrl = `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hello Zaira Furnishing, I would like to visit your Puppalguda showroom to inspect fabrics and drapery setups.'
  )}`;

  return (
    <section id="contact" className="py-14 sm:py-20 lg:py-24 bg-[#FAF7F2] border-t border-[#EAE4D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* ─── LEFT: 360° Showroom Frame (7 cols) ─── */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full min-h-[380px] sm:min-h-[460px] rounded-2xl overflow-hidden border border-[#E7E2D8] bg-[#F2EDE4] shadow-sm">
              <iframe
                src={ZAIRA_SHOWROOM_360_TOUR_EMBED_URL}
                title="Zaira Furnishing Puppalguda Flagship Showroom 360-Degree Interactive Virtual Walkthrough"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Clean location caption under frame */}
            <div className="flex items-center justify-between text-[12px] text-[#78716C] mt-3 px-1">
              <span>Puppalguda Flagship Atelier &bull; Alkapur Township, Hyderabad</span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1C1714] font-medium hover:underline"
              >
                <span>View on Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* ─── RIGHT: Authentic Atelier Invitation & Information (5 cols) ─── */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9A7B56] font-semibold block mb-2.5">
              Experience Center &bull; Hyderabad
            </span>

            <h2 className="font-serif text-[28px] sm:text-[36px] text-[#1C1714] font-medium tracking-tight leading-tight mb-3">
              {title}
            </h2>

            <p className="text-[14px] text-[#57534E] leading-relaxed mb-6">
              {subtitle}
            </p>

            {/* Atelier Info Box */}
            <div className="space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE4D8] mb-6 shadow-2xs">
              {/* Showroom Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-[#9A7B56] shrink-0 mt-0.5" />
                <div className="text-[13px]">
                  <p className="font-medium text-[#1C1714] leading-relaxed">
                    {address}
                  </p>
                  <p className="text-[12px] text-[#78716C] mt-0.5">
                    10 mins from Financial District &bull; Complimentary parking available
                  </p>
                </div>
              </div>

              {/* Showroom Timings */}
              <div className="flex items-start gap-3 pt-3.5 border-t border-[#F0EDE6]">
                <Clock className="w-4.5 h-4.5 text-[#9A7B56] shrink-0 mt-0.5" />
                <div className="text-[13px]">
                  <p className="font-medium text-[#1C1714]">
                    {hours}
                  </p>
                  <p className="text-[12px] text-[#78716C] mt-0.5">
                    Sunday visits arranged by prior appointment
                  </p>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-3 pt-3.5 border-t border-[#F0EDE6]">
                <Phone className="w-4.5 h-4.5 text-[#9A7B56] shrink-0 mt-0.5" />
                <div className="text-[13px]">
                  <a
                    href={ZAIRA_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#1C1714] hover:underline"
                  >
                    {phone}
                  </a>
                  <p className="text-[12px] text-[#78716C] mt-0.5">
                    Direct line for site visits, quotes, and directions
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[13px] font-medium transition-colors shadow-xs"
              >
                <Navigation className="w-4 h-4 text-[#D4AF37]" />
                <span>Get Driving Directions</span>
              </a>

              <a
                href={whatsappVisitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E7E2D8] text-[#1C1714] text-[13px] font-medium transition-colors shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
