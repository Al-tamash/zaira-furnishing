import React from 'react';

const HIGHLIGHTS = [
  {
    title: 'Quality Products',
    subtitle: 'Beautiful and durable furnishings.',
    icon: (
      // Diamond with facets
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2C221E]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 7-10 11L2 10l4-7z" />
        <path d="M2 10h20" />
        <path d="m12 21 4-11-4-7-4 7 4 11z" />
      </svg>
    ),
  },
  {
    title: 'Free Home Measurement',
    subtitle: 'We measure at your home.',
    icon: (
      // Coiled tape measure
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2C221E]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="13" r="7.5" />
        <circle cx="13" cy="13" r="2.8" />
        <path d="M5.5 13H2.5" />
        <path d="M13 5.5V2.5" />
        <path d="M10 13v-2" />
        <path d="M13 16h2" />
      </svg>
    ),
  },
  {
    title: 'Custom Stitching',
    subtitle: 'Made to fit your space.',
    icon: (
      // Sewing machine
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2C221E]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 19h18" />
        <path d="M5 19V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10" />
        <path d="M14 7V4h2v3" />
        <path d="M8 12h5" />
        <path d="M8 12v4" />
        <circle cx="8" cy="17" r="0.6" fill="currentColor" />
        <circle cx="17" cy="11" r="1.5" />
      </svg>
    ),
  },
  {
    title: 'Professional Installation',
    subtitle: 'Done by our experts.',
    icon: (
      // Wrench
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2C221E]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

export function TrustHighlights() {
  return (
    <section className="relative bg-[#F5EFEB] overflow-hidden">
      {/* ─── Top Organic Wave Transition from Section Above ─── */}
      <div className="w-full overflow-hidden leading-none -mt-[1px]">
        <svg
          viewBox="0 0 1440 70"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-7 sm:h-12 lg:h-14 block text-[#FAF7F2]"
        >
          <path
            d="M0,0 L1440,0 L1440,30 C1200,65 960,15 720,40 C480,65 240,20 0,45 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* ─── Botanical Leaf Accents ─── */}
      {/* Left Botanical Branch */}
      <svg
        viewBox="0 0 160 160"
        className="absolute top-1/2 -translate-y-1/2 -left-4 w-24 h-24 sm:w-36 sm:h-36 text-[#7E9688] opacity-50 pointer-events-none block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M10 85 Q60 88 120 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 82 Q46 64 62 72 Q46 88 30 82" fill="currentColor" opacity="0.85" />
        <path d="M60 74 Q78 56 92 65 Q76 82 60 74" fill="currentColor" opacity="0.85" />
        <path d="M92 65 Q108 50 120 60 Q104 74 92 65" fill="currentColor" opacity="0.85" />
        <path d="M42 86 Q56 100 70 94 Q58 82 42 86" fill="currentColor" opacity="0.85" />
        <path d="M72 78 Q88 94 102 88 Q88 76 72 78" fill="currentColor" opacity="0.85" />
      </svg>

      {/* Right Botanical Branch */}
      <svg
        viewBox="0 0 160 160"
        className="absolute top-1/2 -translate-y-1/2 -right-4 w-24 h-24 sm:w-36 sm:h-36 text-[#7E9688] opacity-50 pointer-events-none block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ transform: 'scaleX(-1)' }}
      >
        <path d="M10 85 Q60 88 120 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 82 Q46 64 62 72 Q46 88 30 82" fill="currentColor" opacity="0.85" />
        <path d="M60 74 Q78 56 92 65 Q76 82 60 74" fill="currentColor" opacity="0.85" />
        <path d="M92 65 Q108 50 120 60 Q104 74 92 65" fill="currentColor" opacity="0.85" />
        <path d="M42 86 Q56 100 70 94 Q58 82 42 86" fill="currentColor" opacity="0.85" />
        <path d="M72 78 Q88 94 102 88 Q88 76 72 78" fill="currentColor" opacity="0.85" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-4 text-left">
            <h2 className="font-serif text-[28px] sm:text-[38px] text-[#2C221E] font-medium leading-tight mb-1.5 sm:mb-2 tracking-tight">
              Why Choose Zaira
            </h2>
            <p className="text-[13.5px] sm:text-[15px] text-[#66615C] leading-relaxed max-w-sm">
              Quality products and expert support for your home.
            </p>
          </div>

          {/* Right Column: 2x2 grid on mobile, 4 columns on desktop */}
          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 lg:divide-x divide-[#DDD3C5]">
            {HIGHLIGHTS.map((item, idx) => (
              <div
                key={item.title}
                className={`flex flex-col items-center text-center p-2 sm:p-0 ${
                  idx > 0 ? 'lg:pl-6' : ''
                }`}
              >
                {/* Circular Outline Badge */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EDE5DB] border border-[#DDD3C5] flex items-center justify-center mb-2.5 sm:mb-3 shadow-2xs">
                  {item.icon}
                </div>
                <h3 className="text-[13px] sm:text-[14px] font-semibold text-[#1C1917] mb-0.5 sm:mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11.5px] sm:text-[12px] text-[#78716C] leading-snug max-w-[160px]">
                  {item.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom Organic Wave Transition ─── */}
      <div className="w-full overflow-hidden leading-none -mb-[1px]">
        <svg
          viewBox="0 0 1440 70"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-7 sm:h-12 lg:h-14 block text-[#FAF7F2]"
        >
          <path
            d="M0,70 L1440,70 L1440,30 C1200,60 960,15 720,45 C480,70 240,25 0,40 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
