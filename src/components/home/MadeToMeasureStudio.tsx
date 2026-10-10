'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Ruler,
  Sparkles,
  Check,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sliders,
  Calendar,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

interface StitchingStyle {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  bestFor: string;
  basePricePerMeter: number;
  image: string;
  fullnessDefault: number;
}

const STITCHING_STYLES: StitchingStyle[] = [
  {
    id: 'ripple-fold',
    name: 'Ripple Fold / S-Wave',
    subtitle: 'Architectural Fluid Waves',
    description: 'Continuous smooth S-curves suspended uniformly from slim ceiling tracks. The top choice for contemporary luxury villas and apartments.',
    bestFor: 'Modern Living Rooms & Floor-to-Ceiling Windows',
    basePricePerMeter: 3850,
    image: '/images/hero/curtains.jpg',
    fullnessDefault: 2.2,
  },
  {
    id: 'double-pinch-pleat',
    name: 'Double Pinch Pleat',
    subtitle: 'Tailored French Elegance',
    description: 'Crisp, permanent double-finger pleats stitched firmly at the header, cascading into disciplined straight waterfall folds.',
    bestFor: 'Master Bedrooms & Formal Dining Salons',
    basePricePerMeter: 3450,
    image: '/images/products/curtains/blackout-curtains/main.jpg',
    fullnessDefault: 2.0,
  },
  {
    id: 'american-pleat',
    name: 'American / Triple Pinch Pleat',
    subtitle: 'Grand Architectural Body',
    description: 'Deep, three-finger pleats that give exceptional weight, fullness, and grandeur to heavy velvets, silks, and jacquards.',
    bestFor: 'Double-Height Living Rooms & Grand Foyers',
    basePricePerMeter: 3950,
    image: '/images/hero/living_room.jpg',
    fullnessDefault: 2.5,
  },
  {
    id: 'eyelet-grommet',
    name: 'Eyelet / Grommet',
    subtitle: 'Contemporary Clean Drape',
    description: 'Stainless steel, brass or matte black eyelet rings that glide directly on decorative architectural curtain poles.',
    bestFor: 'Casual Lounges, Guest Rooms & Bedrooms',
    basePricePerMeter: 2950,
    image: '/images/hero/curtains.jpg',
    fullnessDefault: 1.8,
  },
  {
    id: 'goblet-pleat',
    name: 'Goblet Pleat',
    subtitle: 'Regal Formal Heritage',
    description: 'Cylindrical cup-shaped goblet pleats lined with interior wadding to retain luxurious rounded profile even when drawn.',
    bestFor: 'Heritage Suites & Formal Drawing Rooms',
    basePricePerMeter: 4200,
    image: '/images/hero/bedroom.jpg',
    fullnessDefault: 2.2,
  },
  {
    id: 'rod-pocket',
    name: 'Rod Pocket / Casing',
    subtitle: 'Soft Romantic Gathering',
    description: 'Top fabric sleeve gathered softly over a slim brass or wooden rod, creating a relaxed romantic cottage and bedroom ambiance.',
    bestFor: 'Sheer Curtains, Nursery & Powder Rooms',
    basePricePerMeter: 2750,
    image: '/images/products/curtains/sheer-day-curtains/main.jpg',
    fullnessDefault: 1.8,
  },
];

const LINING_OPTIONS = [
  {
    id: 'sheer-unlined',
    name: 'Daylight Sheer (Unlined)',
    multiplier: 1.0,
    desc: 'Soft light diffusion, gentle daytime privacy.',
  },
  {
    id: 'dimout-thermal',
    name: 'Thermal Dimout (75% Block)',
    multiplier: 1.25,
    desc: 'Glare reduction, UV shielding & temperature regulation.',
  },
  {
    id: 'total-blackout',
    name: '100% Total Blackout Interlined',
    multiplier: 1.45,
    desc: 'Acoustic dampening, 100% pitch dark sleep sanctuary.',
  },
];

const MOTORIZATION_OPTIONS = [
  {
    id: 'manual',
    name: 'Manual Smooth Glide Track',
    addCost: 0,
    desc: 'Whisper-quiet Teflon coated architectural track with master carrier.',
  },
  {
    id: 'somfy-smart',
    name: 'Somfy Motorized Smart Track',
    addCost: 14500,
    desc: 'Ultra-silent motor (<35dB), app scheduling, Alexa/Google Home voice control.',
  },
];

export function MadeToMeasureStudio() {
  const { openBookingModal } = useStore();

  const [activeStyle, setActiveStyle] = useState<StitchingStyle>(STITCHING_STYLES[0]);
  const [windowWidthFt, setWindowWidthFt] = useState<number>(8);
  const [windowDropFt, setWindowDropFt] = useState<number>(9);
  const [fullness, setFullness] = useState<number>(2.0);
  const [selectedLining, setSelectedLining] = useState(LINING_OPTIONS[2]);
  const [selectedMotor, setSelectedMotor] = useState(MOTORIZATION_OPTIONS[0]);

  // Rough estimation calculation based on standard fabric meterage
  const fabricWidthMeters = windowWidthFt * 0.3048 * fullness;
  const estimatedFabricCost = Math.round(
    fabricWidthMeters *
    activeStyle.basePricePerMeter *
    selectedLining.multiplier *
    (windowDropFt / 8.5)
  );
  const estimatedTotal = estimatedFabricCost + selectedMotor.addCost;

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-[#FAF7F2] border-t border-[#EAE4D8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9A7B56]/10 border border-[#9A7B56]/20 text-[#9A7B56] text-[11px] uppercase tracking-widest font-semibold mb-3">
            <Ruler className="w-3.5 h-3.5 text-[#9A7B56]" />
            <span>Interactive Bespoke Drapery Studio</span>
          </div>
          <h2 className="font-serif text-[28px] sm:text-[38px] lg:text-[44px] font-medium text-[#1C1917] tracking-tight leading-[1.15]">
            Custom Made-to-Measure Atelier
          </h2>
          <p className="mt-3 text-[14px] sm:text-[16px] text-[#57534E] leading-relaxed">
            Compare 6 signature master-tailored stitching styles, calibrate fullness ratios, and preview your custom drapery with instant transparent estimations.
          </p>
        </div>

        {/* ─── Studio Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Left Column: Stitching Style Selector (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Style Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11.5px] uppercase tracking-wider font-semibold text-[#9A7B56]">
                  1. Select Header Stitching Style
                </span>
                <span className="text-[12px] text-[#78716C]">
                  6 Master Atelier Styles
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {STITCHING_STYLES.map((style) => {
                  const isSelected = activeStyle.id === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        setActiveStyle(style);
                        setFullness(style.fullnessDefault);
                      }}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${isSelected
                          ? 'bg-white border-[#2C221E] ring-2 ring-[#2C221E]/20 shadow-md scale-[1.01]'
                          : 'bg-white/80 border-[#EAE4D8] hover:border-[#C4B9A1] hover:bg-white'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-serif text-[13px] sm:text-[15px] font-semibold text-[#1C1917] leading-tight truncate pr-1">
                            {style.name}
                          </h4>
                          {isSelected && (
                            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#2C221E] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#9A7B56] block mb-1 truncate">
                          {style.subtitle}
                        </span>
                        <p className="hidden sm:block text-[12px] text-[#6E6862] leading-relaxed line-clamp-2">
                          {style.description}
                        </p>
                      </div>

                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#F2ECE1] flex flex-col sm:flex-row sm:items-center justify-between text-[10.5px] sm:text-[11px] gap-0.5 sm:gap-0">
                        <span className="text-[#8C827A] truncate max-w-[150px] hidden sm:inline">
                          {style.bestFor}
                        </span>
                        <span className="font-semibold text-[#2C221E]">
                          From ₹{style.basePricePerMeter}/m
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimension Sliders */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE4D8] shadow-xs space-y-5">
              <span className="text-[11.5px] uppercase tracking-wider font-semibold text-[#9A7B56] block">
                2. Window Dimension & Fullness Calibration
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Width */}
                <div>
                  <div className="flex justify-between text-[12.5px] mb-1.5">
                    <span className="text-[#57534E] font-medium">Window Width:</span>
                    <span className="font-bold text-[#2C221E]">{windowWidthFt} Feet ({(windowWidthFt * 0.3048).toFixed(1)}m)</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="20"
                    step="1"
                    value={windowWidthFt}
                    onChange={(e) => setWindowWidthFt(Number(e.target.value))}
                    className="w-full accent-[#2C221E] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#A8A29E] mt-1">
                    <span>4 ft (Standard)</span>
                    <span>12 ft (Balcony)</span>
                    <span>20 ft (Glass Wall)</span>
                  </div>
                </div>

                {/* Drop Height */}
                <div>
                  <div className="flex justify-between text-[12.5px] mb-1.5">
                    <span className="text-[#57534E] font-medium">Drape Drop Height:</span>
                    <span className="font-bold text-[#2C221E]">{windowDropFt} Feet (Floor Drop)</span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="14"
                    step="0.5"
                    value={windowDropFt}
                    onChange={(e) => setWindowDropFt(Number(e.target.value))}
                    className="w-full accent-[#2C221E] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#A8A29E] mt-1">
                    <span>7 ft (Sill)</span>
                    <span>9.5 ft (High Ceiling)</span>
                    <span>14 ft (Double Height)</span>
                  </div>
                </div>
              </div>

              {/* Fullness Ratio */}
              <div className="pt-2">
                <span className="text-[12px] font-medium text-[#57534E] block mb-2">
                  Drapery Fullness Ratio (Fabric Density)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '1.5x Tailored', val: 1.5, desc: 'Light & Crisp' },
                    { label: '2.0x Classic', val: 2.0, desc: 'Recommended Luxury' },
                    { label: '2.5x Grand', val: 2.5, desc: 'Heavy Atelier Folds' },
                  ].map((f) => (
                    <button
                      key={f.val}
                      type="button"
                      onClick={() => setFullness(f.val)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${fullness === f.val
                          ? 'bg-[#2C221E] text-white border-[#2C221E]'
                          : 'bg-[#FAF7F2] text-[#57534E] border-[#EAE4D8] hover:border-[#C4B9A1]'
                        }`}
                    >
                      <span className="font-semibold text-[12px] block">{f.label}</span>
                      <span className={`text-[9.5px] block ${fullness === f.val ? 'text-[#C4B9A1]' : 'text-[#8C827A]'}`}>
                        {f.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lining & Motorization Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lining */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE4D8] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9A7B56] block mb-2.5">
                  3. Light Control & Lining
                </span>
                <div className="space-y-2">
                  {LINING_OPTIONS.map((lining) => (
                    <button
                      key={lining.id}
                      type="button"
                      onClick={() => setSelectedLining(lining)}
                      className={`w-full p-2.5 rounded-xl border text-left text-[12px] transition-all cursor-pointer flex items-center justify-between ${selectedLining.id === lining.id
                          ? 'bg-[#FAF7F2] border-[#2C221E] font-semibold text-[#1C1917]'
                          : 'bg-white border-[#EAE4D8] text-[#57534E] hover:border-[#C4B9A1]'
                        }`}
                    >
                      <span className="truncate pr-2">{lining.name}</span>
                      {selectedLining.id === lining.id && (
                        <Check className="w-3.5 h-3.5 text-[#2C221E] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Automation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE4D8] shadow-xs">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9A7B56] block mb-2.5">
                  4. Track & Automation
                </span>
                <div className="space-y-2">
                  {MOTORIZATION_OPTIONS.map((motor) => (
                    <button
                      key={motor.id}
                      type="button"
                      onClick={() => setSelectedMotor(motor)}
                      className={`w-full p-2.5 rounded-xl border text-left text-[12px] transition-all cursor-pointer flex items-center justify-between ${selectedMotor.id === motor.id
                          ? 'bg-[#FAF7F2] border-[#2C221E] font-semibold text-[#1C1917]'
                          : 'bg-white border-[#EAE4D8] text-[#57534E] hover:border-[#C4B9A1]'
                        }`}
                    >
                      <div className="truncate pr-2">
                        <span className="block truncate">{motor.name}</span>
                        {motor.addCost > 0 && (
                          <span className="text-[10px] text-[#9A7B56] font-normal">
                            +₹{motor.addCost.toLocaleString('en-IN')} (Motor & Remote)
                          </span>
                        )}
                      </div>
                      {selectedMotor.id === motor.id && (
                        <Check className="w-3.5 h-3.5 text-[#2C221E] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Visualizer & Price Card (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-5">

            {/* Live Visualizer Card */}
            <div className="rounded-3xl bg-white border border-[#EAE4D8] p-5 sm:p-6 shadow-xl overflow-hidden relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1] mb-4">
                <div>
                  <span className="text-[10.5px] uppercase tracking-widest font-semibold text-[#9A7B56]">
                    Atelier Configuration
                  </span>
                  <h3 className="font-serif text-[19px] sm:text-[22px] font-semibold text-[#1C1917]">
                    {activeStyle.name}
                  </h3>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE4D8] text-[10.5px] font-semibold text-[#2C221E]">
                  {fullness}x Fullness
                </div>
              </div>

              {/* Visual Preview Graphic with Wave Simulation */}
              <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-[#2C221E]/5 border border-[#EAE4D8] mb-4">
                <Image
                  src={activeStyle.image}
                  alt={activeStyle.name}
                  fill
                  className="object-cover object-center"
                />

                {/* Wave Overlay Tag */}
                <div className="absolute inset-x-3 bottom-3 p-3 rounded-xl bg-white/90 backdrop-blur-md border border-white text-[11.5px] text-[#1C1917] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#9A7B56]" />
                    <span>Lining: <strong>{selectedLining.name.split('(')[0]}</strong></span>
                  </div>
                  <span className="text-[#2C221E] font-semibold">
                    {selectedMotor.id === 'manual' ? 'Manual Glide' : 'Somfy Smart'}
                  </span>
                </div>
              </div>

              {/* Price Estimation */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4D8] space-y-2 mb-5">
                <div className="flex items-center justify-between text-[12.5px] text-[#78716C]">
                  <span>Estimated Fabric & Tailoring:</span>
                  <span className="font-semibold text-[#1C1917]">
                    ₹{estimatedFabricCost.toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedMotor.addCost > 0 && (
                  <div className="flex items-center justify-between text-[12.5px] text-[#78716C]">
                    <span>Somfy Smart Automation System:</span>
                    <span className="font-semibold text-[#1C1917]">
                      ₹{selectedMotor.addCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#EAE4D8] flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#78716C] block">
                      Estimated Window Total:
                    </span>
                    <span className="text-[10px] text-[#8C827A]">
                      Incl. Double Hemming & Weighted Drops
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-[24px] sm:text-[28px] font-bold text-[#2C221E]">
                      ₹{estimatedTotal.toLocaleString('en-IN')}*
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Callouts */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#57534E] mb-5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2C221E] shrink-0" />
                  <span>146 Quality Checks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#2C221E] shrink-0" />
                  <span>5-Yr Motor Warranty</span>
                </div>
              </div>

              {/* High-Converting Actions: 1 Primary + 1 Secondary */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() =>
                    openBookingModal(
                      `Free In-Home Measurement — Configured: ${activeStyle.name} (${windowWidthFt}ft x ${windowDropFt}ft, ${fullness}x Fullness, ${selectedLining.name})`
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white font-semibold text-[13px] sm:text-[13.5px] shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>Book Free Laser Measurement</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openBookingModal(
                      `Doorstep Fabric & Sample Demo — Curtains: ${activeStyle.name}`
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#D5CCBA] text-[#1C1714] font-medium text-[12.5px] sm:text-[13px] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#823423]" />
                  <span>Request Fabric Swatches</span>
                </button>
              </div>

              <p className="text-[10px] text-[#A8A29E] text-center mt-3 leading-tight">
                *Approximate estimate. Exact yardage confirmed on-site by our laser measuring specialist with zero obligation.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
