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
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { getDynamicServices } from '@/lib/db/catalog';
import { ConsultationForm } from '@/components/forms/ConsultationForm';
import { ZAIRA_WHATSAPP_NUMBER } from '@/lib/whatsapp';

export const metadata = {
  title: 'Bespoke Furnishing & Measurement Services',
  description:
    'In-home laser measurement, doorstep fabric demos, custom tailoring, Somfy motorization, and turnkey installation across Hyderabad.',
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
    <div className="bg-[#FAF7F2] text-[#1C1917] py-10 sm:py-16 selection:bg-[#9A7B56] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── 1. HEADER ─── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold block mb-2">
            Zaira Services in Hyderabad
          </span>
          <h1 className="font-serif text-[34px] sm:text-[46px] text-[#1C1917] font-medium tracking-tight mb-3.5 leading-tight">
            End-to-End Furnishing Services
          </h1>
          <p className="text-[14.5px] sm:text-[16px] text-[#78716C] leading-relaxed max-w-2xl mx-auto font-normal">
            From free doorstep fabric demos and laser measurement across Hyderabad to custom drapery stitching, motorized track fitting, and remote NRI turnkey setups.
          </p>
        </div>

        {/* ─── 2. SERVICES GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {services.map((service) => {
            const IconComponent = ICON_MAP[service.iconName] || Ruler;
            const whatsappText = `Hello Zaira Furnishing, I would like to inquire about your ${service.title} service.`;

            return (
              <div
                key={service.id}
                id={service.slug}
                className="scroll-mt-24 bg-white p-7 sm:p-8 rounded-2xl border border-[#EAE4D8] hover:border-[#1C1714]/40 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8] flex items-center justify-center text-[#1C1714]">
                      <IconComponent className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE4D8] text-[10.5px] font-semibold text-[#8C827A] uppercase tracking-wider">
                      {service.requiresSiteVisit ? 'In-Home Service' : 'Showroom & Online'}
                    </span>
                  </div>

                  <h3 className="font-serif text-[21px] sm:text-[23px] text-[#1C1917] font-medium mb-2.5">
                    {service.title}
                  </h3>
                  <p className="text-[13.5px] sm:text-[14px] text-[#78716C] leading-relaxed mb-6 font-normal">
                    {service.shortDesc || service.fullDesc}
                  </p>

                  {service.highlights && service.highlights.length > 0 && (
                    <ul className="space-y-2 mb-7">
                      {service.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start text-[13px] text-[#57534E]">
                          <Check className="w-4 h-4 text-[#9A7B56] mr-2 mt-0.5 shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-5 border-t border-[#F2ECE1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <a
                    href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] text-white text-[11.5px] font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href="#consultation-form"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    <span>Book Visit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── 3. CONSULTATION FORM SECTION ─── */}
        <div id="consultation-form" className="scroll-mt-24 max-w-3xl mx-auto bg-white p-7 sm:p-10 rounded-2xl border border-[#EAE4D8] shadow-2xs">
          <div className="text-center mb-8">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#9A7B56] font-semibold block mb-1.5">
              Free Consultation Schedule
            </span>
            <h2 className="font-serif text-[24px] sm:text-[30px] text-[#1C1917] font-medium tracking-tight">
              Book a Home Visit or Showroom Appointment
            </h2>
            <p className="text-[13.5px] text-[#78716C] mt-2 max-w-md mx-auto">
              Our coordinator will reach out to confirm your timing and bring the right fabric books for your space.
            </p>
          </div>

          <ConsultationForm />
        </div>

      </div>
    </div>
  );
}
