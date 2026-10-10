'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { CloudflareImage } from '@/components/ui/CloudflareImage';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Do you provide home measurement?',
    answer:
      'Yes. Zaira Furnishing offers in-home measurement and site visits to take measurements for windows and spaces.',
  },
  {
    id: 'faq-2',
    question: 'Can I see fabric and samples at home?',
    answer:
      'Yes. Fabric and sample demos are available so you can see and feel materials in your home.',
  },
  {
    id: 'faq-3',
    question: 'Can curtains and other furnishings be custom made?',
    answer:
      'Yes. Custom tailoring and stitching are available for curtains, cushion covers, sofa upholstery and bed runners.',
  },
  {
    id: 'faq-4',
    question: 'Do you provide installation?',
    answer:
      'Yes. Professional installation is available for products such as curtain rods, motorized tracks, blinds, wallpapers and wooden flooring.',
  },
  {
    id: 'faq-5',
    question: 'Do you provide motorized blinds and curtains?',
    answer:
      'Yes. Zaira Furnishing offers motorization and smart-home setup for curtains and blinds.',
  },
  {
    id: 'faq-6',
    question: 'Do you provide furnishing services for offices and commercial spaces?',
    answer:
      'Yes. Corporate and institutional furnishing services are available for offices, hotels, guest houses and hospitals.',
  },
  {
    id: 'faq-7',
    question: 'Do you offer remote home styling?',
    answer:
      'Yes. Zaira Furnishing offers remote home styling support for NRI customers furnishing homes in India.',
  },
  {
    id: 'faq-8',
    question: 'Do you provide after-sales support?',
    answer:
      'Yes. Warranty and after-sales assistance are part of the services offered by Zaira Furnishing.',
  },
];

export function FaqSection() {
  // Only one FAQ open at a time; default first open
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-[#FDFBF7] border-t border-[#EBE5DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* ─── Left Column: Heading + Intro + Furnishing Image (Desktop Only) ─── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#7D5E38] font-bold block mb-1.5 sm:mb-2">
              Help &amp; Information
            </span>
            <h2 className="font-serif text-[24px] sm:text-[36px] lg:text-[44px] text-[#1C1917] font-medium tracking-tight mb-2 sm:mb-3 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-[13px] sm:text-[15px] text-[#78716C] leading-relaxed mb-4 sm:mb-6">
              Quick answers about our made-to-measure furnishings and white-glove services.
            </p>

            {/* Furnishing Showcase Image (Hidden on Mobile, Visible on Desktop) */}
            <div className="hidden lg:block relative aspect-[16/10] w-full rounded-[24px] sm:rounded-[28px] overflow-hidden border border-[#EBE5DA] shadow-[0_10px_28px_rgba(28,25,23,0.04)] bg-[#FAF7F2] mb-6">
              <CloudflareImage
                src="/images/about/about-main-living.jpg"
                alt="Zaira Furnishing Living Interior"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Contact Team Link */}
            <div className="pt-0 sm:pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[11.5px] sm:text-[12px] uppercase tracking-[0.16em] font-semibold text-[#7D5E38] hover:text-[#1C1917] transition-colors group"
              >
                <span>Have more questions? Contact our team</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ─── Right Column: FAQ Accordion ─── */}
          <div className="lg:col-span-7 space-y-3.5">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.id}
                  className={`rounded-[20px] transition-all duration-300 border ${
                    isOpen
                      ? 'bg-white border-[#7D5E38]/40 shadow-[0_8px_24px_rgba(125,94,56,0.08)]'
                      : 'bg-white/80 hover:bg-white border-[#EBE5DA] hover:border-[#D5CBB9] shadow-2xs'
                  }`}
                >
                  {/* Accordion Question Button */}
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                  >
                    <span className="font-serif text-[16px] sm:text-[17px] text-[#1C1917] font-medium leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 border ${
                        isOpen
                          ? 'bg-[#7D5E38] text-white border-[#7D5E38]'
                          : 'bg-[#FAF7F2] text-[#7D5E38] border-[#E8DEC8]'
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2]" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Answer Content */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-[13.5px] sm:text-[14px] text-[#635B52] leading-relaxed border-t border-[#F5EFE6]">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
