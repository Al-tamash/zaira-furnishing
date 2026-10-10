import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { CloudflareImage } from '@/components/ui/CloudflareImage';

export const metadata = {
  title: 'About Zaira Furnishing | The Showroom & Atelier',
  description:
    'Discover Zaira Furnishing: Our dedication to master craftsmanship, bespoke window drapery, tactile upholstery textiles, and timeless living spaces.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#FDFBF7] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold block mb-2">
            The Zaira Philosophy
          </span>
          <h1 className="font-serif text-[38px] sm:text-[50px] text-[#1C1917] font-medium tracking-tight mb-4 leading-tight">
            Crafting Spaces of Enduring Elegance
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[#78716C] leading-relaxed font-light">
            Founded on a passion for tactile luxury, architectural drapery, and precise artisanal fitting, Zaira Furnishing transforms living spaces into personal sanctuaries.
          </p>
        </div>

        {/* Feature Visual Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-24">
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[#FAF7F2] border border-[#EBE7DF]">
              <CloudflareImage
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="Zaira Furnishing Showroom Atmosphere"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#9A7B56] font-semibold block">
              Our Showroom Vision
            </span>
            <h2 className="font-serif text-[28px] sm:text-[34px] text-[#1C1917] font-medium leading-snug">
              Bridging Refined Aesthetics and Technical Precision
            </h2>
            <p className="text-[14px] text-[#57534E] leading-relaxed">
              True luxury lies in the details that often go unnoticed: the silent drop of a double-pinch pleated linen drape, the subtle resistance of a Martindale-rated bouclé, or the flawless edge-matching of an acoustic wallcovering.
            </p>
            <p className="text-[14px] text-[#57534E] leading-relaxed">
              At Zaira Furnishing, we unite a curated global library of textiles with in-house master artisans and laser-guided technicians. Every project receives millimeter dedication from the initial site visit through to final steaming and installation.
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-semibold text-[#1C1917] hover:text-[#9A7B56] transition-colors"
              >
                <span>Explore Our Atelier Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Three Core Tenets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-t border-b border-[#EBE7DF] mb-20">
          <div className="bg-white p-8 border border-[#EBE7DF]">
            <div className="w-10 h-10 bg-[#FAF7F2] border border-[#E7E2D8] flex items-center justify-center text-[#9A7B56] mb-5">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-[20px] text-[#1C1917] font-medium mb-2">
              Material Authenticity
            </h3>
            <p className="text-[13px] text-[#78716C] leading-relaxed">
              We prioritize natural long-staple flax linens, pure New Zealand wools, dense woven silks, and solid natural stone over synthetic compromises.
            </p>
          </div>

          <div className="bg-white p-8 border border-[#EBE7DF]">
            <div className="w-10 h-10 bg-[#FAF7F2] border border-[#E7E2D8] flex items-center justify-center text-[#9A7B56] mb-5">
              <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-[20px] text-[#1C1917] font-medium mb-2">
              Atelier Craftsmanship
            </h3>
            <p className="text-[13px] text-[#78716C] leading-relaxed">
              Hand-pleated drapery headings, lead-weighted bottom hems, and French seam stitchings executed by experienced artisans.
            </p>
          </div>

          <div className="bg-white p-8 border border-[#EBE7DF]">
            <div className="w-10 h-10 bg-[#FAF7F2] border border-[#E7E2D8] flex items-center justify-center text-[#9A7B56] mb-5">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-[20px] text-[#1C1917] font-medium mb-2">
              End-to-End Responsibility
            </h3>
            <p className="text-[13px] text-[#78716C] leading-relaxed">
              We own the entire process: laser measurement, custom fabrication, motorized integration, and dust-free installation.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="font-serif text-[26px] text-[#1C1917] mb-3">
            Experience the Showroom
          </h3>
          <p className="text-[14px] text-[#78716C] max-w-md mx-auto mb-6">
            Consult with our interior stylists or book a doorstep fabric demo to test textures in your home&apos;s natural light.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/services"
              className="px-8 py-3.5 bg-[#1C1917] text-white text-[12px] uppercase tracking-widest font-medium hover:bg-[#9A7B56] transition-colors"
            >
              Book In-Home Visit
            </Link>
            <Link
              href="/categories"
              className="px-8 py-3.5 border border-[#1C1917] text-[#1C1917] text-[12px] uppercase tracking-widest font-medium hover:bg-[#FAF7F2] transition-colors"
            >
              View Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
