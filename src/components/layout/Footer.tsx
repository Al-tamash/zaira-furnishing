import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { DbCmsContent } from '@/lib/db/types';
import { ZAIRA_WHATSAPP_DISPLAY, ZAIRA_WHATSAPP_URL } from '@/lib/whatsapp';

interface FooterProps {
  cmsContent?: DbCmsContent | null;
}

export function Footer({ cmsContent }: FooterProps) {
  let contentParsed: any = {};
  if (cmsContent?.content) {
    try {
      contentParsed = JSON.parse(cmsContent.content);
    } catch {
      contentParsed = {};
    }
  }

  const tagline =
    cmsContent?.subtitle ||
    'Curtains, blinds, fabrics and furnishings for thoughtfully designed spaces.';
  const address =
    contentParsed.address ||
    'Rd Number 5, Kyetian Goud Nilayam, Alkapur Twp, Puppalguda, Hyderabad, Telangana 500089';
  const rawPhone = contentParsed.phone;
  const phone = rawPhone && !rawPhone.includes('63001') ? rawPhone : ZAIRA_WHATSAPP_DISPLAY;
  const email = contentParsed.email || 'concierge@zairafurnishing.com';
  const hours = contentParsed.hours || 'Mon–Sat 10:30 AM–8:30 PM · Sunday by appointment';
  const copyright = contentParsed.copyright || '© 2026 Zaira Furnishing. All rights reserved.';

  const shopLinks = [
    { name: 'All Categories', href: '/categories' },
    { name: 'Curtains & Drapes', href: '/categories/curtains' },
    { name: 'Window Blinds & Shades', href: '/categories/blinds' },
    { name: 'Sofa Fabrics & Upholstery', href: '/categories/sofa-fabrics' },
    { name: 'Wallpapers & Wall Coverings', href: '/categories/wallpapers' },
    { name: 'Carpets & Rugs', href: '/categories/carpets' },
    { name: 'Mattresses & Sleep Systems', href: '/categories/mattresses-sleep-systems' },
  ];

  const exploreLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'My Orders', href: '/account/orders' },
    { name: 'Admin Portal', href: '/admin' },
  ];

  return (
    <footer className="bg-[#1C1714] text-[#FAF7F2] border-t border-[#C5A059]/30 pb-20 lg:pb-0">
      {/* ─── Main Footer Columns ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-9 lg:gap-12">

          {/* COLUMN 1 — BRAND (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="w-7 h-7 fill-none" aria-hidden="true">
                  <path d="M18 3 L31 14 L18 22 L5 14 Z" fill="#C5A059" />
                  <path d="M5 14 L18 22 L18 33 L5 25 Z" fill="#2C221E" />
                  <path d="M31 14 L18 22 L18 33 L31 25 Z" fill="#B38E46" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[20px] tracking-[0.16em] font-semibold text-white uppercase leading-none">
                  ZAIRA
                </span>
                <span className="text-[7.5px] uppercase tracking-[0.32em] text-[#C5A059] font-bold mt-1 leading-none">
                  FURNISHINGS
                </span>
              </div>
            </Link>

            <p className="text-[13.5px] text-[#A8A29E] leading-relaxed max-w-sm font-light">
              {tagline}
            </p>

            <div className="pt-2 text-[11px] text-[#C5A059] uppercase tracking-wider font-semibold">
              Hyderabad &bull; Financial District Flagship Atelier
            </div>
          </div>

          {/* COLUMN 2 — SHOP (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] sm:text-[11.5px] uppercase tracking-[0.2em] font-semibold text-[#C5A059] mb-4">
              Official Collections
            </h4>
            <ul className="space-y-2.5 text-[13px] text-[#A8A29E]">
              {shopLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-[#C5A059] transition-colors block py-0.5"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 — EXPLORE (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] sm:text-[11.5px] uppercase tracking-[0.2em] font-semibold text-[#C5A059] mb-4">
              Atelier Services
            </h4>
            <ul className="space-y-2.5 text-[13px] text-[#A8A29E]">
              {exploreLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-[#C5A059] transition-colors block py-0.5"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 — CONTACT (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] sm:text-[11.5px] uppercase tracking-[0.2em] font-semibold text-[#C5A059] mb-4">
              Concierge Desk
            </h4>
            <div className="space-y-3.5 text-[13px] text-[#A8A29E]">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <address className="not-italic text-[#E5E0D8] leading-relaxed whitespace-pre-line">
                  {address}
                </address>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <a
                  href={ZAIRA_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Zaira Furnishing on WhatsApp"
                  className="text-white hover:text-[#C5A059] transition-colors font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-xs"
                >
                  {phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {email}
                </a>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-2.5 text-[12.5px] pt-0.5">
                <Clock className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <p className="text-[#EAE4D9] whitespace-pre-line">{hours}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#8C827A]">
          <p>{copyright}</p>
          <p className="text-[11px] text-[#C5A059]/80">Bespoke Living Spaces &bull; Guaranteed Artisan Craftsmanship</p>
        </div>
      </div>
    </footer>
  );
}
