import React from 'react';
import { MapPin, Phone, Mail, Clock, Sparkles } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { ZAIRA_WHATSAPP_DISPLAY, ZAIRA_WHATSAPP_URL } from '@/lib/whatsapp';

export const metadata = {
  title: 'Contact & Showroom | Zaira Furnishing',
  description:
    'Visit the Zaira Furnishing showroom or connect with our atelier specialists for custom drapery, blinds, and interior inquiries.',
};

export default function ContactPage() {
  return (
    <div className="bg-[#FDFBF7] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold block mb-2">
            Get in Touch
          </span>
          <h1 className="font-serif text-[36px] sm:text-[46px] text-[#1C1917] font-medium tracking-tight mb-3">
            Visit Our Showroom or Connect
          </h1>
          <p className="text-[14px] text-[#78716C] leading-relaxed">
            Whether you would like to arrange an in-home measurement visit, experience fabric swatches, or discuss an architectural project, our team is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details & Showroom Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 border border-[#EBE7DF]">
              <h2 className="font-serif text-[22px] text-[#1C1917] font-medium mb-6 pb-3 border-b border-[#F0EDE6]">
                Showroom Information
              </h2>

              <div className="space-y-6 text-[13px]">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-[#9A7B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-[#1C1917] mb-0.5 uppercase tracking-wider text-[11px]">
                      Location & Experience Center
                    </span>
                    <p className="text-[#1C1917] font-medium leading-relaxed">
                      Rd Number 5, Kyetian Goud Nilayam, Alkapur Twp, Puppalguda, Hyderabad, Telangana 500089
                    </p>
                    <p className="text-[#78716C] text-[12px] mt-0.5">
                      Complimentary visitor parking & concierge assistance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-[#9A7B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-[#1C1917] mb-0.5 uppercase tracking-wider text-[11px]">
                      Client Inquiries & Bookings
                    </span>
                    <a
                      href={ZAIRA_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat with Zaira Furnishing on WhatsApp"
                      className="text-[#2C221E] font-semibold hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#9A7B56] rounded-xs"
                    >
                      {ZAIRA_WHATSAPP_DISPLAY}
                    </a>
                    <p className="text-[#78716C] text-[12px] mt-0.5">
                      Mon – Sat from 10:30 AM to 8:30 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-[#9A7B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-[#1C1917] mb-0.5 uppercase tracking-wider text-[11px]">
                      Written Inquiries & Architect RFPs
                    </span>
                    <a href="mailto:concierge@zairafurnishing.com" className="text-[#2C221E] font-medium hover:underline">
                      concierge@zairafurnishing.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-[#9A7B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-[#1C1917] mb-0.5 uppercase tracking-wider text-[11px]">
                      Showroom Operating Hours
                    </span>
                    <p className="text-[#1C1917]">
                      Mon – Sat: 10:30 AM – 8:30 PM
                    </p>
                    <p className="text-[#78716C] text-[12px] mt-0.5">
                      Sunday: By private appointment only
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Home Measurement Callout */}
            <div className="p-6 bg-[#FAF7F2] border border-[#EBE7DF]">
              <div className="flex items-center gap-2 text-[#9A7B56] mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  Doorstep Service Available
                </span>
              </div>
              <p className="text-[13px] text-[#57534E] leading-relaxed mb-3">
                Cannot visit the showroom in person? Our technical stylists travel with laser measurement equipment and textile swatches across your city.
              </p>
            </div>
          </div>

          {/* Contact & Consultation Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 border border-[#EBE7DF]">
            <h2 className="font-serif text-[24px] text-[#1C1917] font-medium mb-2">
              Send an Inquiry or Schedule a Visit
            </h2>
            <p className="text-[13px] text-[#78716C] mb-8">
              Share details regarding your space, requirements, or desired timeline.
            </p>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
