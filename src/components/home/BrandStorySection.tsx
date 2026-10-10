'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CloudflareImage } from '@/components/ui/CloudflareImage';
import { DbCmsContent } from '@/lib/db/types';

interface BrandStorySectionProps {
  cmsContent?: DbCmsContent | null;
}

export function BrandStorySection({ cmsContent }: BrandStorySectionProps) {
  let contentParsed: any = {};
  if (cmsContent?.content) {
    try {
      contentParsed = JSON.parse(cmsContent.content);
    } catch {
      contentParsed = {};
    }
  }

  const title = cmsContent?.title || 'About Zaira Furnishing';
  const subtitle = cmsContent?.subtitle || 'Furnishings & Services';
  const paragraph1 =
    contentParsed.paragraph1 ||
    'Zaira Furnishing offers a wide range of furnishings and home decor for different spaces in your home.';
  const paragraph2 =
    contentParsed.paragraph2 ||
    'From curtains, blinds and sofa fabrics to wallpapers, rugs, flooring, mattresses, bed linen, cushions, dining products and home decor, we help you find furnishings that suit your space.';
  const paragraph3 =
    contentParsed.paragraph3 ||
    'Our services include home measurement, fabric and sample visits, custom stitching, professional installation, smart-home setup, remote home styling, commercial furnishing and after-sales support.';
  const ctaText = contentParsed.cta_text || 'Learn More';
  const ctaLink = contentParsed.cta_link || '/about';
  const mainImage = cmsContent?.image_url || '/images/about/about-main-living.jpg';
  const secondaryImage = cmsContent?.secondary_image_url || '/images/about/about-tv-unit.jpg';

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 bg-[#FBF9F5] border-t border-[#EBE5DA] overflow-hidden">
      {/* Background Subtle Marbled/Organic Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#E8DEC8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* ─── Visual Showcase: 3 Overlapping Frames ─── */}
          <div className="lg:col-span-6 relative pb-6 sm:pb-12 lg:pb-0">
            {/* Top Right Mini Badge */}
            <div className="absolute -top-4 right-0 sm:right-4 z-20 hidden sm:flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E8DEC8] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#7D5E38]" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4A3520]">
                Zaira Furnishing
              </span>
            </div>

            {/* Frame Collage Container */}
            <div className="relative mx-auto max-w-[360px] sm:max-w-[480px] lg:max-w-none px-2 sm:px-0">
              {/* Frame 1: Grand Living & Dining Main Curved Arch */}
              <div className="relative w-full h-[330px] sm:h-[460px] lg:h-[530px] rounded-t-[70px] sm:rounded-t-[140px] rounded-b-[28px] sm:rounded-b-[48px] overflow-hidden shadow-[0_12px_32px_rgba(40,30,20,0.08)] border-3 sm:border-4 border-white bg-[#FAF7F2]">
                <CloudflareImage
                  src={mainImage}
                  alt="Zaira Furnishing living and dining space"
                  fill
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Frame 2: Living Room Feature Wall */}
              <div className="absolute -right-1 sm:-right-6 lg:-right-8 top-[30%] sm:top-[34%] w-[42%] sm:w-[42%] lg:w-[40%] aspect-[4/3] rounded-[18px] sm:rounded-[30px] overflow-hidden border-3 sm:border-[5px] border-white shadow-[0_14px_36px_rgba(30,20,10,0.16)] z-10 bg-[#FAF7F2]">
                <CloudflareImage
                  src={secondaryImage}
                  alt="Zaira Furnishing wallpapers and wall decor"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover object-center"
                />
              </div>

              {/* Frame 3: Lounge Sofa Corner */}
              <div className="absolute -left-1 sm:-left-5 lg:-left-6 bottom-[-6px] sm:bottom-[-14px] w-[36%] sm:w-[36%] lg:w-[34%] aspect-[4/3] rounded-[16px] sm:rounded-[26px] overflow-hidden border-3 sm:border-[5px] border-white shadow-[0_14px_36px_rgba(30,20,10,0.14)] z-20 bg-[#FAF7F2]">
                <CloudflareImage
                  src="/images/about/about-sofa-lounge.jpg"
                  alt="Zaira Furnishing sofa fabrics and cushions"
                  fill
                  sizes="(max-width: 1024px) 35vw, 18vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* ─── Editorial Content ─── */}
          <div className="lg:col-span-6 lg:pl-4">
            {/* Small Overline Label */}
            <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-5 sm:w-6 h-[1.5px] bg-[#7D5E38]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#7D5E38] font-bold">
                {subtitle}
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-[26px] sm:text-[38px] lg:text-[46px] text-[#1C1917] font-medium leading-[1.18] tracking-tight">
              {title}
            </h2>

            {/* Horizontal Underline Accent Bar */}
            <div className="w-16 sm:w-24 h-[3px] bg-[#7D5E38] mt-2.5 sm:mt-3.5 mb-5 sm:mb-6 rounded-full" />

            {/* Main text */}
            <p className="text-[14.5px] sm:text-[16.5px] text-[#1C1917] font-medium leading-relaxed mb-3.5 sm:mb-4">
              {paragraph1}
            </p>

            {/* Supporting text */}
            <p className="text-[13px] sm:text-[14.5px] text-[#635B52] leading-relaxed mb-3.5 sm:mb-4">
              {paragraph2}
            </p>

            {/* Second supporting paragraph */}
            <p className="text-[13px] sm:text-[14.5px] text-[#635B52] leading-relaxed mb-6 sm:mb-8">
              {paragraph3}
            </p>

            {/* Call to Action: Learn More → */}
            <div className="pt-1">
              <Link
                href={ctaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4A3520] hover:bg-[#342414] text-[#FAF7F2] text-[12.5px] sm:text-[13px] font-semibold tracking-wide px-7 py-3.5 rounded-full transition-all duration-300 shadow-md group/btn"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
