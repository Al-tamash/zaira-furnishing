import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Ruler,
  Sparkles,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { ZAIRA_SHOWROOM_PHONE, ZAIRA_WHATSAPP_NUMBER, ZAIRA_EMAIL } from '@/lib/whatsapp';

export const metadata = {
  title: 'About Zaira Furnishing | Hyderabad Showroom & Services',
  description:
    'Learn about Zaira Furnishing in Puppalguda, Hyderabad: Made-to-measure window curtains, motorized blinds, sofa fabrics, and in-home consultation.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF7F2] text-[#1C1917] py-10 sm:py-16 selection:bg-[#9A7B56] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── 1. HERO HEADER ─── */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold block mb-2">
            About Zaira Furnishing
          </span>
          <h1 className="font-serif text-[34px] sm:text-[46px] lg:text-[50px] text-[#1C1917] font-medium tracking-tight mb-4 leading-tight">
            Curating Hyderabad Homes with Made-to-Measure Furnishings
          </h1>
          <p className="text-[15px] sm:text-[16.5px] text-[#78716C] leading-relaxed max-w-2xl mx-auto font-normal">
            Based in Puppalguda, Hyderabad, we help homeowners and interior designers select, stitch, and install bespoke curtains, automated blinds, sofa fabrics, and wallpapers.
          </p>
        </div>

        {/* ─── 2. STORY SPLIT SECTION ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mb-16 sm:mb-24">
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl bg-[#F0EAE1] border border-[#EAE3D6] shadow-sm">
              <Image
                src="/images/about/about-main-living.jpg"
                alt="Zaira Furnishing Living Room Setup"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#9A7B56] font-semibold block">
              Our Puppalguda Studio &amp; Doorstep Service
            </span>
            <h2 className="font-serif text-[26px] sm:text-[32px] text-[#1C1917] font-medium leading-snug">
              Fabric Curation in Your Home&apos;s Natural Light
            </h2>
            <p className="text-[14px] sm:text-[14.5px] text-[#57534E] leading-relaxed">
              Lighting makes all the difference when choosing curtain or upholstery fabrics. A shade that looks bright under showroom spotlights can look completely different in your living room or bedroom.
            </p>
            <p className="text-[14px] sm:text-[14.5px] text-[#57534E] leading-relaxed">
              That is why our specialists bring 500+ curated fabric catalogues directly to your doorstep across Hyderabad — including Kokapet, Gachibowli, Financial District, Jubilee Hills, and Tellapur.
            </p>
            <p className="text-[14px] sm:text-[14.5px] text-[#57534E] leading-relaxed">
              We take precise laser measurements, inspect track drop clearances, and guide you on pleat styles like ripple fold and double pinch pleats before custom tailoring each drape in our workshop.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-semibold text-[#1C1917] hover:text-[#9A7B56] transition-colors"
              >
                <span>View Our Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 3. THREE CORE PILLARS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 py-12 sm:py-16 border-t border-b border-[#EAE4D8] mb-16 sm:mb-20">
          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-[#EAE4D8] shadow-2xs">
            <div className="w-11 h-11 bg-[#FAF7F2] rounded-xl border border-[#E7E2D8] flex items-center justify-center text-[#9A7B56] mb-5">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-[19px] sm:text-[20px] text-[#1C1917] font-medium mb-2.5">
              500+ Fabric Catalogues
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#78716C] leading-relaxed">
              Natural washed linens, blackout textures, Italian bouclés, velvets, and sheer drapes sourced for durability and tactile quality.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-[#EAE4D8] shadow-2xs">
            <div className="w-11 h-11 bg-[#FAF7F2] rounded-xl border border-[#E7E2D8] flex items-center justify-center text-[#9A7B56] mb-5">
              <Ruler className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-[19px] sm:text-[20px] text-[#1C1917] font-medium mb-2.5">
              Laser Measurement &amp; Stitching
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#78716C] leading-relaxed">
              Every curtain and blind is tailored to the exact millimeter of your window. Weighted bottom hems ensure straight, elegant drops.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-[#EAE4D8] shadow-2xs">
            <div className="w-11 h-11 bg-[#FAF7F2] rounded-xl border border-[#E7E2D8] flex items-center justify-center text-[#9A7B56] mb-5">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-[19px] sm:text-[20px] text-[#1C1917] font-medium mb-2.5">
              NRI &amp; Turnkey Execution
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#78716C] leading-relaxed">
              Overseas homeowners receive video call walkthroughs, fabric selections, and complete turnkey installation before arrival in Hyderabad.
            </p>
          </div>
        </div>

        {/* ─── 4. SHOWROOM LOCATION CARD ─── */}
        <div className="bg-white rounded-2xl border border-[#EAE4D8] p-6 sm:p-10 mb-16 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#9A7B56] font-semibold block">
                Visit Our Puppalguda Showroom
              </span>
              <h3 className="font-serif text-[24px] sm:text-[30px] text-[#1C1917] font-medium leading-snug">
                Experience Fabrics &amp; Motorized Tracks in Person
              </h3>
              <p className="text-[13.5px] sm:text-[14px] text-[#57534E] leading-relaxed">
                Browse full drapery drops, motorized Somfy setups, wallpaper pattern books, and upholstery samples at our showroom in Alkapur Township.
              </p>

              <div className="space-y-2.5 pt-2 text-[13px] text-[#57534E]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>Road No. 5, Kyetian Goud Nilayam, Alkapur Township, Puppalguda, Hyderabad 500089</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Monday – Saturday: 10:30 AM – 8:30 PM &bull; Sunday by appointment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <a href={`tel:${ZAIRA_SHOWROOM_PHONE.replace(/\s+/g, '')}`} className="hover:text-[#1C1714] font-medium transition-colors">
                    {ZAIRA_SHOWROOM_PHONE}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 justify-center md:justify-end">
              <a
                href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  'Hello Zaira Furnishing, I would like to schedule a visit to your Puppalguda showroom.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5C] text-white text-[12px] uppercase tracking-wider font-semibold transition-all shadow-xs cursor-pointer text-center"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                <span>Message on WhatsApp</span>
              </a>

              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12px] uppercase tracking-wider font-semibold transition-all shadow-xs text-center"
              >
                <Ruler className="w-4 h-4 text-[#D4AF37]" />
                <span>Book Free Measurement</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
