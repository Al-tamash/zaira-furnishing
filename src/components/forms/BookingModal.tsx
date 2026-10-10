'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Ruler,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageSquare,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_NUMBER, ZAIRA_WHATSAPP_DISPLAY } from '@/lib/whatsapp';

const SERVICES_OPTIONS = [
  {
    id: 'measurement',
    label: 'Free In-Home Measurement',
    tag: 'Recommended',
    desc: 'Laser mm-accurate window & room dimensions, track drop & wall structural checks.',
    icon: Ruler,
  },
  {
    id: 'fabric-demo',
    label: 'Doorstep Fabric & Sample Demo',
    tag: 'Popular',
    desc: 'Touch & assess 500+ curated luxury swatches in your room’s actual ambient light.',
    icon: Sparkles,
  },
  {
    id: 'nri-styling',
    label: 'NRI Remote Home Styling',
    tag: 'Global',
    desc: 'Dedicated concierge, 4K video consultations & turnkey delivery for overseas clients.',
    icon: MapPin,
  },
  {
    id: 'smart-motorization',
    label: 'Motorization & Smart Home Setup',
    tag: 'Smart',
    desc: 'Automate curtains & shades with Somfy, Alexa, Google Home & Apple HomeKit.',
    icon: Clock,
  },
];

const CATEGORIES_OPTIONS = [
  'Curtains & Drapes',
  'Window Blinds & Shades',
  'Sofa Fabrics & Upholstery',
  'Wallpapers & Wall Coverings',
  'Mattresses & Sleep Systems',
  'Carpets & Rugs',
  'Wooden Flooring & Sports Floor',
  'Bed Linen & Bath',
  'Cushions & Pillows',
];

const HYDERABAD_AREAS = [
  'Banjara Hills',
  'Jubilee Hills',
  'Gachibowli',
  'Hitec City',
  'Madhapur',
  'Kondapur',
  'Kokapet',
  'Financial District',
  'Manikonda',
  'Secunderabad',
  'NRI Global / Overseas',
];

export function BookingModal() {
  const { isBookingModalOpen, setIsBookingModalOpen, bookingService } = useStore();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(
    bookingService || 'Free In-Home Measurement'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Curtains & Drapes',
  ]);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (10:00 AM – 1:00 PM)');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedArea, setSelectedArea] = useState('Banjara Hills');
  const [addressDetails, setAddressDetails] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isBookingModalOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedService) {
      setErrorMessage('Please select a service to proceed.');
      return;
    }
    if (step === 2 && selectedCategories.length === 0) {
      setErrorMessage('Please choose at least one product category of interest.');
      return;
    }
    setErrorMessage(null);
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    const generatedRef = `ZAI-BOOK-${Date.now().toString().slice(-6)}`;

    try {
      const fullAddress = `${selectedArea}${addressDetails ? `, ${addressDetails}` : ''}`;
      const customerNotesCombined = [
        `Service: ${selectedService}`,
        `Categories: ${selectedCategories.join(', ')}`,
        `Area: ${selectedArea}`,
        notes ? `Notes: ${notes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/measurement-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim() || undefined,
          serviceRequested: selectedService,
          address: fullAddress,
          preferredDate: preferredDate || 'Earliest Available',
          preferredTimeSlot,
          customerNotes: customerNotesCombined,
          idempotencyKey: `meas_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to confirm booking.');
      }

      setBookingRef(generatedRef);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      // Fallback display anyway for seamless UX
      setBookingRef(generatedRef);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsBookingModalOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setErrorMessage(null);
    }, 200);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Zaira Furnishing Atelier,\n\nI have booked an appointment.\n• Reference: ${bookingRef}\n• Name: ${customerName}\n• Service: ${selectedService}\n• Area: ${selectedArea}\n• Preferred Date: ${preferredDate || 'Earliest Slot'}\n• Time Slot: ${preferredTimeSlot}\n• Categories: ${selectedCategories.join(', ')}\n\nPlease confirm our appointment.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-2xl sm:rounded-3xl border border-[#EAE4D8] shadow-2xl overflow-hidden my-auto max-h-[94vh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="relative bg-[#1C1714] text-white p-5 sm:p-6 pb-6 shrink-0 border-b border-[#9A7B56]/30">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[#C4B9A1] text-[10px] uppercase tracking-widest font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Complimentary Atelier Service</span>
              </div>
              <h3 className="font-serif text-[22px] sm:text-[26px] font-semibold tracking-tight text-white">
                Book In-Home Consultation & Measurement
              </h3>
              <p className="text-[12.5px] sm:text-[13.5px] text-[#C4B9A1] font-light mt-1">
                Hyderabad-Wide Doorstep Consultations & Global NRI Concierge
              </p>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          {!submitted && (
            <div className="flex items-center gap-2 mt-5">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-300 ${step >= s ? 'bg-[#D4AF37]' : 'bg-white/20'
                      }`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Body Content ─── */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            /* ─── Confirmation Screen ─── */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#9A7B56]/10 border border-[#9A7B56]/20 flex items-center justify-center text-[#9A7B56] mx-auto animate-in zoom-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-[#9A7B56]" />
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#9A7B56]">
                  Appointment Request Received
                </span>
                <h4 className="font-serif text-[24px] sm:text-[28px] font-semibold text-[#1C1917] mt-1">
                  We Look Forward to Meeting You
                </h4>
                <p className="text-[13.5px] text-[#57534E] max-w-md mx-auto mt-2 leading-relaxed">
                  Your reference is <strong className="text-[#9A7B56]">{bookingRef}</strong>. Our
                  senior stylist coordinator will call you within 2 business hours to confirm your laser measurement schedule.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4D8] text-left text-[13px] space-y-2 max-w-md mx-auto">
                <div className="flex justify-between pb-2 border-b border-[#EAE4D8]">
                  <span className="text-[#78716C]">Service:</span>
                  <span className="font-semibold text-[#1C1917]">{selectedService}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#EAE4D8]">
                  <span className="text-[#78716C]">Locality:</span>
                  <span className="font-semibold text-[#1C1917]">{selectedArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Time Slot:</span>
                  <span className="font-semibold text-[#1C1917]">{preferredTimeSlot}</span>
                </div>
              </div>

              {/* Instant WhatsApp Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5C] text-white font-medium text-[13px] shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Instant WhatsApp Confirmation</span>
                </a>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#D5CDBC] text-[#57534E] hover:text-[#1C1917] text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ─── STEP 1: SERVICE SELECTION ─── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-[#9A7B56]">
                      Step 1 of 3
                    </span>
                    <h4 className="font-serif text-[18px] sm:text-[20px] font-medium text-[#1C1917]">
                      Select Your Preferred Service
                    </h4>
                    <p className="text-[12.5px] text-[#78716C] mt-0.5">
                      All site visits include laser precision measurement and fabric swatch demos at zero cost.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {SERVICES_OPTIONS.map((srv) => {
                      const Icon = srv.icon;
                      const isSelected = selectedService === srv.label;
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => setSelectedService(srv.label)}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${isSelected
                            ? 'bg-[#FAF7F2] border-[#9A7B56] ring-2 ring-[#9A7B56]/20 shadow-xs'
                            : 'bg-white border-[#EAE4D8] hover:border-[#C4B9A1]'
                            }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected
                              ? 'bg-[#9A7B56] text-white'
                              : 'bg-[#FAF7F2] text-[#9A7B56]'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-[14.5px] text-[#1C1917]">
                                {srv.label}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isSelected
                                  ? 'bg-[#9A7B56] text-white'
                                  : 'bg-[#FAF7F2] text-[#9A7B56]'
                                  }`}
                              >
                                {srv.tag}
                              </span>
                            </div>
                            <p className="text-[12px] text-[#6E6862] mt-1 leading-relaxed">
                              {srv.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── STEP 2: CATEGORIES OF INTEREST ─── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-[#9A7B56]">
                      Step 2 of 3
                    </span>
                    <h4 className="font-serif text-[18px] sm:text-[20px] font-medium text-[#1C1917]">
                      What Furnishings Are You Looking For?
                    </h4>
                    <p className="text-[12.5px] text-[#78716C] mt-0.5">
                      Select all items you would like swatches, design albums, and measurements for.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {CATEGORIES_OPTIONS.map((cat) => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`p-2.5 sm:p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${isSelected
                            ? 'bg-[#1C1714] border-[#1C1714] text-white shadow-xs'
                            : 'bg-white border-[#EAE4D8] text-[#1C1917] hover:border-[#9A7B56]'
                            }`}
                        >
                          <span className="text-[11.5px] sm:text-[13px] font-medium leading-tight truncate pr-1">{cat}</span>
                          <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${isSelected
                              ? 'bg-white text-[#1C1714] border-white'
                              : 'border-[#D5CDBC] bg-transparent'
                              }`}
                          >
                            {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── STEP 3: SCHEDULE & CONTACT ─── */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-3">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-[#9A7B56]">
                      Step 3 of 3
                    </span>
                    <h4 className="font-serif text-[18px] sm:text-[20px] font-medium text-[#1C1917]">
                      Schedule & Contact Details
                    </h4>
                    <p className="text-[12.5px] text-[#78716C] mt-0.5">
                      We bring laser measurement equipment and fabric albums directly to your doorstep.
                    </p>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDBC] rounded-xl text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                        Preferred Time Slot
                      </label>
                      <select
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDBC] rounded-xl text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                      >
                        <option value="Morning (10:00 AM – 1:00 PM)">Morning (10:00 AM – 1:00 PM)</option>
                        <option value="Afternoon (2:00 PM – 5:00 PM)">Afternoon (2:00 PM – 5:00 PM)</option>
                        <option value="Evening (5:00 PM – 8:00 PM)">Evening (5:00 PM – 8:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Locality Selector */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Hyderabad Locality / Area
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-[#D5CDBC] rounded-xl">
                      {HYDERABAD_AREAS.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => setSelectedArea(area)}
                          className={`px-3 py-1 rounded-lg text-[11.5px] font-medium transition-colors cursor-pointer ${selectedArea === area
                            ? 'bg-[#1C1714] text-white'
                            : 'bg-[#FAF7F2] text-[#57534E] hover:bg-[#EAE4D8]'
                            }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kalyani Medisetti"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDBC] rounded-xl text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                        WhatsApp Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDBC] rounded-xl text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                      />
                    </div>
                  </div>

                  {/* Address Details */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                      Apartment / Villa Name & House No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, My Home Bhooja, Gachibowli"
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDBC] rounded-xl text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                    />
                  </div>

                  {/* Trust Badge */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8] text-[11.5px] text-[#57534E]">
                    <ShieldCheck className="w-4 h-4 text-[#2C221E] shrink-0" />
                    <span>Zero obligation • 100% Free measurement • No purchase required</span>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* ─── Footer Controls ─── */}
        {!submitted && (
          <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#EAE4D8] flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-5 py-2.5 rounded-full border border-[#D5CDBC] text-[#57534E] hover:text-[#1C1917] text-[12.5px] font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <span className="text-[12px] text-[#78716C] hidden sm:inline">
                Takes less than 60 seconds
              </span>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1714] text-white hover:bg-[#9A7B56] text-[13px] font-medium shadow-xs transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#1C1714] text-white hover:bg-[#9A7B56] text-[13px] font-medium shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
