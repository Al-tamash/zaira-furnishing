import React from 'react';
import {
  Ruler,
  Sparkles,
  Scissors,
  Hammer,
  Cpu,
  Globe,
  Building2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { getDynamicServices } from '@/lib/db/catalog';
import { ConsultationForm } from '@/components/forms/ConsultationForm';

export const metadata = {
  title: 'Bespoke Services | Zaira Furnishing',
  description:
    'Comprehensive furnishing services: In-home laser measurement, doorstep fabric demos, custom tailoring, smart motorization, and professional installation.',
};

const ICON_MAP: Record<string, React.ElementType> = {
  Ruler,
  Sparkles,
  Scissors,
  Hammer,
  Cpu,
  Globe,
  Building2,
  ShieldCheck,
};

export default async function ServicesPage() {
  const services = await getDynamicServices();

  return (
    <div className="bg-[#FDFBF7] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold block mb-2">
            Showroom Services
          </span>
          <h1 className="font-serif text-[36px] sm:text-[46px] text-[#1C1917] font-medium tracking-tight mb-3">
            Atelier & Technical Services
          </h1>
          <p className="text-[14px] text-[#78716C] leading-relaxed">
            From millimeter site visits to smart home motorization and turnkey remote styling, we bring master artisans and specialized technicians directly to your project.
          </p>
        </div>

        {/* 8 Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {services.map((service) => {
            const IconComponent = ICON_MAP[service.iconName] || Ruler;
            return (
              <div
                key={service.id}
                id={service.slug}
                className="scroll-mt-24 bg-white p-8 border border-[#EBE7DF] hover:border-[#C4B9A1] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#1C1917] mb-6">
                    <IconComponent className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-[22px] text-[#1C1917] font-medium mb-3">
                    {service.title}
                  </h3>
                  <p className="text-[14px] text-[#78716C] leading-relaxed mb-6">
                    {service.shortDesc || service.fullDesc}
                  </p>
                  {service.highlights && service.highlights.length > 0 && (
                    <ul className="space-y-2 mb-8">
                      {service.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start text-[13px] text-[#57534E]">
                          <Check className="w-4 h-4 text-[#9A7B56] mr-2.5 mt-0.5 shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="pt-6 border-t border-[#F2ECE1] flex items-center justify-between text-[12px] text-[#78716C]">
                  <span>{service.requiresSiteVisit ? 'Requires Site Visit' : 'Available Online & Showroom'}</span>
                  <a
                    href="#consultation-form"
                    className="font-medium text-[#1C1917] hover:text-[#9A7B56] transition-colors"
                  >
                    Enquire Now &rarr;
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Consultation Form Anchor */}
        <div id="consultation-form" className="scroll-mt-24">
          <ConsultationForm />
        </div>
      </div>
    </div>
  );
}
