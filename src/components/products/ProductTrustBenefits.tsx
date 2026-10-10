import React from 'react';
import Image from 'next/image';

interface TrustBenefit {
  title: string;
  description: string;
  image: string;
  alt: string;
}

const TRUST_BENEFITS: TrustBenefit[] = [
  {
    title: 'Premium Quality',
    description:
      'Carefully selected furnishing materials and designs made to bring comfort and elegance to your home.',
    image: '/images/trust/premium-quality.jpg',
    alt: 'Premium woven furnishing fabrics and textured materials',
  },
  {
    title: 'Expert Guidance',
    description:
      'Get help choosing the right fabric, style, colour and measurements for your space.',
    image: '/images/trust/expert-guidance.jpg',
    alt: 'Professional furnishing consultation and measurement assistance',
  },
  {
    title: 'Wide Range of Furnishings',
    description:
      'Explore curtains, blinds, fabrics, wallpapers, flooring, cushions, bed linen and more.',
    image: '/images/trust/wide-range.jpg',
    alt: 'Comprehensive curated home furnishing collection showcase',
  },
];

export function ProductTrustBenefits() {
  return (
    <section
      aria-label="Why shop from Zaira"
      className="mt-10 sm:mt-12 lg:mt-14 rounded-2xl bg-white border border-[#EDE8DE] p-5 sm:p-6 lg:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)]"
    >
      {/* ─── Clean, Moderately Sized Section Heading ─── */}
      <div className="mb-5 sm:mb-6">
        <h2 className="font-serif text-[19px] sm:text-[21px] lg:text-[22px] font-medium text-[#1C1714] tracking-tight">
          Why shop from Zaira?
        </h2>
      </div>

      {/* ─── 3 Benefits: 3 Horizontal Items on Desktop / Stacked Vertically on Mobile ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        {TRUST_BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className="group flex items-start gap-3.5 sm:gap-4"
          >
            {/* Small circular visual on the left */}
            <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden shrink-0 border border-[#E2D9CB] bg-[#F5EFEB] shadow-2xs ring-2 ring-[#FAF7F2] transition-transform duration-300 group-hover:scale-105">
              <Image
                src={benefit.image}
                alt={benefit.alt}
                fill
                sizes="(max-width: 640px) 48px, 52px"
                className="object-cover object-center"
              />
            </div>

            {/* Benefit title + short description on the right */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] sm:text-[14.5px] lg:text-[15px] font-semibold text-[#1C1917] tracking-tight leading-snug mb-1 group-hover:text-[#9A7B56] transition-colors">
                {benefit.title}
              </h3>
              <p className="text-[12px] sm:text-[12.5px] lg:text-[13px] text-[#6B655C] leading-relaxed font-normal">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
